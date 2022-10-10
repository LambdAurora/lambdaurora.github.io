import { process_page } from "./page_processor.ts";
import { DECODER, DEPLOY_DIR, ENCODER, create_parent_directory, process_property_from_html } from "./utils.ts";
import { md, html } from "@lib.md/mod.mjs";
import { CONSTANTS } from "./constants.ts";
import * as PRISM from "./prismjs.mjs";

const BLOG_ROOT = "src/blog";

function get_date_string(date) {
	return date.getFullYear()
		+ "-" + String(date.getMonth() + 1).padStart(2, '0')
		+ "-" + String(date.getDate()).padStart(2, '0');
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

		if (i !== (authors.length - 1)) {
			author_div.append_child(", ");
		}
	}

	const times_div = html.create_element("div").with_attr("class", "ls_article_times");

	times_div.append_child(`Created ${get_date_string(times.creation_time)}`);
	if (times.modification_time && times.creation_time !== times.modification_time) {
		times_div.append_child(html.create_element("em").with_child(/*html*/`&nbsp;(Modified ${get_date_string(times.modification_time)})`));
	}

	metadata_div.append_child(author_div);
	metadata_div.append_child(times_div);

	return metadata_div;
}

function get_tags_html(keywords) {
	if (keywords.length === 0) return "";
	const metadata_div = html.create_element("div").with_attr("class", "ls_article_metadata").style("margin-top", "0.2em");
	keywords.forEach(keyword => metadata_div.append_child(
		html.create_element("span")
			.with_attr("class", "ls_tag_ship")
			.style("background-color", "var(--ls_theme_primary)")
			.style("color", "var(--ls_theme_on_primary)")
			.with_child(html.create_element("span").with_child(keyword))
		)
	);
	return metadata_div.html();
}

