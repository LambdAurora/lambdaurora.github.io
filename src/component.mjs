import { html, utils } from "./libmd.mjs";

export class Component {
	constructor(name, component_nodes) {
		this.name = name;

		for (const component_node of component_nodes) {
			if (component_node.tag.name === "body") {
				this.body = component_node;
			} else if (component_node.tag.name === "script") {
				this.processor = new Function("data", component_node.children[0].content);
			}
		}

		if (!this.body) {
			throw new Error("Missing body in component " + name + ".");
		}

		if (!this.processor) {
			throw new Error(`Missing script in component ${name}.`);
		}
	}

	apply(page, element) {
		const data = {
			name: this.name,
			element: element,
			page: page
		};

		const children = structuredClone(this.body.clone_children());

		function replace_visit(node, replacer) {
			if (node instanceof html.Element) {
				node.attributes = node.attributes.map(attr => {
					return html.create_attribute(replacer(attr.name, attr.value()))
				});

				node.children.forEach(child => replace_visit(child, replacer));
			} else if (node instanceof html.Text) {
				node.content = replacer(node.content);
			}
		}

		data.replace = (name, value) => {
			name = name.replace(/(\{|\}|\||\(|\)|\[|\])/, "\\$1");
			const regex = new RegExp(`\\$\\{${name}\\}`);

			const replacer = text => text.replace(regex, value);
			children.forEach(child => replace_visit(child, replacer));
		};

		this.processor(data);

		return children;
	}
}
