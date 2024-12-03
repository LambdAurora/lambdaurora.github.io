import { ViewSpec } from "../../../../../engine/view.ts";
import { ICON, KEYWORDS, THUMBNAIL, TITLE } from "../../data.ts";

export const SPEC: ViewSpec = {
	page: {
		title: `${TITLE} - Entity Lighting Documentation`,
		description: "The LambDynamicLights documentation about entity lighting.",
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
		keywords: [...KEYWORDS, "documentation", "API", "resource pack", "entity"]
	}
};
