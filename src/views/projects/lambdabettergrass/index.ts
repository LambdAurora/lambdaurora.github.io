import * as html from "@lambdaurora/libhtml";
import * as md from "@lambdaurora/libmd";
import {remove_comments, ViewSpec} from "../../view.ts";
import {create_common_markdown_parser_opts, create_common_markdown_render_opts} from "../../../utils.ts";
import {BRANCH, get_path, title} from "./data.ts";
import { process_headings } from "../../../engine/article.ts";

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
		title: title,
		description: "A Minecraft mod which adds better grass and snow to the game. ",
		icons: {
			favicon: "/images/projects/lambdabettergrass/icon_64.png"
		},
		embed: {
			image: {
				url: `https://raw.githubusercontent.com/LambdAurora/LambdaBetterGrass/${BRANCH}/images/pack.png`,
				alt: "LambdaBetterGrass icon"
			},
			style: "large"
		},
		keywords: ["LambdAurora", "LambdaBetterGrass", "Minecraft Mod"]
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
					} else if (node.ref.url.startsWith("images/")) {
						node.ref.url = `https://raw.githubusercontent.com/LambdAurora/LambdaBetterGrass/${BRANCH}/${node.ref.url}`;
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

		process_headings(article, { exclude: ["h1"] });

		const first_p = article.find_element_by_tag_name("p") as html.Element;
		filter_badge_classes(first_p.children);
	}
};
