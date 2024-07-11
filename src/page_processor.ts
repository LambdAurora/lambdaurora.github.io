// deno-lint-ignore-file no-explicit-any
import * as html from "@lambdaurora/libhtml";
import { CONSTANTS } from "./constants.ts";
import { create_parent_directory, DEPLOY_DIR, get_file_hash } from "./utils.ts";
import { PreloadSpec, resolve_embed, StyleSpecEntry, ViewSpec } from "./views/view.ts";
import { PageSpec } from "./engine/page.ts";
import { ComponentContext, process_nodes } from "./engine/component.ts";

const VIEWS_ROOT = "src/views";
const TEMPLATES_ROOT = "src/templates/";
const PAGE_TEMPLATE_PATH = TEMPLATES_ROOT + "page.html";
let debug = false;

export class PageProcessError extends Error {
	constructor(path: string, message: string) {
		super(`Error at ${path}: ${message}`);
	}
}

interface HtmlConvertible {
	html: () => string;
}

type HtmlNode = html.Node & HtmlConvertible;

interface PageData extends PageSpec {
	path: string;
}

interface ViewData extends ViewSpec {
	page: PageData;
	global_context: unknown;
}

function get_relative_path(path: string) {
	if (path === "/404") {
		return path + ".html";
	} else if (path.endsWith(".html")) {
		return path;
	} else {
		return path + "/index.html";
	}
}

function get_view_path(path: string) {
	return VIEWS_ROOT + get_relative_path(path);
}

async function load_page_template() {
	return html.parse_nodes(await Deno.readTextFile(PAGE_TEMPLATE_PATH))
		.filter(node => {
			if (node instanceof html.Element) {
				node.purge_blank_children();

				if (node.tag.name === "html" && debug) {
					node.append_child(html.parse(/*html*/`<script type="module">
		const protocol = window.location.protocol === "http:" ? "ws:" : "wss:";
		function initiate_connection() {
			const ws = new WebSocket(protocol + window.location.host + "/debug/hotreloader");
			ws.addEventListener("open", e => console.log("Debug websocket connected."));
			ws.addEventListener("message", e => {
				if (e.data === "reload") {
					window.location.reload();
				}
			});
			ws.addEventListener("close", e => {
				setTimeout(1000, () => {
					initiate_connection();
				})
			})
		}
		initiate_connection();
</script>`));
				}

				return true;
			}
			return false;
		});
}

function process_string(string: string, module: ViewSpec) {
	return string.replace(/\$\{([a-zA-Z\d_.]+)}/g, (original: string, name: string) => {
		const name_parts = name.split(".");
		let variable: unknown = module;

		for (const name of name_parts) {
			variable = (variable as { [x: string]: string })[name];

			if (!variable) {
				return original;
			}
		}

		return variable as unknown as string;
	});
}

function process_element(element: html.Node, parent: html.Element, module: ViewSpec) {
	if (element instanceof html.Text && parent.tag.escape_inside) {
		element.content = process_string((element as html.Text).content as string, module);
	} else if (element instanceof html.Element) {
		if (element.tag.name === "script") return;

		element.attributes = element.attributes.map(attr => html.create_attribute(attr.name, process_string(attr.value, module)));

		element.children.forEach(child => process_element(child, element, module));
	}
}

/**
 * Processes the head HTML element from a page.
 *
 * @param page the content of the page
 * @param style the style element of the page if present
 * @param module the module of the page
 */