async function process_blog_entry(path, context) {
	let title = await get_pretty_path(path);

	let page_description = null;
	let embed_image = undefined;
	const authors = [];
	const tags = [];
	const cws = [];
	const times = {
		creation_time: null,
		modification_time: null
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
							const stuff = html.parse(
								/*html*/`<pre><code>${Prism.highlight(code, Prism.languages[language], language)}</code></pre>`
							);
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
			process_property_from_html(article, "embed_image", value => {
				if (!value.startsWith("http")) value = CONSTANTS.get_url(value);
				embed_image = value;
			});
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
				times.creation_time = new Date(Date.parse(value));
			});
			process_property_from_html(article, "modified", value => {
				times.modification_time = new Date(Date.parse(value));
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
				.with_child(html.parse(/*html*/`<sidenav id="main_nav" navigation_data="src/nav/main_nav.json">
					<header>
						<main_nav_banner></main_nav_banner>
					</header>
				</sidenav>`))
				.with_child(main)
				.with_child(html.parse(/*html*/`<app_footer class="ls_sidenav_neighbor"></app_footer>`))
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
						title: title,
						image: embed_image
					},
					keywords: keywords,
					custom: {
						authors: authors,
						times: times,
						tags: tags
					}
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
		load_view: function(_) {
			const view = html.create_element("html");
			const body = html.create_element("body");
			const main = html.create_element("main")
				.with_attr("class", "ls_sidenav_neighbor");

			const article = html.create_element("article")
				.with_attr("class", "ls_main_content");
			main.append_child(article);

			html.parse(/*html*/`<h1>${title}</h1>
			<p><a href="/blog/feed.xml">RSS feed</a></p>`, article);

			const nav = html.create_element("nav");
			nav.style("display", "flex");
			nav.style("flex-direction", "column");
			article.append_child(nav);

			entries.forEach(post => {
				const metadata = post.page.metadata;
				const card = html.parse(/*html*/`<card href="${post.path}"
						style="margin-top: 1em; margin-bottom: 1em;" tags="${metadata.page.custom.tags.join(", ")}">
						<card_content>
							<h2>${post.name}</h2>
							${get_metadata_html(metadata.page.custom.authors, metadata.page.custom.times).html()}
							${get_tags_html(metadata.page.custom.tags)}
							<p>${metadata.page.description}</p>
						</card_content>
					</card>`);
				nav.append_child(card);
			});

			return new Promise((resolver) => resolver(view.with_child(body
				.with_child(html.parse(/*html*/`<sidenav id="main_nav" navigation_data="src/nav/main_nav.json">
					<header>
						<main_nav_banner></main_nav_banner>
					</header>
				</sidenav>`))
				.with_child(main)
				.with_child(html.parse(/*html*/`<app_footer class="ls_sidenav_neighbor"></app_footer>`))
			)));
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

const rss_tag = {
	name: "rss",
	required_attributes: Object.freeze(["version"]),
	self_closing: false,
	parse_inside: true,
	escape_inside: true,
	preserve_format: false,
	inline: false,
	create: function() {
		return new html.Element(this);
	}
};
const channel_tag = {
	name: "channel",
	required_attributes: Object.freeze([]),
	self_closing: false,
	parse_inside: true,
	escape_inside: true,
	preserve_format: false,
	inline: false,
	create: function() {
		return new html.Element(this);
	}
};
const item_tag = {
	name: "item",
	required_attributes: Object.freeze([]),
	self_closing: false,
	parse_inside: true,
	escape_inside: true,
	preserve_format: false,
	inline: false,
	create: function() {
		return new html.Element(this);
	}
};

async function generate_rss_feed(entries) {
	const channel = channel_tag.create();
	const rss = rss_tag.create()
		.with_attr("version", "2.0")
		.with_child(channel);

	const link_tag = {
		name: "link",
		required_attributes: Object.freeze([]),
		self_closing: false,
		parse_inside: true,
		escape_inside: true,
		preserve_format: false,
		inline: true,
		create: function() {
			return new html.Element(this);
		}
	};

	channel.with_child(html.create_element("title").with_child("LambdAurora's Blog"))
		.with_child(html.create_element("description").with_child("A personal and random blog!"))
		.with_child(link_tag.create().with_child(CONSTANTS.get_url("/blog")))
		.with_child(html.create_element("language").with_child("en-us"))
		.with_child(html.create_element("pubDate").with_child(entries[0].page.metadata.page.custom.times.creation_time.toUTCString()))

	entries.forEach(post => {
		channel.append_child(item_tag.create()
			.with_child(html.create_element("title").with_child(post.name))
			.with_child(html.create_element("guid").with_child(post.path))
			.with_child(link_tag.create().with_child(CONSTANTS.get_url(post.path)))
			.with_child(html.create_element("description").with_child(post.page.metadata.page.description))
			.with_child(html.create_element("pubDate").with_child(post.page.metadata.page.custom.times.creation_time.toUTCString()))
		);
	});

	await Deno.writeFile(DEPLOY_DIR + "/blog/feed.xml", ENCODER.encode(rss.html()));
}

export async function process_all_blog_entries(root = BLOG_ROOT) {
	const context = {
		root: root
	};
	let blog_entries = [];

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

									const metadata = page.metadata;
									blog_entries.push({
										path: html_path,
										name: name,
										time: metadata.page.custom.times.creation_time,
										page: page
									});
								});
						}
					}
				}
			}
		}
	}

	blog_entries = blog_entries.sort((a, b) => {
		if (a < b) return -1;
		else if (a > b) return 1;
		else return 0;
	}).reverse();

	await process_blog_index(blog_entries)
		.then(async function (page) {
			const deploy_path = DEPLOY_DIR + "/blog/index.html";
			await create_parent_directory(deploy_path); // Shouldn't be needed.
			await Deno.writeFile(deploy_path, ENCODER.encode(page.html()))
		});
	await generate_rss_feed(blog_entries);
}

