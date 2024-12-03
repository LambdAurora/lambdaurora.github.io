import { ViewSpec } from "../../../../../engine/view.ts";
import { ICON, KEYWORDS, THUMBNAIL, TITLE } from "../../data.ts";

export const SPEC: ViewSpec = {
	page: {
		title: `${TITLE} - Modding Interfaces Documentation`,
		description: "The LambDynamicLights documentation about modding interfaces.",
		icons: {
			favicon: ICON
		},
		embed: {
			image: {
				url: THUMBNAIL,
				alt: "LambDynamicLights screenshot"
			},
			style: "large"
		},
		keywords: [...KEYWORDS, "documentation", "API", "Java"]
	}
};
