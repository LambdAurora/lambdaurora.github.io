import {ViewSpec} from "../../../view.ts";
import {title} from "../data.ts";
import {DOC_EMBED, make_post_process} from "./common.ts";

export const SPEC: ViewSpec = {
	page: {
		title: title + " - Layer Method",
		description: "Documentation of the layer metadata files of LambdaBetterGrass.",
		icons: {
			favicon: "/images/projects/lambdabettergrass/icon_64.png"
		},
		embed: DOC_EMBED,
		keywords: ["LambdAurora", "LambdaBetterGrass", "Minecraft Mod", "documentation"]
	},
	post_process: make_post_process("documentation/LAYER_METHOD.md")
};
