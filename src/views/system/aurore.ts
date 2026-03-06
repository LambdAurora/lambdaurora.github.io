import { CONSTANTS } from "../../constants.ts";
import { ViewSpec } from "../../engine/view.ts";

const AVATAR = "/assets/avatar/aurore.png";

export const SPEC: ViewSpec = {
	page: {
		title: "Aurore",
		description: "Just my own little corner on this website.",
		keywords: ["LambdAurora"],
		icons: {
			favicon: "/assets/avatar/aurore_transparent.png",
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
