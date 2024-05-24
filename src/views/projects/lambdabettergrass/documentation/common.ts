import * as html from "@lambdaurora/libhtml";
import * as md from "@lambdaurora/libmd";
import {create_common_markdown_parser_opts, create_common_markdown_render_opts} from "../../../../utils.ts";
import {EmbedSpec, remove_comments} from "../../../view.ts";
import {get_path} from "../data.ts";
import {CONSTANTS} from "../../../../constants.ts";
import "../../../../prismjs.mjs";

export const DOC_EMBED: Partial<EmbedSpec> = {
	image: {
		url: CONSTANTS.get_url("/images/projects/lambdabettergrass/icon_64.png"),
		alt: "LambdaBetterGrass icon"
	}
};

export function make_post_process(file: string) {
	return async (page: html.Element) => {
		const main = page.find_element_by_tag_name("main") as html.Element;
		const div = main.get_element_by_tag_name("div") as html.Element;

		const readme = await fetch(get_path(file))
			.then(response => response.text())
			.then(text => md.parser.parse(text, create_common_markdown_parser_opts()));

		readme.blocks = remove_comments(readme.blocks);

		const regex = /^(?:https:\/\/github\.com\/LambdAurora\/LambdaBetterGrass\/blob\/1\.\d+(?:\.\d+)?\/documentation|\.)(\/[A-z_]+)\.md(#.+)?/;

		for (const block of readme.blocks) {
			block["nodes"] = block.children.filter((node: md.Node) => {
				if (node instanceof md.Link) {
					const result = regex.exec(node.ref.url);

					if (result) {
						if (result[1] === "/API") node.ref.url = "./";
						else {
							node.ref.url = `.${result[1].toLowerCase()}.html`;
							if (result[2]) node.ref.url += result[2];
						}
					}
				}

				return true;
			});
		}

		readme.references.forEach((ref: { name: string; ref: md.Reference; }) => {
			const result = regex.exec(ref.ref.url);

			if (result) {
				if (result[1] === "/API") ref.ref.url = "./";
				else {
					ref.ref.url = `.${result[1].toLowerCase()}.html`;
					if (result[2]) ref.ref.url += result[2];
				}
			}
		});

		div.children.pop();

		const container = md.render_to_html(readme, create_common_markdown_render_opts({
			block_code: {
				highlighter: (code: string, language: string, parent: html.Element) => {
					if (language === "css:apply") {
						language = "css";
					}

					if (Prism.languages[language]) {
						const stuff = html.parse("<pre><code>"
							+ Prism.highlight(code, Prism.languages[language], language)
							+ "</code></pre>") as html.Element;
						parent.children = stuff.get_element_by_tag_name("code")?.children as html.Node[];
					} else
						parent.append_child(new html.Text(code));
				}
			},
		}));

		(div.find_element_by_id("doc_content") as html.Element).children = container.children.filter(node => {
			return !(node instanceof html.Element && node.tag.name === "h1");
		});
	};
}
