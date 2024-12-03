import { ViewSpec } from "../../../../../engine/view.ts";
import { ICON, KEYWORDS, THUMBNAIL, TITLE } from "../../data.ts";

export const SPEC: ViewSpec = {
	page: {
		title: `${TITLE} - Documentation`,
		description: "The documentation index of LambDynamicLights v4.",
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
		keywords: [...KEYWORDS, "documentation", "API"]
	}
};
