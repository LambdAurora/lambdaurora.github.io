/*
 * Copyright 2024 LambdAurora <email@lambdaurora.dev>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import * as html from "@lambdaurora/libhtml";
import { Application } from "./app.ts";
import { ComponentContext, process_nodes } from "./component.ts";
import { PageData, PreloadEntrySpec, StyleEntrySpec } from "./page_data.ts";
import { resolve_embed, ViewSpec } from "./view.ts";
import { create_parent_directory, get_file_hash } from "../utils.ts";
import { OutputKind } from "./build_tool/build.ts";

export class PagesContext {
	constructor(
		public readonly app: Application,
		public readonly template_path: string,
		public readonly views_root: string,
	) {}

	get_view_path(path: string) {
		return this.views_root + get_relative_path(path);
	}

	async load_page_template(): Promise<html.Node[]> {
		return html.parse_nodes(await Deno.readTextFile(this.template_path))
			.filter((node) => {
				if (node instanceof html.Element) {
					node.purge_blank_children();

					if (node.tag.name === "html" && this.app.debug) {
						node.append_child(html.parse(/*html*/ `<script type="module">
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
			});
		});
	}
	initiate_connection();
</script>`));
					}

					return true;
				}

				return false;
			});
	}
}

export class PageProcessError extends Error {
	constructor(path: string, message: string) {
		super(`Error at ${path}: ${message}`);
	}
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

interface ViewData extends ViewSpec {
	page: PageData;
	app: Application;
}

/**
 * Processes the head HTML element from a page.
 *
 * @param page the content of the page
 * @param style the style element of the page if present
 * @param module the module of the page
 */
async function process_head(
	app: Application,
	process_context: ComponentContext<object>,
	page: html.Element,
	style: html.Element | undefined,
	module: ViewSpec,
) {
	const embed = resolve_embed(app, module.page);
	module.page.embed = embed;

	const head = page.children[0] as html.Element;
	head.children = await process_nodes(head.children, process_context.fork({
		app: app
	}));

	if (embed.image) {
		head.append_child(html.meta({
			attributes: {
				property: "og:image",
				content: embed.image.url
			}
		}));
		head.append_child(html.meta({
			attributes: {
				property: "og:image:alt",
				content: embed.image.alt
			}
		}));
	}

	if (embed.video) {
		head.append_child(html.meta({
			attributes: {
				property: "og:video:url",
				content: embed.video.url
			}
		}));
		head.append_child(html.meta({
			attributes: {
				property: "og:video:secure_url",
				content: embed.video.url
			}
		}));
		head.append_child(html.meta({
			attributes: {
				property: "og:video:type",
				content: embed.video.type
			}
		}));
		head.append_child(html.meta({
			attributes: {
				property: "og:video:width",
				content: String(embed.video.width)
			}
		}));
		head.append_child(html.meta({
			attributes: {
				property: "og:video:height",
				content: String(embed.video.height)
			}
		}));
	}

	if (embed.style === "large") {
		head.append_child(
			html.create_element("meta")
				.with_attr("property", "twitter:card")
				.with_attr("content", "summary_large_image"),
		);
	}

	if (module.page.keywords) {
		head.append_child(
			html.create_element("meta")
				.with_attr("name", "keywords")
				.with_attr("content", module.page.keywords.join(", ")),
		);
	}

	const favicon = module.page?.icons?.favicon ?? app.logo;
	if (favicon) {
		head.append_child(html.link({
			attributes: {
				rel: "shortcut icon",
				href: favicon
			}
		}));
	}

	if (module.styles) {
		module.styles.forEach((style_data: StyleEntrySpec) => {
			if (typeof style_data === "string") {
				style_data = {
					source: style_data,
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
		module.preload.forEach((preload: PreloadEntrySpec) => {
			head.append_child(
				html.create_element("link")
					.with_attr("rel", "preload")
					.with_attr("href", preload.source)
					.with_attr("as", preload.type),
			);
		});
	}

	if (style) {
		head.append_child(style);
	}
}

async function load_view_file(view_path: string) {
	const source = await Deno.readTextFile(view_path);
	return html.parse(source) as html.Element;
}

async function load_script(view_path: string): Promise<ViewSpec> {
	view_path = view_path.replace(/\.html$/, ".ts");

	const hash = await get_file_hash(view_path);

	return await import(
		`file://${Deno.cwd()}/${view_path}#${encodeURIComponent(hash)}`
	).then((module) => module.SPEC as ViewSpec);
}

interface PageProcessingSettings {
	load_view?: (view_path: string) => Promise<html.Node>;
	load_script?: (view_path: string) => Promise<ViewSpec> | ViewSpec;
}

interface PageProcessingContext {
	load_view: (view_path: string) => Promise<html.Element>;
	load_script: (view_path: string) => Promise<ViewSpec>;
}

const PROCESS_PAGE_SETTINGS = Object.freeze({
	load_view: load_view_file,
	load_script: load_script,
});

/**
 * Processes a given page.
 *
 * @param path the path to the page
 * @param settings the processing settings
 * @returns the processed page
 */
export async function process_page(
	path: string,
	pages_context: PagesContext,
	settings?: PageProcessingSettings,
) {
	const context = html.merge_objects(
		PROCESS_PAGE_SETTINGS,
		settings as Record<string, unknown>,
	) as PageProcessingContext;

	const view_path = pages_context.get_view_path(path);

	const results = await Promise.all([
		pages_context.load_page_template(),
		context.load_view(view_path)
			.then((source: html.Element) =>
				Promise.all([
					context.load_script(view_path),
					source.get_element_by_tag_name("body"),
					source.get_element_by_tag_name("style"),
				])
			),
	]);

	const page = results[0] as html.Node[];
	const module = results[1][0] as ViewData;
	const body = results[1][1] as html.Element;
	const style = results[1][2];

	(page[1] as html.Element).children[1] = body;

	module.app = pages_context.app;
	module.page.path = path.replace(/index.html$/, "");

	const process_context = new ComponentContext(module.page, {});
	body.children = await process_nodes(body.children, process_context);

	module.preload = [...new Set((module.preload ?? []).concat(process_context.preload))];

	body.purge_blank_children();

	await process_head(
		pages_context.app,
		process_context,
		page[1] as html.Element,
		style,
		module
	);

	if (module.post_process) {
		await module.post_process(page[1] as html.Element);
	}

	return {
		content: page,
		metadata: module,
		html: function () {
			return this.content.map((e) => e.html()).join("\n");
		},
	};
}

export async function process_all_pages(
	context: PagesContext,
	root_dir: string,
	output_dir: string,
): Promise<{ path: string; kind?: OutputKind }[]> {
	const output_files: { path: string; kind?: OutputKind }[] = [];
	await process_directory(
		context,
		root_dir,
		output_dir,
		(path, kind) => output_files.push({ path: path, kind: kind }),
	);
	return output_files;
}

async function process_directory(
	context: PagesContext,
	root_dir: string,
	output_dir: string,
	push_output: (path: string, kind?: OutputKind) => void,
	directory = "",
) {
	for await (const dir_entry of Deno.readDir(root_dir + directory)) {
		if (dir_entry.isDirectory) {
			await process_directory(
				context,
				root_dir,
				output_dir,
				push_output,
				`${directory}/${dir_entry.name}`,
			);
		} else {
			if (!dir_entry.name.endsWith(".html")) continue;

			const path = `${directory}/${dir_entry.name}`;
			const promise = process_page(path, context)
				.then(async (page) => {
					const deploy_path = output_dir + path;
					await create_parent_directory(deploy_path);
					await Deno.writeTextFile(deploy_path, page.html());
					push_output(deploy_path);
				});
				
			if (context.app.debug) {
				await promise.catch(reason => {
					console.error(`Failed to process page ${path}.`);
					console.error(reason);
				});
			} else {
				await promise;
			}
		}
	}
}
