import { process_page } from "./page_processor.mjs";
import { DECODER, DEPLOY_DIR, ENCODER, create_parent_directory, process_property_from_html } from "./utils.mjs";
import { md, html } from "./libmd.mjs";
import * as PRISM from "./prismjs.mjs";

const BLOG_ROOT = "src/blog";

class ShortDate {
	constructor(year, month, day) {
		this.year = year;
		this.month = month;
		this.day = day;
	}

	toString() {
		return `${this.year}-${String(this.month).padStart(2, '0')}-${String(this.day).padStart(2, '0')}`;
	}

	equals(other) {
		if (other instanceof ShortDate) {
			return this.year === other.year && this.month === other.month && this.day === other.day;
		}

		return false;
	}
}

async function get_pretty_path(path, parent = "") {
	try {
		const file_info = await Deno.stat(BLOG_ROOT + parent + path);

		if (file_info.isDirectory) {
			const json = await Deno.readFile(BLOG_ROOT + parent + path + "/" + DIRECTORY_METADATA_FILE)
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

function get_metadata_html(authors, times) {
	const metadata_div = html.create_element("div").with_attr("class", "ls_article_metadata");
	const author_div = html.create_element("div").with_attr("class", "ls_article_authors");

	author_div.append_child(html.create_element("span").with_child("Authored by:"));

	for (const i in authors) {
		const author = authors[i];
		const a = html.create_element("authored_by")
			.with_attr("author_name", author.name);

		if (author.picture) {
			a.attr("author_picture", author.picture);
		}

		author_div.append_child(a);

		if (i != (authors.length - 1)) {
			author_div.append_child(", ");
		}
	}

	const times_div = html.create_element("div").with_attr("class", "ls_article_times");

	times_div.append_child(`Created ${times.creation_time.toString()}`);
	if (!times.creation_time.equals(times.modification_time)) {
		times_div.append_child(html.create_element("em").with_child(`&nbsp;(Modified ${times.modification_time.toString()})`));
	}

	metadata_div.append_child(author_div);
	metadata_div.append_child(times_div);

	return metadata_div;
}

async function process_blog_entry(path, context) {
	let title = await get_pretty_path(path);

	let page_description = null;
	const authors = [];
	const tags = [];
	const cws = [];
	const times = {
		creation_time: null,
		modification_time: await Deno.stat(`${context.root}/${path}`)
			.then(file => file.mtime)
			.then(date => new ShortDate(date.getFullYear(), date.getMonth() + 1, date.getDate()))
	};

	return await process_page(`/blog/${path.replace(/\.md$/, ".html")}`, {
		load_view: async function(_) {
			const view = html.create_element("html");
			const body = html.create_element("body");
			const main = html.create_element("main")
				.with_attr("class", "ls_sidenav_neighbor");

			const article = html.create_element("article");

			const doc = await Deno.readFile(`${context.root}/${path}`)
				.then(content => DECODER.decode(content))
				.then(content => md.parser.parse(content, { auto_link: true }));

			for (const block of doc.blocks) {
				if (block instanceof md.BlockCode && block.has_language()) {
					await PRISM.get_or_load_language(block.language.replace(/:apply$/, ""));
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
				image: {
					class_name: "ls_responsive_img"
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
					return false;
				}

				return true;
			});
			process_property_from_html(article, "description", value => page_description = value);
			process_property_from_html(article, "author", value => {
				const author = context.authors[value];
				if (!author) {
					throw new Error(`Could not find author "${value}"`);
				}

				authors.push(author);
			});
			process_property_from_html(article, "tag", value => {
				const tag_values = value.split(",");
				tag_values.map(v => v.trim().toLowerCase()).forEach(v => tags.push(v));
			});
			process_property_from_html(article, "cw", value => {
				const cw_values = value.split(",");
				cw_values.map(v => v.trim()).forEach(v => cws.push(v));
			})
			process_property_from_html(article, "date", value => {
				const date = value.split('-');
				times.creation_time = new ShortDate(parseInt(date[0]), parseInt(date[1]), parseInt(date[2]));
			});

			if (!page_description) {
				throw new Error("Missing blog entry description, please add a comment starting with \"description:\".");
			} else if (!times.creation_time) {
				throw new Error("Missing blog entry creation time, please add a comment starting with \"date:\".");
			}

			const article_metadata = html.create_element("div");

			article_metadata.append_child(html.create_element("h1").with_child(title));
			article_metadata.append_child(get_metadata_html(authors, times));

			article.children.splice(0, 0, article_metadata);
			article.children.splice(1, 0, html.create_element("hr"));

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

			main.append_child(article);
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
			const keywords = ["lambdaurora"];
			tags.forEach(tag => keywords.push(tag));

			return {
				page: {
					title: title,
					description: page_description,
					embed: {
						title: title
					},
					keywords: keywords
				},
				styles: [
					PRISM.get_prism_url("plugins/inline-color/prism-inline-color.min.css")
				]
			};
		}
	});
}

async function process_blog_index(entries) {
	const title = `Blog Posts Index`;

	return await process_page("/blog", {
		load_view: async function(_) {
			const view = html.create_element("html");
			const body = html.create_element("body");
			const main = html.create_element("main")
				.with_attr("class", "ls_sidenav_neighbor");

			const article = html.create_element("article")
				.with_attr("class", "ls_main_content");
			main.append_child(article);

			article.append_child(html.create_element("h1").with_child(new html.Text(title)));

			const nav = html.create_element("nav");
			article.append_child(nav);

			const ul = html.create_element("ul");
			nav.append_child(ul);

			entries.forEach(post => {
				const li = html.create_element("li")
					.with_child(html.create_element("a")
						.with_attr("href", post.path)
						.with_child(post.name)
					);
				ul.append_child(li);
			});

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
					description: `Index of blog posts by LambdAurora`,
					embed: {
						title: title
					}
				}
			};
		}
	});
}

export async function process_all_blog_entries(root = BLOG_ROOT) {
	const context = {
		root: root
	};
	const blog_entries = [];

	context.authors = await Deno.readFile(`${root}/authors.json`)
		.then(content => DECODER.decode(content))
		.then(content => JSON.parse(content));

	for await (const year_entry of Deno.readDir(root)) {
		if (year_entry.isDirectory) {
			const year = year_entry.name;

			for await (const month_entry of Deno.readDir(root + '/' + year)) {
				if (month_entry.isDirectory) {
					const month = month_entry.name;
					const month_path = `${year}/${month}`;

					for await (const entry of Deno.readDir(root + '/' + month_path)) {
						if (entry.isFile && entry.name.endsWith(".md")) {
							const path = `${month_path}/${entry.name}`;
							const html_path = `/blog/${path.replace(/\.md$/, ".html")}`;

							await process_blog_entry(path, context)
								.then(async function (page) {
									const deploy_path = DEPLOY_DIR + html_path;
									await create_parent_directory(deploy_path);
									await Deno.writeFile(deploy_path, ENCODER.encode(page.html()));
				
									const h1 = page.content[1].find_element_by_tag_name("h1");
									let name = await get_pretty_path(path);
				
									if (h1) {
										name = h1.text();
									}
				
									blog_entries.push({ path: html_path, name: name, year: year, month: month, page: page });
								});
						}
					}
				}
			}
		}
	}

	blog_entries.sort((a, b) => {
		if (a.year < b.year) return -1;
		else if (a.year > b.year) return 1;
		else if (a.month < b.month) return -1;
		else if (a.motnh > b.month) return 1;
		else return 0;
	});

	await process_blog_index(blog_entries.reverse())
		.then(async function (page) {
			const deploy_path = DEPLOY_DIR + "/blog/index.html";
			await create_parent_directory(deploy_path); // Shouldn't be needed.
			await Deno.writeFile(deploy_path, ENCODER.encode(page.html()))
		});
}

