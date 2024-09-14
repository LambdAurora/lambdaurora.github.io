import { ViewSpec } from "../engine/view.ts";

const title = "404 Not Found";

export const SPEC: ViewSpec = {
	page: {
		title: "LambdAurora - " + title,
		description: "I don't think there's anything there.",
		embed: {
			title: title
		}
	}
};
