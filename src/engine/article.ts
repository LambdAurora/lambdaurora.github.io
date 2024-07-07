import * as html from "@lambdaurora/libhtml";

/**
 * Processes the given heading element to insert the anchor link.
 *
 * @param node the heading element
 */
export function process_heading(node: html.Element): void {
	const id = node.get_attr("id")?.value;

	if (!id) {
		return;
	}

	const ref = `#${encodeURI(id)}`;

	const link = html.a({
		attributes: {
			class: "ls_heading_anchor",
			href: ref,
			"aria-label": `Anchor link: ${node.text()}`
		},
		children: [
			html.svg({
				attributes: {
					class: "ls_icon",
					ls_size: "small",
					viewBox: "0 0 16 16",
					version: "1.1",
					"aria-hidden": "true"
				},
				children: [
					html.create_element("path")
						.with_attr("d", "m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z")
				]
			})
		]
	});

	node.children.splice(0, 0, link);
}
