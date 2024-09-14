/*
 * Copyright 2024 LambdAurora <email@lambdaurora.dev>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// deno-lint-ignore-file no-explicit-any
import * as html from "@lambdaurora/libhtml";
import { get_file_hash } from "../utils.ts";
import { PageData, PreloadEntrySpec } from "./page_data.ts";
import { dirname, resolve, toFileUrl } from "@std/path";

/**
 * Represents the base arguments that a component can expect.
 */
export interface ComponentBaseArgs {
	readonly children: html.Node[];
	readonly class?: string[];
	readonly style?: Record<string, string | number>;
}

export type ComponentPostProcessor = (nodes: html.Node[]) => void;

/**
 * Represents the component context for rendering.
 */
export class ComponentContext<Args> {
	public readonly page: PageData;
	/**
	 * The arguments given to the component.
	 */
	public readonly args: Args;
	public readonly preload: PreloadEntrySpec[];
	private post_processor?: ComponentPostProcessor;

	constructor(page: PageData, args: Args, preload: PreloadEntrySpec[] = []) {
		this.page = page;
		this.args = {
			page: page,
			...args
		};
		this.preload = preload;
	}

	public register_post_process(processor: ComponentPostProcessor): void {
		this.post_processor = processor;
	}

	public post_process(nodes: html.Node[]): void {
		if (this.post_processor) {
			this.post_processor(nodes);
		}
	}

	/**
	 * Forks this context with a new set of arguments.
	 *
	 * @param args the arguments
	 * @returns the forked context
	 */
	public fork<NewArgs>(args: NewArgs): ComponentContext<NewArgs> {
		return new ComponentContext(this.page, args, this.preload);
	}
}

/**
 * Represents a template path.
 */
export interface TemplatePath {
	/**
	 * The path to the template.
	 */
	path: string;
}

/**
 * Represents the data of a component.
 */
export interface ComponentData<Args> {
	/**
	 * The selector used for this component.
	 */
	selector: string;
	/**
	 * The template or the path to the template of this component.
	 */
	template: string | TemplatePath;
	/**
	 * Provides the necessary properties for component rendering.
	 *
	 * @param context the component context
	 * @returns the properties for component rendering
	 */
	render: (context: ComponentContext<ComponentBaseArgs & Args>) => Promise<object> | object;
}

/**
 * Represents a component.
 */
export class Component {
	constructor(
		private readonly data: ComponentData<unknown>,
		private readonly template: html.Element
	) {
		this.template.purge_blank_children();
	}

	/**
	 * Gets a clone of the template node.
	 *
	 * @returns the template node
	 */
	public use_template(): html.Node[] {
		return this.template.clone().children;
	}

	/**
	 * Creates the context for this component given the current rendering context.
	 *
	 * @param context the rendering context
	 * @returns the component-bound context
	 */
	public async render(context: ComponentContext<ComponentBaseArgs>): Promise<object> {
		return await this.data.render(context);
	}
}

function get_interpreted_attr(attr: html.Attribute<unknown>): { name: string } | null {
	if (attr.name.startsWith("[") && attr.name.endsWith("]")) {
		return {
			name: attr.name.substring(1, attr.name.length - 1)
		};
	}

	return null;
}

/**
 * Processes the given group of nodes.
 *
 * @param nodes the nodes to process
 * @param context the current context
 * @returns the processed nodes
 */
export async function process_nodes(nodes: html.Node[], context: ComponentContext<unknown>): Promise<html.Node[]> {
	const processed = await Promise.all(
		nodes.map(node => process(node, context))
	);
	return processed.flatMap(child => child);
}

/**
 * Processes the given node.
 *
 * @param node the node to process
 * @param context the current context
 * @returns the processed node or nodes
 */
