import { html, utils } from "./libmd.mjs";
import { DECODER } from "./utils.mjs";

const COMPONENTS_ROOT = "src/templates/components";
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

export class Component {
	constructor(name, component_nodes) {
		this.name = name;

		for (const component_node of component_nodes) {
			if (!(component_node instanceof html.Element))
				continue;

			if (component_node.tag.name === "body") {
				this.body = component_node;
			} else if (component_node.tag.name === "script") {
				this.processor = new AsyncFunction("html", "data", component_node.children[0].content);
			}
		}

		if (!this.body) {
			throw new Error("Missing body in component " + name + ".");
		}

		this.body.purge_empty_children();

		if (!this.processor) {
			throw new Error(`Missing script in component ${name}.`);
		}
	}

	async apply(page, element) {
		const data = {
			name: this.name,
			element: element,
			context: page,
			nodes: this.body.clone_children(),
			get_first_element() {
				return this.nodes.find(node => node instanceof html.Element);
			},
			do_with_attr(attr, callback) {
				const value = this.element.get_attr(attr);

				if (value) {
					callback(value);
				}
			},
			copy_attr(attr) {
				this.do_with_attr(attr, value => this.get_first_element().attr(attr, value.value()));
			},
			apply_additional_classes() {
				const classes = this.element.get_attr("class");

				if (classes) {
					this.replace("additional_classes", " " + classes.value());
				} else {
					this.replace("additional_classes", "");
				}
			}
		};

		async function process_nodes(parent, index) {
			const node = parent[index];
	
			if (node instanceof html.Element) {
				const component = COMPONENTS.get(node.tag.name);
	
				if (component) {
					parent.splice(index, 1, ...(await component.apply(page, node)));
	
					await process_nodes(parent, index);
					return;
				} else {
					if (node.children.length !== 0) {
						await process_nodes(node.children, 0);
					}
	
					if (index + 1 < parent.length) {
						await process_nodes(parent, index + 1);
					}
				}
			}
		}
		await process_nodes(element.children, 0);

		function replace_visit(node, replacer) {
			if (node instanceof html.Element) {
				node.attributes = node.attributes.map(attr => {
					return html.create_attribute(replacer(attr.name), replacer(attr.value()))
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
			data.nodes.forEach(child => replace_visit(child, replacer));
		};

		await this.processor(html, data);

		await process_nodes(data.nodes, 0);

		return data.nodes;
	}
}

export const COMPONENTS = {
	values: {},
	/**
	 * Gets a component by its name.
	 *
	 * @param {string} name the name of the component
	 * @return {Component|undefined} the component if it exists, otherwise {@code undefined}
	 */
	get: function(name) {
		return this.values[name];
	},
	load: async function(path) {
		const name = path.replace(/\.html$/, "").split("/").filter(part => part !== "").join("_");

		const nodes = await Deno.readFile(COMPONENTS_ROOT + path)
			.then(content => DECODER.decode(content))
			.then(content => html.parse_nodes(content));

		const component = new Component(name, nodes);

		this.values[name] = component;
		return component;
	},
	load_all: async function(directory = "") {
		if (directory === "") {
			this.values = {};
		}

		const to_load = [];

		for await (const dir_entry of Deno.readDir(COMPONENTS_ROOT + directory)) {
			if (dir_entry.isDirectory) {
				await this.load_all("/" + dir_entry.name);
			} else {
				const path = directory + "/" + dir_entry.name;
				to_load.push(this.load(path));
			}
		}

		await Promise.all(to_load);
	}
};
