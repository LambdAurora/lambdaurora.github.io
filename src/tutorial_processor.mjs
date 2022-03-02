import { md, html } from "./libmd.mjs";
import { process_page } from "./page_processor.mjs";
import { DECODER, DEPLOY_DIR, ENCODER, create_parent_directory, get_prism_url } from "./utils.mjs";

import "https://cdn.jsdelivr.net/npm/prismjs@1.27/prism.min.js"

const PRISM_LANGS = {};

const TUTORIALS_ROOT = "src/tutorials";

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

async function process_tutorial(path) {
	const title = path.split("/").splice(1)
		.map(part => part.split("_")
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ")
		)
		.join(" / ").replace(/^\//, "").replace(/\.md$/, "");

	let page_description = "A tutorial made by LambdAurora";

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
					await get_or_load_language(block.language);
				}
			}

			article.children = md.render_to_html(doc, {
				block_code: {
					highlighter: (code, language, parent) => {
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
				if (node instanceof html.Comment) {
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

			return view.with_child(body
				.with_child(html.parse(`<sidenav id="main_nav" navigation_data="src/nav/main_nav.json">
					<header>
						<main_nav_banner></main_nav_banner>
					</header>
				</sidenav>`))
				.with_child(main)
				.with_child(html.parse(`<footer class="ls_app_footer ls_sidenav_neighbor">
					<div class="ls_app_footer_license">
						<span>
							Hosted on <a href="https://pages.github.com">GitHub Pages</a>.
						</span>
						<span>
							Except where otherwise noted: &copy; LambdAurora 2022, under <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">CC-BY 4.0</a>.
						</span>
					</div>
				</footer>`))
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

export async function process_all_tutorials(directory = "") {
	for await (const dir_entry of Deno.readDir(TUTORIALS_ROOT + directory)) {
		if (dir_entry.isDirectory) {
			await process_all_tutorials("/" + dir_entry.name);
		} else {
			const path = directory + "/" + dir_entry.name;
			await process_tutorial(path)
				.then(async function(page) {
					const deploy_path = DEPLOY_DIR + "/tutorials" + path.replace(/\.md$/, ".html");
					await create_parent_directory(deploy_path);
					await Deno.writeFile(deploy_path, ENCODER.encode(`${page[0].html()}\n${page[1].html()}`));
				});
		}
	}
}
