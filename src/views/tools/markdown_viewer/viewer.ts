import { ViewSpec } from "../../../engine/view.ts";

export const SPEC: ViewSpec = {
	page: {
		title: "Yet Another Markdown Viewer",
		description: "A simple markdown viewer from a given source, using lib.md.",
		keywords: ["LambdAurora", "Markdown", "lib.md"]
	},
	styles: [
		{
			source: "https://cdn.jsdelivr.net/npm/emoji-js@3.6.0/lib/emoji.css"
		}
	]
};
