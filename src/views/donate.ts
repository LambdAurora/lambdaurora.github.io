import { ViewSpec } from "../engine/view.ts";

const title = "Donate";

export const SPEC: ViewSpec = {
	page: {
		title: "LambdAurora - " + title,
		description: "Enjoy my work? Here are some ways you can support me and my work.",
		embed: {
			title: title
		}
	}
};
