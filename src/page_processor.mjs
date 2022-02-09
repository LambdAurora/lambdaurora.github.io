import { html, utils } from "./libmd.mjs";

import { BUILD_DIR, DECODER, DEPLOY_DIR, ENCODER, create_parent_directory } from "./utils.mjs";

const VIEWS_ROOT = "src/views";
const TEMPLATES_ROOT = "src/templates/";
const PAGE_TEMPLATE_PATH = TEMPLATES_ROOT + "page.html";
const VIEW_SCRIPTS_ROOT = BUILD_DIR + "/view_scripts";

function get_relative_path(path) {
	if (path === "/404") {
		return path + ".html";
	} else if (path.endsWith(".html")) {
		return path;
	} else {
		return path + "/index.html";
	}
}

function get_view_path(path) {
	return VIEWS_ROOT + get_relative_path(path);
}

async function load_page_template() {
	return html.parse_nodes(await Deno.readFile(PAGE_TEMPLATE_PATH)
			.then(source => DECODER.decode(source))
		).filter(node => {
			if (node instanceof html.Element) {
				node.purge_empty_children();
				return true;
			}
			return false;
		});
}

function process_string(string, module) {
	return string.replace(/\$\{([a-zA-Z0-9_.]+)\}/, (_, name) => {
		const name_parts = name.split(".");
		let variable = module;

		for (const name of name_parts) {
			variable = variable[name];
		}

		return variable;
	});
}

function process_element(element, parent, module) {
	if (element instanceof html.Text && parent.tag.escape_inside) {
		element.content = process_string(element.content, module);
	} else if (element instanceof html.Element) {
		element.attributes = element.attributes.map(attr => html.create_attribute(attr.name, process_string(attr.value(), module)));

		element.children.forEach(child => process_element(child, element, module));
	}
}

/**
 * Processes the head HTML element from a page.
 *
 * @param {html.Element[]} page the content of the page
 * @param {Module} module the module of the page
 */
function process_head(page, style, module) {
	const head = page.children[0];
	process_element(head, page, module);

	if (module.page.embed && module.page.embed.image) {
		head.append_child(html.create_element("meta")
			.with_attr("property", "og:image")
			.with_attr("content", module.page.embed.image)
		);
	}

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
		module.styles.forEach(style_data => {
			head.append_child(html.create_element("link")
				.with_attr("rel", "stylesheet")
				.with_attr("type", "text/css")
				.with_attr("href", style_data)
			);
		});
	}

	if (style) {
		head.append_child(style);
	}
}

function load_view_file(view_path) {
	return Deno.readFile(view_path)
		.then(source => DECODER.decode(source))
		.then(source => html.parse(source));
}

const PROCESS_PAGE_SETTINGS = Object.freeze({
	load_view: load_view_file,
	load_page_template: load_page_template
});

/**
 * Processes a given page.
 *
 * @param path the path to the page
 * @param settings the processing settings
 * @returns the processed page
 */
export async function process_page(path, settings) {
	settings = utils.merge_objects(PROCESS_PAGE_SETTINGS, settings);

	const view_path = get_view_path(path);
	const view_script_path = VIEW_SCRIPTS_ROOT + path + ".mjs";

	const results = await Promise.all([
		settings.load_page_template(),
		settings.load_view(view_path)
			.then(source => Promise.all([
				create_parent_directory(VIEW_SCRIPTS_ROOT + path)
					.then(() => Deno.writeFile(view_script_path, ENCODER.encode(source
						.get_element_by_tag_name("script").children[0].content)))
					.then(() => import("../" + view_script_path)),
				source.get_element_by_tag_name("body"),
				source.get_element_by_tag_name("style")
			]))
	]);

	const page = results[0];
	const module = results[1][0];
	const body = results[1][1];
	const style = results[1][2];

	body.purge_empty_children();
	page[1].children[1] = body;

	module.page.path = path.replace(/index.html$/, "");

	process_head(page[1], style, module);

	return page;
}

export async function process_all_pages(directory = "") {
	for await (const dir_entry of Deno.readDir(VIEWS_ROOT + directory)) {
		if (dir_entry.isDirectory) {
			await process_all_pages("/" + dir_entry.name);
		} else {
			const path = directory + "/" + dir_entry.name;
			await process_page(path)
				.then(async function(page) {
					const deploy_path = DEPLOY_DIR + path;
					await create_parent_directory(deploy_path);
					await Deno.writeFile(deploy_path, ENCODER.encode(`${page[0].html()}\n${page[1].html()}`));
				});
		}
	}
}
