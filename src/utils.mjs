import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { html } from "./libmd.mjs";

export const WEBSITE = "https://lambdaurora.dev";
export const BUILD_DIR = "./build";
export const DEPLOY_DIR = BUILD_DIR + "/deploy";
export const SRC_DIR = "./src";
export const DECODER = new TextDecoder("utf-8");
export const ENCODER = new TextEncoder();

export async function create_parent_directory(path) {
	const path_parts = path.split("/");
	path_parts.splice(-1, 1);
	const parent_dir = path_parts.join("/");

	if (!existsSync(parent_dir)) {
		await Deno.mkdir(parent_dir, { recursive: true });
	}
}

export function process_property_from_html(html_tree, property, callback) {
	const token = property + ':';

	html_tree.children = html_tree.children.filter(node => {
		if (node instanceof html.Comment && node.content.startsWith(token)) {
			const value = node.content.substr(token.length).trim();
			callback(value);
			return false;
		}

		return true;
	});
}
