// deno-lint-ignore-file no-explicit-any
import { html } from "@lib.md/mod.mjs";
import { DECODER, AsyncFunction, is_escaped } from "./utils.ts";

const COMPONENTS_ROOT = "src/templates/components";

type ExpressionContext = { [x: string]: any }

class ExpressionError extends Error {
	constructor(file: string, cause: Error) {
		super(file + ": " + cause.message);
		this.cause = cause;
	}
}

async function process_expressions(file: string, text: string, context: ExpressionContext) {
	const executor = (source: string) => new AsyncFunction(...Object.keys(context),
		!source.includes(';') ? `return ${source};` : source
	);
	let i = 0;

	async function parse_expression(start: number) {
		let blocks = 0;
		let is_in_string = null;

		for (let j = start; j < text.length; j++) {
			if (text[j] === '{' && !is_in_string && !is_escaped(text, j)) {
				blocks++;
			} else if (text[j] === '}' && !is_in_string && !is_escaped(text, j)) {
				blocks--;

				if (blocks < 0) {
					const source = text.substring(start, j);
					try {
						const value = await executor(source)(...Object.values(context));
						return { end: j + 1, value: value };
					} catch (e) {
						throw new ExpressionError(file, e);
					}
				}
			} else if ((text[j] === '"' || text[j] === "'" || text[j] === '`') && !is_escaped(text, j)) {
				if (!is_in_string) {
					is_in_string = text[j];
				} else if (is_in_string === text[j]) {
					is_in_string = null;
				}
			}
		}

		return null;
	}

	while (i < text.length) {
		if (text[i] === '$' && text[i + 1] === '{' && !is_escaped(text, i)) {
			const result = await parse_expression(i + 2);

			if (result) {
				const begin = text.substring(0, i);
				const end = text.substring(result.end, text.length);
				text = begin + result.value + end;
				i = result.end;
				continue;
			}
		}

		i++;
	}

	return text;
}

export class Component {
	name: string;
	body: html.Element;
	processor: (html: any, data: any) => Promise<any>;

	constructor(name: string, component_nodes: html.Node[]) {
		this.name = name;
		let body = null;
		let processor = null;

		for (const component_node of component_nodes) {
			if (!(component_node instanceof html.Element))
				continue;

			if (component_node.tag.name === "body") {
				body = component_node;
			} else if (component_node.tag.name === "script") {
				processor = new AsyncFunction("html", "data", (component_node.children[0] as html.Text).content);
			}
		}

		if (!body) {
			throw new Error("Missing body in component " + name + ".");
		}

		this.body = body;
		this.body.purge_empty_children();

		if (!processor) {
			throw new Error(`Missing script in component ${name}.`);
		}

		this.processor = processor;
	}

	async apply(page: any, element: html.Element) {
		const data = new ComponentData(this.name, element, page, this.body.clone_children());

		async function process_nodes(parent: html.Node[], index: number) {
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

		const extra_data = await this.processor(html, data).catch(e => {
			console.error(`Failed to execute processor for component ${this.name} at ${COMPONENTS_ROOT + '/' + this.name}.`);
			throw e;
		});
		const classes = element.get_attr("class");
		const additional_classes = classes ? " " + classes.value() : "";
		const eval_context = {
			data: data,
			processed: extra_data,
			additional_classes: additional_classes
		};

		await (async function visit_expressions(nodes: html.Node[]) {
			for (const node of nodes) {
				if (node instanceof html.Element) {
					for (let i = 0; i < node.attributes.length; i++) {
						const attr = node.attributes[i];
						node.attributes[i] = html.create_attribute(attr.name,
							await process_expressions(data.name, attr.value(), eval_context)
						);
					}

					await visit_expressions(node.children);
				} else if (node instanceof html.Text) {
					node.content = await process_expressions(data.name, node.content as string, eval_context);
				}
			}
		})(data.nodes);

		await process_nodes(data.nodes, 0);

		return data.nodes;
	}
}

class ComponentData {
	name: string;
	element: html.Element;
	context: any;
	nodes: html.Node[];

	constructor(name: string, element: html.Element, context: any, nodes: html.Node[]) {
		this.name = name;
		this.element = element;
		this.context = context;
		this.nodes = nodes;
	}

	get_first_element() {
		return this.nodes.find(node => node instanceof html.Element) as html.Element | undefined;
	}

	get_element_by_index(index: number) {
		let found = -1;

		for (let i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i] instanceof html.Element) {
				found++;

				if (found === index) {
					return this.nodes[i] as html.Element;
				}
			}
		}

		return null;
	}

	do_with_attr(attr: string, callback: (value: html.Attribute | undefined) => void) {
		const value = this.element.get_attr(attr);

		if (value) {
			callback(value);
		}
	}

	copy_attr(attr: string) {
		this.do_with_attr(attr, value => this.get_first_element()?.attr(attr, value?.value()));
	}

	replace(name: string, value: string) {
		function replace_visit(node: html.Node, replacer: (text: string) => string) {
			if (node instanceof html.Element) {
				node.attributes = node.attributes.map(attr => {
					return html.create_attribute(replacer(attr.name), replacer(attr.value()))
				});

				node.children.forEach(child => replace_visit(child, replacer));
			} else if (node instanceof html.Text) {
				node.content = replacer(node.content as string);
			}
		}

		name = name.replace(/([{}|()\[\]])/, "\\$1");
		const regex = new RegExp(`\\$\\[${name}\\]`);

		const replacer = (text: string) => text.replace(regex, value);
		this.nodes.forEach(child => replace_visit(child, replacer));
	}
}

export const COMPONENTS = {
	root: COMPONENTS_ROOT,
	values: {} as { [x: string]: any },
	/**
	 * Gets a component by its name.
	 *
	 * @param {string} name the name of the component
	 * @return {Component|undefined} the component if it exists, otherwise {@code undefined}
	 */
	get(name: string): Component | undefined {
		return this.values[name];
	},
	load: async function(path: string) {
		const name = path.replace(/\.html$/, "").split("/").filter(part => part !== "").join("_");

		const nodes = await Deno.readFile(this.root + path)
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

		for await (const dir_entry of Deno.readDir(this.root + directory)) {
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
