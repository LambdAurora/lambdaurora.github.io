import { existsSync } from "https://deno.land/std/fs/mod.ts";

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
		await Deno.mkdir(parent_dir);
	}
}
