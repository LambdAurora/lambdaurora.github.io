import { ViewSpec } from "../../../../engine/view.ts";
import { title } from "../data.ts";
import { DOC_EMBED, make_post_process } from "./common.ts";

export const SPEC: ViewSpec = {
	page: {
		title: title + " - Metadata States Format",
		description: "Documentation of the state metadata files of LambdaBetterGrass.",
		icons: {
			favicon: "/images/projects/lambdabettergrass/icon_64.png"
		},
		embed: DOC_EMBED,
		keywords: ["LambdAurora", "LambdaBetterGrass", "Minecraft Mod", "documentation"]
	},
	post_process: make_post_process("documentation/METADATA_STATES_FORMAT.md")
};
