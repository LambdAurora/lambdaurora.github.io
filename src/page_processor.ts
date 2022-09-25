// deno-lint-ignore-file no-explicit-any
import { html, md, utils } from "./libmd.ts";

import { COMPONENTS } from "./component.ts";
import { CONSTANTS } from "./constants.ts";
import { BUILD_DIR, DECODER, DEPLOY_DIR, ENCODER, create_parent_directory, AsyncFunction } from "./utils.ts";

const VIEWS_ROOT = "src/views";
const TEMPLATES_ROOT = "src/templates/";
const PAGE_TEMPLATE_PATH = TEMPLATES_ROOT + "page.html";
const VIEW_SCRIPTS_ROOT = BUILD_DIR + "/view_scripts";
let debug = false;

interface PreloadSpec {
	source: string;
	type: string;
}

interface HtmlConvertible {
	html: () => string;
}

type HtmlNode = html.Node & HtmlConvertible;
type PageModule = { [x: string]: any };

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
	return html.parse_nodes(await Deno.readFile(PAGE_TEMPLATE_PATH)
			.then(source => DECODER.decode(source))
		).filter(node => {
			if (node instanceof html.Element) {
				node.purge_empty_children();

				if (node.tag.name === "html" && debug) {
					node.append_child(html.parse(/*html*/`<script type="module">
		const protocol = window.location.protocol === "http:" ? "ws:" : "wss:";
		const ws = new WebSocket(protocol + window.location.host + "/debug/hotreloader");
		ws.addEventListener("open", e => console.log("Debug websocket connected."));
		ws.addEventListener("message", e => {
			if (e.data === "reload") {
				window.location.reload();
			}
		});
</script>`));
				}

				return true;
			}
			return false;
		});
}

function process_string(string: string, module: PageModule) {
	return string.replace(/\$\{([a-zA-Z0-9_.]+)\}/g, (_, name: string) => {
		const name_parts = name.split(".");
		let variable = module;

		for (const name of name_parts) {
			variable = variable[name];
		}

		return variable as unknown as string;
	});
}

function process_element(element: html.Node, parent: html.Element, module: PageModule) {
	if (element instanceof html.Text && parent.tag.escape_inside) {
		element.content = process_string((element as html.Text).content as string, module);
	} else if (element instanceof html.Element) {
		element.attributes = element.attributes.map(attr => html.create_attribute(attr.name, process_string(attr.value(), module)));

		element.children.forEach(child => process_element(child, element, module));
	}
}

/**
 * Processes the head HTML element from a page.
 *
 * @param {html.Element} page the content of the page
 * @param {PageModule} module the module of the page
 */
 function process_head(page: html.Element, style: html.Element | undefined, module: PageModule) {
	const head = page.children[0] as html.Element;
	process_element(head, page, module);

	if (!module.page.embed) {
		module.page.embed = {};
	}

	if (!module.page.embed.image) {
		module.page.embed.image = CONSTANTS.get_url(CONSTANTS.site_logo);
	}

	head.append_child(html.create_element("meta")
		.with_attr("property", "og:image")
		.with_attr("content", module.page.embed.image)
	);

	if (module.page.keywords) {
		head.append_child(html.create_element("meta")
			.with_attr("name", "keywords")
			.with_attr("content", module.page.keywords)
		);
	}

	if (module.page.icons) {
		if (module.page.icons.favicon) {
			head.append_child(html.create_element("link")
				.with_attr("rel", "shortcut icon")
				.with_attr("href", module.page.icons.favicon)
			);
		}
	}

	if (module.styles) {
		module.styles.forEach((style_data: string) => {
			head.append_child(html.create_element("link")
				.with_attr("rel", "stylesheet")
				.with_attr("type", "text/css")
				.with_attr("href", style_data)
			);
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
	return Deno.readFile(view_path)
		.then(source => DECODER.decode(source))
		.then(source => html.parse(source) as html.Element);
}

async function load_script(page_source: html.Element) {
	const func: (CONSTANTS: any, html: any, md: any) => Promise<PageModule> = new AsyncFunction("CONSTANTS", "html", "md",
		(page_source.get_element_by_tag_name("script")?.children[0] as html.Text).content
	);
	return await func(CONSTANTS, html, md);
}

interface PageProcessingSettings {
	load_view?: (view_path: string) => Promise<html.Node>;
	load_page_template?: () => Promise<html.Node[]>;
	load_script?: (page_source: html.Element) => (Promise<PageModule> | PageModule);
}

interface PageProcessingContext {
	global_context: any;
	load_view: (view_path: string) => Promise<html.Element>;
	load_page_template: () => Promise<html.Node[]>;
	load_script: (page_source: html.Element) => Promise<PageModule>;
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
	const context = utils.merge_objects(PROCESS_PAGE_SETTINGS, settings as Record<string, unknown>) as PageProcessingContext;

	const view_path = get_view_path(path);

	const results = await Promise.all([
		context.load_page_template(),
		context.load_view(view_path)
			.then((source: html.Element) => Promise.all([
				context.load_script(source),
				source.get_element_by_tag_name("body"),
				source.get_element_by_tag_name("style")
			]))
	]);

	const page = results[0] as HtmlNode[];
	const module = results[1][0] as PageModule;
	const body = results[1][1] as html.Element;
	const style = results[1][2];

	(page[1] as html.Element).children[1] = body;

	module.global_context = context.global_context;
	module.page.path = path.replace(/index.html$/, "");

	await (async function process_nodes(parent, index) {
		const node = parent.children[index];

		if (node instanceof html.Element) {
			const component = COMPONENTS.get(node.tag.name);

			if (component) {
				const nodes = await component.apply(module, node);
				parent.children.splice(index, 1, ...nodes);

				await process_nodes(parent, index);
				return;
			} else {
				if (node.children.length !== 0) {
					await process_nodes(node, 0);
				}
			}
		}

		if (index + 1 < parent.children.length) {
			await process_nodes(parent, index + 1);
		}
	})(body, 0);

	body.purge_empty_children();

	process_head(page[1] as html.Element, style, module);

	if (module.post_process) {
		await module.post_process(page[1]);
	}

	return {
		content: page,
		metadata: module,
		html: function() {
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
				.then(async function(page) {
					const deploy_path = DEPLOY_DIR + path;
					await create_parent_directory(deploy_path);
					await Deno.writeFile(deploy_path, ENCODER.encode(page.html()));
				});
		}
	}
}

export function enable_debug_pages() {
	debug = true;
}
