import * as html from "@lambdaurora/libhtml";
import { ComponentData } from "../../engine/component.ts";

const ProjectCardComponent: ComponentData<{
	page?: string;
	source?: string;
	thumbnail?: string;
	thumbnail_darken?: string;
	logo?: string;
	logo_pixelated?: string
}> = {
	selector: "project_card",
	template: { path: "./project_card.html" },
	render: ({args}) => {
		const title = args.children.find(node => {
			if (node instanceof html.Element) {
				if (node.tag.name === "h3") {
					return true;
				}
			}

			return false;
		}) as html.Element;

		title.attr("aria-hidden", "true");

		const content: html.Node[] = [];
		let content_element: html.Element;

		if (args.thumbnail) {
			// If there's a thumbnail we use the card media with content component.
			content[0] = content_element = html.create_element("card:media_with_content")
							.with_attr("img", args.thumbnail)
							.with_attr("alt", "");

			if (args.thumbnail_darken) {
				content_element.attr("darken", args.thumbnail_darken);
			}
		} else if (args.logo) {
			// If there's a logo we use the normal card section to add in the logo.
			const classes = [ "project_logo_img" ];

			if ("logo_pixelated" in args) classes.push("ls_pixelated");

			const img = html.img({
				attributes: {
					src: args.logo,
					alt: "",
					class: classes,
				}
			});

			content[0] = html.create_element("card:section")
				.with_child(img)
				.with_child(content_element = html.div({ attributes: { class: "ls_card_content" } }));
		} else {
			// Otherwise we use a simple card content component.
			content[0] = content_element = html.create_element("card:content");
		}

		content_element.children = args.children;

		const actions: html.Node[] = [];

		if (args.page) {
			actions.push(html.a({
				attributes: {
					href: args.page,
					class: "ls_btn"
				},
				children: [ "View Page" ]
			}));
		}

		if (args.source) {
			actions.push(html.a({
				attributes: {
					href: args.source,
					class: "ls_btn"
				},
				children: [ "View Source" ]
			}));
		}

		return {
			...args,
			"aria-label": title.text(),
			content: content,
			actions: actions,
		};
	}
};
export default ProjectCardComponent;
