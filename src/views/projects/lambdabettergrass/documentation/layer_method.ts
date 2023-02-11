import {ViewSpec} from "../../../view.ts";
import {BRANCH, title} from "../data.ts";
import {make_post_process} from "./common.ts";

export const SPEC: ViewSpec = {
	page: {
		title: title + " - Layer Method",
		description: "Documentation of the layer metadata files of LambdaBetterGrass.",
		icons: {
			favicon: "/images/projects/lambdabettergrass/icon_64.png"
		},
		embed: {
			image: `https://raw.githubusercontent.com/LambdAurora/LambdaBetterGrass/${BRANCH}/images/pack.png`
		},
		keywords: ["LambdAurora", "LambdaBetterGrass", "Minecraft Mod", "documentation"]
	},
	post_process: make_post_process("documentation/LAYER_METHOD.md")
};
