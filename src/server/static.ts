/*
 * Copyright 2024 LambdAurora <email@lambdaurora.dev>
 *
 * This file is part of lambdawebserver.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import * as path from "@std/path";
import { Middleware } from "./engine.ts";
import { serveFile } from "@std/http/file-server";
import { STATUS_CODE } from "@std/http/status";

/**
 * Represents the file path mode.
 */
export type FilePathMode = "strict" | "redirect_to_html" | "serve_without_html_ext";

/**
 * Represents the option for the static file serving middleware.
 */
export interface StaticFileServingOptions {
	/**
	 * `true` if folder paths are accepted and redirect to their respective `index.html` files, or `false` otherwise.
	 *
	 * @default true
	 */
	folder_path_to_index?: boolean;
	/**
	 * Determines how file paths that don't have a direct hit are handled if the accepted content type is HTML.
	 *
	 * @default "redirect_to_html"
	 */
	file_path_without_html_ext?: FilePathMode;
	/**
	 * `true` if brotli variants of files should be searched and sent instead when possible, or `false` otherwise
	 *
	 * @default true
	 */
	brotli?: boolean;
}

/**
 * Creates a middleware serving the files from the given root path.
 *
 * @param root_path the root path where the files reside
 * @param options the serving options
 * @returns the middleware
 */
export function serve_files(root_path: string, options?: StaticFileServingOptions): Middleware {
	const known_options = {
		folder_path_to_index: true,
		file_path_without_html_ext: "redirect_to_html",
		brotli: true,
	};
	if (options) Object.assign(known_options, options);

	// Important to not false-positive on the later normalize test.
	root_path = path.normalize(root_path);

	return async (request, next) => {
		const accept_html = request.headers.get("accept")?.includes("text/html");
		let file_path = decodeURIComponent(request.url.pathname);
		const expect_directory = file_path.endsWith("/");
		let should_try_directory = known_options.folder_path_to_index;

		if (!path.normalize(root_path + file_path).startsWith(root_path)) {
			// Someone tried to sneak up and access files outside the root directory.
			return await next();
		}

		async function test_file(path: string) {
			// Try opening the file.
			try {
				const file = await Deno.open(root_path + path, { read: true });
				const stat = await file.stat();
				file.close();

				return stat.isFile;
			} catch {
				return false;
			}
		}

		async function attempt_to_serve_with_html_ext(p: string) {
			if (known_options.file_path_without_html_ext === "redirect_to_html") {
				return Response.redirect(new URL(p, request.url));
			} else {
				return await attempt_to_serve(p);
			}
		}

		async function attempt_to_serve(p: string) {
			return await serveFile(request.request, root_path + p);
		}

		if (expect_directory) {
			if (!accept_html) {
				// The client wants a non-HTML file but gave a directory path.
				// We cannot predict exactly what file it wants then, so give up.
				return await next();
			}

			should_try_directory = false;

			if (known_options.folder_path_to_index) {
				const search_path = file_path + "index.html";

				if (await test_file(search_path)) {
					// Hooray, we found the index file.
					return await attempt_to_serve(search_path);
				} else if (known_options.file_path_without_html_ext !== "strict") {
					const new_path = file_path.replace(/\/$/, ".html");
					// We're not in strict mode, so we can try a file with the same name!
					if (await test_file(new_path)) {
						return await attempt_to_serve_with_html_ext(new_path);
					}
				} else return await next(); // It's in strict mode, we're out of luck.
			}

			if (known_options.file_path_without_html_ext === "strict") return await next();
			file_path = file_path.substring(0, file_path.length - 1);
		}

		if (await test_file(file_path)) {
			// We found the file so let's serve it!
			return await attempt_to_serve(file_path);
		} else if (accept_html && !file_path.endsWith(".html") && known_options.file_path_without_html_ext !== "strict") {
			// We know we want an HTML file, and the file doesn't end with .html... Let's try by adding the extension.
			const html_file_path = file_path + ".html";

			if (await test_file(html_file_path)) {
				// Yay! The file with the .html exists, time to serve.
				return await attempt_to_serve_with_html_ext(html_file_path);
			} else if (should_try_directory && await test_file(file_path + "/index.html")) {
				// The file did not exist, but we had one last chance: testing for directories, and it worked!
				if (known_options.file_path_without_html_ext === "redirect_to_html") {
					return Response.redirect(new URL(file_path + "/", request.url), STATUS_CODE.PermanentRedirect);
				} else {
					return await attempt_to_serve(file_path + "/index.html");
				}
			}
		}

		return await next();
	};
}
