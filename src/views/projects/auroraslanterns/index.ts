import * as html from "@lambdaurora/libhtml";
import * as md from "@lambdaurora/libmd";
import { remove_comments, ViewSpec } from "../../../engine/view.ts";
import { create_common_markdown_parser_opts, create_common_markdown_render_opts } from "../../../utils.ts";
import { BRANCH, get_path, ICON, KEYWORDS, THUMBNAIL, TITLE } from "./data.ts";

const LBG_README = get_path("README.md");

function filter_badge_classes(nodes: html.Node[]) {
	nodes.forEach(node => {
		if (node instanceof html.ImageElement) {
			node.remove_attr("class");
		}

		if (node instanceof html.Element) {
			filter_badge_classes(node.children);
		}

		return node;
	});
}

export const SPEC: ViewSpec = {
	page: {
		title: TITLE,
		description: "A mod all about lanterns, focusing on small details.",
		icons: {
			favicon: ICON
		},
		embed: {
			image: {
				url: THUMBNAIL,
				alt: "Aurora's Lanterns overview screenshot"
			},
			style: "large"
		},
		keywords: KEYWORDS
	},
	async post_process(page: html.Element) {
		const main = page.find_element_by_tag_name("main") as html.Element;
		const article = main.get_element_by_tag_name("article") as html.Element;

		const readme = await fetch(LBG_README)
			.then(response => response.text())
			.then(text => md.parser.parse(text, create_common_markdown_parser_opts()));

		readme.blocks = remove_comments(readme.blocks);

		let should_remove = false;

		readme.blocks = readme.blocks.filter((block: md.BlockElement<md.Node>) => {
			if (block instanceof md.Heading) {
				should_remove = block.as_plain_text() === "Build";
			}

			if (should_remove) return false;

			// deno-lint-ignore no-explicit-any
			(block as any).nodes = block.children.filter((node: md.Node) => {
				if (node instanceof md.Image) {
					if (node.ref.url.startsWith("https://img.shields.io/badge/language-")
						|| node.ref.url.startsWith("https://img.shields.io/github/v/tag")) {
						return false;
					} else if (node.ref.url.startsWith("assets/")) {
						node.ref.url = `https://raw.githubusercontent.com/LambdAurora/AurorasLanterns/${BRANCH}/${node.ref.url}`;
					}
				} else if (node instanceof md.Link) {
					if (node.ref?.url?.startsWith("https://lambdaurora.dev")) {
						node.ref.url = node.ref.url.substring("https://lambdaurora.dev".length);
					}
				}

				return true;
			});

			return true;
		});

		article.children = [];

		md.render_to_html(readme, create_common_markdown_render_opts({
			parent: article
		}));

		const first_p = article.find_element_by_tag_name("p") as html.Element;
		filter_badge_classes(first_p.children);

		for (let i = 0; i < article.children.length; i++) {
			const child = article.children[i];

			if (child instanceof html.Element && child.tag.name === "iframe") {
				child.attr("class", "ls_article_iframe");
			}
		}

		const amethyst_lantern_heading = article.find_element_by_id("amethyst-lantern");
		if (amethyst_lantern_heading) fix_feature_presentation(article, amethyst_lantern_heading);
		const redstone_lantern_heading = article.find_element_by_id("redstone-lantern");
		if (redstone_lantern_heading) fix_redstone_lantern_images(article, redstone_lantern_heading);
		const wall_lanterns_heading = article.find_element_by_id("wall-lanterns");
		if (wall_lanterns_heading) fix_feature_presentation(article, wall_lanterns_heading);
	}
};

function fix_feature_presentation(article: html.Element, heading: html.Element) {
	const index = article.children.indexOf(heading);

	if (index === -1) {
		console.warn(`Failed to locate heading ${heading}.`);
	}

	const content: html.Element[] = [];
	let end_index = -1;

	for (let i = index + 1; i < article.children.length; i++) {
		const node = article.children[i];

		if (node instanceof html.Element) {
			if (node.tag.name.startsWith("h")) {
				end_index = i;
				break;
			} else {
				content.push(node);
			}
		}
	}

	let image_candidate: html.Element | null = null;
	const text = content.filter(node => {
		if (node.tag.name === "p") {
			const candidate = node.children.find(sub_node => sub_node instanceof html.Element && sub_node.tag.name === "img");

			if (candidate) {
				image_candidate = candidate as html.Element;
				return false;
			}
		}

		return true;
	});

	if (image_candidate === null) return;

	const image = image_candidate as html.Element;
	image.remove_attr("class");

	const div = html.div({
		style: {
			display: "flex",
			"flex-direction": "row",
			"align-items": "center",
		},
		children: [
			image_candidate!,
			html.div({
				children: text,
			}),
		],
	});
	article.children.splice(index + 1, end_index - index - 1, div);
}

function fix_redstone_lantern_images(article: html.Element, heading: html.Element) {
	const index = article.children.indexOf(heading);

	if (index === -1) {
		console.warn(`Failed to locate heading ${heading}.`);
	}

	for (let i = index + 1; i < article.children.length; i++) {
		const node = article.children[i];

		if (node instanceof html.Element) {
			if (node.tag.name.startsWith("h")) {
				break;
			} else if (node.tag.name === "p") {
				node.children.forEach(sub_node => {
					if (sub_node instanceof html.Element && sub_node.tag.name === "img") {
						const classes = sub_node.attr("class");
						classes.remove("ls_responsive_img");
						classes.add("ls_img");

						node.style("display", "flex");
						node.style("justify-content", "center");
					}
				});
			}
		}
	}
}
