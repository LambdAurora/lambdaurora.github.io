import * as html from "@lambdaurora/libhtml";
import * as md from "@lambdaurora/libmd";
import { remove_comments, ViewSpec } from "../../../engine/view.ts";
import { CONSTANTS } from "../../../constants.ts";
import { create_common_markdown_parser_opts, create_common_markdown_render_opts } from "../../../utils.ts";

const title = "Affectionate";
const AFFECTIONATE_README = "https://raw.githubusercontent.com/LambdAurora/affectionate/1.20/README.md";

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
		title: title,
		description: "A Minecraft mod about player interactions, made for Modfest: Singularity.",
		icons: {
			favicon: "/images/projects/affectionate/icon_64.png"
		},
		embed: {
			title: title,
			image: {
				url: CONSTANTS.get_url("/images/projects/affectionate/affectionate.png"),
				alt: "Affectionate's icon"
			},
			style: "large"
		},
		keywords: ["LambdAurora", "Affectionate", "Minecraft Mod"]
	},
	async post_process(page: html.Element) {
		const main = page.find_element_by_tag_name("main") as html.Element;
		const article = main.get_element_by_tag_name("article") as html.Element;

		const readme = await fetch(AFFECTIONATE_README)
			.then(response => response.text())
			.then(text => md.parser.parse(text, create_common_markdown_parser_opts()));

		readme.blocks = remove_comments(readme.blocks);

		// deno-lint-ignore no-explicit-any
		(readme.blocks[1] as any).nodes = readme.blocks[1].children.filter((node: md.Node) => {
			if (node instanceof md.Image) {
				if (node.ref.url.startsWith("https://img.shields.io/badge/language-")
					|| node.ref.url.startsWith("https://img.shields.io/github/v/tag")) {
					return false;
				}
			}

			return true;
		});

		article.children = [];

		md.render_to_html(readme, create_common_markdown_render_opts({
			parent: article
		}));

		const first_p = article.find_element_by_tag_name("p") as html.Element;
		filter_badge_classes(first_p.children);
	}
};
