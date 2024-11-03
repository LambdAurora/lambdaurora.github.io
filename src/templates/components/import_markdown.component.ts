import * as html from "@lambdaurora/libhtml";
import { ComponentData } from "../../engine/component.ts";
import * as md from "@lambdaurora/libmd";
import { create_common_markdown_parser_opts, create_common_markdown_render_opts } from "../../utils.ts";
import { Prism } from "../../prismjs.ts";

const ImportMarkdown: ComponentData<{ path: string }> = {
	selector: "markdown:import",
	template: /*html*/ `<$content of="markdown" />`,
	render: async (ctx) => {
		const document = await Deno.readTextFile(ctx.args.path)
			.then(text => md.parser.parse(text, create_common_markdown_parser_opts()));

		return {
			markdown: md.render_to_html(document, create_common_markdown_render_opts({
				block_code: {
					highlighter: (code: string, language: string, parent: html.Element) => {
						if (Prism.languages[language]) {
							const stuff = html.parse("<pre><code>"
								+ Prism.highlight(code, Prism.languages[language], language)
								+ "</code></pre>") as html.Element;
							parent.children = stuff.get_element_by_tag_name("code")?.children as html.Node[];
						} else
							parent.append_child(new html.Text(code));
					}
				},
			})).children
		};
	}
};
export default ImportMarkdown;