function process_head(page: html.Element, style: html.Element | undefined, module: ViewSpec) {
	const embed = resolve_embed(module.page);
	module.page.embed = embed;

	const head = page.children[0] as html.Element;
	process_element(head, page, module);
	process_element(page.children[1] as html.Element, page, module);

	head.append_child(html.create_element("meta")
		.with_attr("property", "og:image")
		.with_attr("content", embed.image.url)
	);
	head.append_child(html.create_element("meta")
		.with_attr("property", "og:image:alt")
		.with_attr("content", embed.image.alt)
	);

	if (embed.style === "large") {
		head.append_child(html.create_element("meta")
			.with_attr("property", "twitter:card")
			.with_attr("content", "summary_large_image")
		);
	}

	if (module.page.keywords) {
		head.append_child(html.create_element("meta")
			.with_attr("name", "keywords")
			.with_attr("content", module.page.keywords.join(", "))
		);
	}

	const favicon = module.page?.icons?.favicon ?? "/images/art/avatar_2022_02_no_bg.png";
	head.append_child(html.create_element("link")
		.with_attr("rel", "shortcut icon")
		.with_attr("href", favicon)
	);

	if (module.styles) {
		module.styles.forEach((style_data: StyleSpecEntry) => {
			if (typeof style_data === "string") {
				style_data = {
					source: style_data
				};
			}

			const link_el = html.create_element("link")
				.with_attr("rel", "stylesheet")
				.with_attr("type", "text/css")
				.with_attr("href", style_data.source);
			head.append_child(link_el);

			if (style_data.hash) {
				link_el.attr("integrity", style_data.hash);
			}
			if (style_data.cross_origin) {
				link_el.attr("crossorigin", style_data.cross_origin);
			}
		});
	}

	if (module.preload) {
		module.preload.forEach((preload: PreloadSpec) => {
			head.append_child(html.create_element("link")
				.with_attr("rel", "preload")
				.with_attr("href", preload.source)
				.with_attr("as", preload.type));
		});
	}

	if (style) {
		head.append_child(style);
	}
}

function load_view_file(view_path: string) {
	return Deno.readTextFile(view_path)
		.then(source => html.parse(source) as html.Element);
}

async function load_script(view_path: string): Promise<ViewSpec> {
	view_path = view_path.replace(/\.html$/, ".ts");

	const hash = await get_file_hash(view_path);

	return await import("." + view_path.replace(/^src/, "") + "#" + encodeURIComponent(hash)).then(module => module.SPEC as ViewSpec);
}

interface PageProcessingSettings {
	load_view?: (view_path: string) => Promise<html.Node>;
	load_page_template?: () => Promise<html.Node[]>;
	load_script?: (view_path: string) => (Promise<ViewSpec> | ViewSpec);
}

interface PageProcessingContext {
	global_context: any;
	load_view: (view_path: string) => Promise<html.Element>;
	load_page_template: () => Promise<html.Node[]>;
	load_script: (view_path: string) => Promise<ViewSpec>;
}

const PROCESS_PAGE_SETTINGS = Object.freeze({
	global_context: CONSTANTS,
	load_view: load_view_file,
	load_page_template: load_page_template,
	load_script: load_script
});

/**
 * Processes a given page.
 *
 * @param path the path to the page
 * @param settings the processing settings
 * @returns the processed page
 */
export async function process_page(path: string, settings?: PageProcessingSettings) {
	const context = html.merge_objects(PROCESS_PAGE_SETTINGS, settings as Record<string, unknown>) as PageProcessingContext;

	const view_path = get_view_path(path);

	const results = await Promise.all([
		context.load_page_template(),
		context.load_view(view_path)
			.then((source: html.Element) => Promise.all([
				context.load_script(view_path),
				source.get_element_by_tag_name("body"),
				source.get_element_by_tag_name("style")
			]))
	]);

	const page = results[0] as HtmlNode[];
	const module = results[1][0] as ViewData;
	const body = results[1][1] as html.Element;
	const style = results[1][2];

	(page[1] as html.Element).children[1] = body;

	module.global_context = context.global_context;
	module.page.path = path.replace(/index.html$/, "");

	const process_context = new ComponentContext(module.page, {});
	body.children = await process_nodes(body.children, process_context);

	module.preload = (module.preload ?? []).concat(process_context.preload);

	body.purge_blank_children();

	process_head(page[1] as html.Element, style, module);

	if (module.post_process) {
		await module.post_process(page[1] as html.Element);
	}

	return {
		content: page,
		metadata: module,
		html: function () {
			return this.content.map(e => e.html()).join("\n");
		}
	};
}

export async function process_all_pages(directory = "") {
	for await (const dir_entry of Deno.readDir(VIEWS_ROOT + directory)) {
		if (dir_entry.isDirectory) {
			await process_all_pages(directory + "/" + dir_entry.name);
		} else {
			if (!dir_entry.name.endsWith(".html")) continue;

			const path = directory + "/" + dir_entry.name;
			await process_page(path)
				.then(async function (page) {
					const deploy_path = DEPLOY_DIR + path;
					await create_parent_directory(deploy_path);
					await Deno.writeTextFile(deploy_path, page.html());
				});
		}
	}
}

export function enable_debug_pages() {
	debug = true;
}
