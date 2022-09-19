import { html } from "./libmd.ts";

export const WEBSITE = "https://lambdaurora.dev";
export const BUILD_DIR = "./build";
export const DEPLOY_DIR = BUILD_DIR + "/deploy";
export const SRC_DIR = "./src";
export const DECODER = new TextDecoder("utf-8");
export const ENCODER = new TextEncoder();
export const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

export async function create_parent_directory(path: string) {
	const path_parts = path.split("/");
	path_parts.splice(-1, 1);
	const parent_dir = path_parts.join("/");

	await Deno.mkdir(parent_dir, { recursive: true });
}

export function process_property_from_html(html_tree: html.Element, property: string, callback: (value: string) => void) {
	const token = property + ':';

	html_tree.children = html_tree.children.filter((node: html.Node) => {
		if (node instanceof html.Comment && (node as html.Comment).content?.startsWith(token)) {
			const content = (node as html.Comment).content as string;
			const value = content.substring(token.length).trim();
			callback(value);
			return false;
		}

		return true;
	});
}
