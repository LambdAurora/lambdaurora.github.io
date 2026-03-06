import { CONSTANTS } from "../../constants.ts";
import { ViewSpec } from "../../engine/view.ts";

const AVATAR = "/assets/avatar/layla.png";

export const SPEC: ViewSpec = {
	page: {
		title: "Layla",
		description: "Just my own little corner on this website.",
		keywords: ["LambdAurora"],
		theme_color: CONSTANTS.themes.layla.primary,
		icons: {
			favicon: AVATAR,
		},
		embed: {
			image: {
				url: CONSTANTS.get_url(AVATAR),
				alt: "Avatar of Layla."
			},
			style: "normal",
		},
		custom: {
			avatar: AVATAR,
		},
	},
};
