import { ViewSpec } from "../../engine/view.ts";

const title = "Projects";

export const SPEC: ViewSpec = {
	page: {
		title: `LambdAurora - ${title}`,
		description: "A list of some of my projects.",
		embed: {
			title: title
		},
		keywords: ["LambdAurora"]
	}
};
