import {ViewSpec} from "../view.ts";

const title = "Quilt Import Utility";

export const SPEC: ViewSpec = {
	page: {
		title: title,
		description: "Utilities to import Quilt stuff in your mod projects.",
		icons: {
			favicon: "https://quiltmc.org/favicon/favicon.ico"
		},
		embed: {
			title: title,
			image: "https://quiltmc.org/assets/img/logo.svg"
		},
		keywords: ["LambdAurora", "Minecraft", "Quilt", "QuiltMC", "modding"]
	},
	styles: [
		"https://cdn.jsdelivr.net/npm/prismjs@1.26.0/plugins/toolbar/prism-toolbar.min.css"
	]
};
