import { md, html } from "./libmd.mjs";
import { process_page } from "./page_processor.mjs";
import { DECODER, DEPLOY_DIR, ENCODER, create_parent_directory, get_prism_url } from "./utils.mjs";

import "https://cdn.jsdelivr.net/npm/prismjs@1.27/prism.min.js"

const PRISM_LANGS = {};

const TUTORIALS_ROOT = "src/tutorials";
const DIRECTORY_METADATA_FILE = "dir.json";

async function get_or_load_language(language) {
	if (PRISM_LANGS[language]) {
		return PRISM_LANGS[language];
	} else {
		try {
			return PRISM_LANGS[language] = await import(get_prism_url(`components/prism-${language}.min.js`));
		} catch (e) {
			return null;
		}
	}
}

async function get_pretty_path(path, parent = "") {
	try {
		const file_info = await Deno.stat(TUTORIALS_ROOT + parent + path);

		if (file_info.isDirectory) {
			const json = await Deno.readFile(TUTORIALS_ROOT + parent + path + "/" + DIRECTORY_METADATA_FILE)
				.then(content => DECODER.decode(content))
				.then(content => JSON.parse(content));

			if (json.name) {
				return json.name;
			}
		}
	} catch (error) {
		if (!(error instanceof Deno.errors.NotFound)) {
			throw error;
		}
	}

	return path.split("/").splice(1)
		.map(part => part.split("_")
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
		)
		.join(" / ").replace(/^\//, "").replace(/\.md$/, "");
}

async function process_tutorial(path) {
	let title = await get_pretty_path(path);

	let page_description = "A tutorial made by LambdAurora.";

	return await process_page("/tutorials" + path.replace(/\.md$/, ".html"), {
		load_view: async function(_) {
			const view = html.create_element("html");
			const body = html.create_element("body");
			const main = html.create_element("main")
				.with_attr("class", "ls_sidenav_neighbor");

			const article = html.create_element("article");
			main.append_child(article);

			const doc = await Deno.readFile(TUTORIALS_ROOT + path)
				.then(content => DECODER.decode(content))
				.then(content => md.parser.parse(content, { auto_link: true }));

			for (const block of doc.blocks) {
				if (block instanceof md.BlockCode && block.has_language()) {
					await get_or_load_language(block.language.replace(/:apply$/, ""));
				}
			}

			let style_source = "";

			article.children = md.render_to_html(doc, {
				block_code: {
					highlighter: (code, language, parent) => {
						if (language === "css:apply") {
							language = "css";

							style_source += code + "\n";
						}

						if (Prism.languages[language]) {
							const stuff = html.parse("<pre><code>"
								+ Prism.highlight(code, Prism.languages[language], language)
								+ "</code></pre>");
							parent.children = stuff.get_element_by_tag_name("code").children;
						} else
							parent.append_child(new html.Text(code, html.TextMode.RAW));
					}
				},
				table: {
					process: table => {
						table.with_attr("class", "ls_grid_table");
					}
				},
				parent: article
			}).children.filter(node => {
				if (node instanceof html.Element && node.tag.name === "h1") {
					title = node.text();
				} else if (node instanceof html.Comment) {
					if (node.content.startsWith("description:")) {
						page_description = node.content.substr("description:".length);
						return false;
					}
				}

				return true;
			});

			(function visit_block_code(element) {
				if (!(element instanceof html.Element)) {
					return;
				}

				if (element.tag.name === "pre") {
					const code = element.get_element_by_tag_name("code");

					if (code) {
						const classes = code.get_attr("class");

						if (classes && classes.value().includes("language-")) {
							element.with_attr("class", classes.value());
						}
					}
				} else {
					element.children.forEach(element => visit_block_code(element));
				}
			})(article);

			if (style_source.length !== 0) {
				view.with_child(html.create_element("style").with_child(new html.Text(style_source, html.TextMode.RAW)));
			}

			return view.with_child(body
				.with_child(html.parse(`<sidenav id="main_nav" navigation_data="src/nav/main_nav.json">
					<header>
						<main_nav_banner></main_nav_banner>
					</header>
				</sidenav>`))
				.with_child(main)
				.with_child(html.parse(`<app_footer class="ls_sidenav_neighbor"></app_footer>`))
			);
		},
		load_script: _ => {
			return {
				page: {
					title: title,
					description: page_description,
					embed: {
						title: title
					}
				},
				styles: [
					get_prism_url("themes/prism-tomorrow.min.css"),
					get_prism_url("plugins/inline-color/prism-inline-color.min.css")
				]
			};
		}
	});
}

async function process_tutorial_index(entry) {
	let index_name = "";
	if (entry.dir !== "") index_name = ` (${entry.name})`;

	const title = `Tutorials Index${index_name}`;

	return await process_page("/tutorials/" + entry.dir, {
		load_view: async function(_) {
			const view = html.create_element("html");
			const body = html.create_element("body");
			const main = html.create_element("main")
				.with_attr("class", "ls_main_content ls_sidenav_neighbor");

			const article = html.create_element("article");
			article.style("margin-top", "0");
			main.append_child(article);

			article.append_child(html.create_element("h1").with_child(new html.Text(title)));

			const nav = html.create_element("nav");
			article.append_child(nav);

			(function process_entry(e, p) {
				if (e.children.size === 0)
					return;

				const ul = html.create_element("ul");
				p.append_child(ul);

				e.children = e.children.sort((a, b) => a.name.localeCompare(b.name));

				e.children.forEach(child => {
					const li = html.create_element("li")
						.with_attr("class", "ls_nav_entry");

					if (child.dir) {
						if (child.children.length === 0) return;

						const details = html.create_element("details");
						details.append_child(html.create_element("summary")
							.with_child(new html.Text(child.name))
						);
						li.with_attr("class", "ls_nav_dir_entry")
							.append_child(details);

						if (child.children.filter(c => c.dir).length === 0 && child.children.length < 10
							|| !child.children.find(c => c.tutorial)) {
							details.with_attr("open");
						}

						process_entry(child, details);
					} else {
						const h1 = child.tutorial.content[1].find_element_by_tag_name("h1");
						const link = html.create_element("a")
							.with_attr("href", child.path);
						
						if (h1) {
							link.children = h1.children;
						} else {
							link.with_child(child.tutorial.metadata.page.title);
						}

						li.append_child(link);
					}

					ul.append_child(li);
				});
			})(entry, nav);

			return view.with_child(body
				.with_child(html.parse(`<sidenav id="main_nav" navigation_data="src/nav/main_nav.json">
					<header>
						<main_nav_banner></main_nav_banner>
					</header>
				</sidenav>`))
				.with_child(main)
				.with_child(html.parse(`<app_footer class="ls_sidenav_neighbor"></app_footer>`))
			);
		},
		load_script: _ => {
			return {
				page: {
					title: title,
					description: `Index of tutorials${index_name} by LambdAurora`,
					embed: {
						title: title
					}
				}
			};
		}
	});
}

export async function process_all_tutorials(entry = { dir: "", children: [] }) {
	const directory = entry.dir;

	for await (const dir_entry of Deno.readDir(TUTORIALS_ROOT + directory)) {
		if (dir_entry.isDirectory) {
			const path = "/" + dir_entry.name;
			const new_entry = { dir: directory + path, name: await get_pretty_path(path, directory), children: [] };
			entry.children.push(new_entry);

			await process_all_tutorials(new_entry);
		} else {
			if (dir_entry.name === DIRECTORY_METADATA_FILE || !dir_entry.name.includes(".md")) {
				continue;
			}

			const path = directory + "/" + dir_entry.name;
			const html_path = "/tutorials" + path.replace(/\.md$/, ".html");
			await process_tutorial(path)
				.then(async function(page) {
					const deploy_path = DEPLOY_DIR + html_path;
					await create_parent_directory(deploy_path);
					await Deno.writeFile(deploy_path, ENCODER.encode(page.html()));

					const h1 = page.content[1].find_element_by_tag_name("h1");
					let name = await get_pretty_path(path);

					if (h1) {
						name = h1.text();
					}

					entry.children.push({ path: html_path, name: name, tutorial: page });
				});
		}
	}

	if (entry.dir === "") {
		await process_tutorial_index(entry)
			.then(async function (page) {
				const deploy_path = DEPLOY_DIR + "/tutorials" + directory + "/index.html";
				await create_parent_directory(deploy_path); // Shouldn't be needed.
				await Deno.writeFile(deploy_path, ENCODER.encode(page.html()))
			});
	}
}
