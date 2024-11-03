import { ViewSpec } from "../../../../../engine/view.ts";
import { ICON, KEYWORDS, TITLE } from "../../data.ts";

export const SPEC: ViewSpec = {
	page: {
		title: `${TITLE} - Entity Lighting Documentation`,
		description: "The LambDynamicLights documentation about entity lighting.",
		icons: {
			favicon: ICON
		},
		embed: {
			image: {
				url: `https://media.forgecdn.net/attachments/301/21/2020-07-04_22.png`,
				alt: "LambDynamicLights screenshot"
			},
			style: "large"
		},
		keywords: [...KEYWORDS, "documentation", "API", "resource pack", "entity"]
	}
};