export async function process(node: html.Node, context: ComponentContext<any>): Promise<html.Node | html.Node[]> {
	if (node instanceof html.Text) {
		// Process text.
		const regex = /\$\{([a-z_\-\$][a-z0-9_\-\$\.]*?)\}/ig;
		node.content = node.content.replaceAll(regex, (content, name: string) => {
			if (name.includes(".")) {
				const path = name.split(".");
				let current = context.args;

				for (const part of path) {
					if (part in current) {
						current = current[part];
					} else {
						current = undefined;
						break;
					}
				}

				if (current !== undefined) {
					return current;
				}
			}

			if (name in context.args) {
				return context.args[name];
			}

			return content;
		});
	} else if (node instanceof html.Element) {
		// Process elements.
		const component = COMPONENTS.get(node.tag.name);

		if (component) {
			// We got a component, let's process it!
			const component_args: ComponentBaseArgs & Record<string, any> = {
				children: await process_nodes(node.children, context),
			};

			// We collect the arguments by going through the attributes.
			node.attributes.forEach(attribute => {
				let name = attribute.name;
				let value = attribute.real_value;

				const interpreted_attr = get_interpreted_attr(attribute);
				if (interpreted_attr) {
					name = interpreted_attr.name;
					value = context.args[name];
				}

				component_args[name] = value;
			});

			// We create the context for processing the component.
			const render_context = context.fork(component_args);
			// Then we build the properties of the component for processing its template.
			const rendered_props = await component.render(render_context);
			// Then we process its template.
			const rendered_nodes = await process_nodes(component.use_template(), render_context.fork(rendered_props));
			render_context.post_process(rendered_nodes);
			// And voilà, we got the processed nodes to replace the component node.
			return rendered_nodes;
		} else if (node.tag.name === "$content") {
			// We got a special token: a $content token.
			// Its goal is to be replaced by whatever nodes it is provided.
			// We got two cases: an "of" $content for which the variable in which the nodes are stored is provided
			// And the other case is when no "of" attribute is provided, the $content node is replaced by the children provided to the component.
			const of_attr = node.get_attr("of");

			if (of_attr) {
				const name = of_attr.value;

				if (name in context.args) {
					let nodes = context.args[name] as (html.Node | html.Node[]) ?? [];
				
					if (!(nodes instanceof Array)) {
						nodes = [ nodes ];
					}

					return await process_nodes(nodes, context);
				} else {
					return [];
				}
			} else if ("children" in context.args) {
				return context.args.children as html.Node[];
			}
		}

		// If none of the special processing cases happen, we're left with a regular element which still needs its attributes and children processed.

		const to_add: { name: string; value: any; }[] = [];
		const to_remove: string[] = [];

		for (const attribute of node.attributes) {
			const interpreted_attr = get_interpreted_attr(attribute);

			if (interpreted_attr) {
				const value = attribute.value;
				let resolved_value;

				if (value === "") {
					// If no value is provided to an interpreted attribute then its name is the property we're looking for.
					resolved_value = context.args[interpreted_attr.name];
				} else if (value.match(/^[a-z_\-\$][a-z0-9_\-\$]*$/i)) {
					// If the value matches a simple property name, we can simply do a lookup.
					resolved_value = context.args[value];
				} else {
					// The value provided is much complex, we interpret it using a function.
					try {
						const func = new Function("props", `return ${value};`);
						resolved_value = func(context.args);
					} catch (e) {
						console.error(`Failed to evaluate expression \`${value}\`.`, e);
						resolved_value = undefined;
					}
				}
 
				if (resolved_value !== undefined) {
					to_add.push({ name: interpreted_attr.name, value: resolved_value });
				}
				to_remove.push(attribute.name);
			}
		}
		
		to_add.forEach(({ name, value }) => node.attr(name, value));
		to_remove.forEach(attr => node.remove_attr(attr));

		// And finally, we process the element's children.
		node.children = await process_nodes(node.children, context);
	}

	return node;
}

const COMPONENTS_ROOT = "./src/templates/components";

export const COMPONENTS = {
	root: COMPONENTS_ROOT,
	values: {} as { [x: string]: Component },
	/**
	 * Gets a component by its name.
	 *
	 * @param name the name of the component
	 * @return the component if it exists, otherwise {@code undefined}
	 */
	get(name: string): Component | undefined {
		return this.values[name];
	},
	load: async function(path: string) {
		const hash = await get_file_hash(path);
		const absolute_path = resolve(path);
		const path_url = toFileUrl(absolute_path).toString();

		const component_data = await import(`${path_url}#${encodeURI(hash)}`).then(module => module.default as ComponentData<unknown>);

		let template: string;
		if (typeof component_data.template === "string") template = component_data.template;
		else {
			const dir = dirname(absolute_path);
			const template_path = resolve(dir, component_data.template.path);

			template = await Deno.readTextFile(template_path);
		}

		const template_node = html.create_element("$template");
		html.parse(template, template_node);

		const component = new Component(component_data, template_node);

		this.values[component_data.selector] = component;
		return component;
	},
	load_all: async function(directory = COMPONENTS_ROOT) {
		if (directory === "") {
			this.values = {};
		}

		const to_load = [];

		for await (const dir_entry of Deno.readDir(directory)) {
			const path = `${directory}/${dir_entry.name}`;

			if (dir_entry.isDirectory) {
				await this.load_all(path);
			} else {
				if (path.endsWith(".component.ts")) {
					to_load.push(this.load(path));
				}
			}
		}

		await Promise.all(to_load);
	}
};
