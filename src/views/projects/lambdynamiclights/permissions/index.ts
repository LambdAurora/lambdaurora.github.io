import { ViewSpec } from "../../../../engine/view.ts";
import { ICON, KEYWORDS, THUMBNAIL, TITLE } from "../data.ts";

export const SPEC: ViewSpec = {
	page: {
		title: TITLE,
		description: "Distribution permission repository for LambDynamicLights. Got a doubt on whether someone is redistributing the mod legitimately? This is the place to check.",
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
		keywords: KEYWORDS
	}
};
