/*
 * Copyright 2026 LambdAurora <email@lambdaurora.dev>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { crypto } from "@std/crypto";
import { encodeHex } from "@std/encoding/hex";
import { DECODER } from "../utils.ts";

export function concat_path(a: string, b: string) {
	if (a.endsWith("/")) {
		return a + b;
	} else {
		return a + "/" + b;
	}
}

/**
 * Gets the SHA-1 hash of the given file.
 *
 * @param path the path of the file
 * @returns the hash of the file
 */
export async function get_file_hash(path: string): Promise<string> {
	return await Deno.open(path, { read: true }).then((file) => crypto.subtle.digest("SHA-1", file.readable)).then((data) => encodeHex(DECODER.decode(data)));
}

async function collect_file_tree(path: string, callback: (path: string) => void): Promise<void> {
	const stat = await Deno.stat(path);

	if (stat.isDirectory) {
		for await (const entry of Deno.readDir(path)) {
			if (entry.isDirectory) {
				await collect_file_tree(concat_path(path, entry.name), callback);
			} else {
				callback(concat_path(path, entry.name));
			}
		}
	} else {
		callback(path);
	}
}

export async function hash_files(paths: string | string[]): Promise<string> {
	const tree: string[] = [];
	if (Array.isArray(paths)) {
		for (const path of paths) {
			await collect_file_tree(path, (entry) => tree.push(entry));
		}
	} else {
		await collect_file_tree(paths, (entry) => tree.push(entry));
	}

	const hashes = await Promise.all(tree.map(get_file_hash));

	return crypto.subtle.digest("SHA-1", new TextEncoder().encode(hashes.join(","))).then((data) => encodeHex(DECODER.decode(data)));
}
