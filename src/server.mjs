import * as server from "https://deno.land/std/http/server.ts";
import * as path from "https://deno.land/std/path/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std/streams/mod.ts";
import { html } from "https://lambdaurora.dev/lib.md/lib/index.mjs";

import { process_page } from "./page_processor.mjs";
import { DEPLOY_DIR, DECODER } from "./utils.mjs";

export async function serve(args) {
	const port = parseInt(args.port);

	console.log("HTTP web server running.");
	console.log(`Access it at: \u001b[35;1mhttp://localhost:${port}/\u001b[0m`);
	await server.serve(handle_http, { port });
}

async function handle_http(request) {
	// Use the request pathname as filepath.
	const url = new URL(request.url);
	const file_path = decodeURIComponent(url.pathname);

	console.log(`\u001b[32;1m${request.method} ${file_path}\u001b[0m from: "${request.headers.get("user-agent")}"`);

	let response;
	try {
		// Try opening the file.
		let file;
		try {
			file = await Deno.open(DEPLOY_DIR + file_path, { read: true });
			const stat = await file.stat();

			// If File instance is a directory, lookup for an index.html.
			if (stat.isDirectory) {
				file.close();
				const index_path = path.join(DEPLOY_DIR + "/", file_path, "index.html");
				file = await Deno.open(index_path, { read: true });
			}
		} catch {
			throw new Deno.errors.NotFound();
		}

		if (file_path.endsWith(".css") && request.headers.get("accept").includes("text/html")
			&& !request.headers.get("accept").includes("text/css")) {
			response = await handle_raw_file(file_path, file, "css");
		} else if (file_path.endsWith(".scss") && request.headers.get("accept").includes("text/html")
			&& !request.headers.get("accept").includes("text/scss")) {
			response = await handle_raw_file(file_path, file, "scss");
		} else {
			// Build a readable stream so the file doesn't have to be fully loaded into
			// memory while we send it.
			const readable_stream = readableStreamFromReader(file);

			// Build and send the response.
			response = new Response(readable_stream);
		}
	} catch (e) {
		const err = e instanceof Error ? e : new Error("[non-error thrown]");

		if (!(err instanceof Deno.errors.NotFound)) {
			console.error(`\u001b[31;1m${err.message}\u001b[0m`);
			console.error(err);
		}

		response = await handle_fallback(request, file_path, err);
	}

	return response;
}

async function handle_fallback(request, path, err) {
	if (err instanceof Deno.errors.NotFound) {
		return handle_404(request, path);
	} else {
		return new Response("Internal Server Error\n" + err.message, { status: 500 });
	}
}

async function handle_404(request, path) {
	// Try opening the file.
	let file;
	try {
		file = await Deno.open(DEPLOY_DIR + "/404.html", { read: true });
	} catch {
		// If the file cannot be opened, return a "404 Not Found" response.
		return new Response("404 Not Found", { status: 404 });
	}
	
	// Build a readable stream so the file doesn't have to be fully loaded into
	// memory while we send it.
	const readable_stream = readableStreamFromReader(file);
	
	// Build and send the response.
	return new Response(readable_stream, { status: 404 });
}

async function handle_raw_file(path, file, language) {
	const page = await process_page(path, _ => Deno.readAll(file)
		.then(source => DECODER.decode(source))
		.then(source => {
			return html.create_element("html")
				.with_child(html.create_element("body")
					.with_child(html.create_element("pre")
						.with_attr("class", `language-${language}`)
						.with_child(html.create_element("code")
							.with_attr("class", `language-${language}`)
							.with_child(new html.Text(source, html.TextMode.TEXT))
						)
					)
					.with_child(html.create_element("script").with_attr("src", get_prism_url("prism.min.js")))
					.with_child(html.create_element("script").with_attr("src", get_prism_url("components/prism-css-extras.min.js")))
					.with_child(html.create_element("script").with_attr("src", get_prism_url("components/prism-" + language + ".min.js")))
					.with_child(html.create_element("script").with_attr("src", get_prism_url("plugins/inline-color/prism-inline-color.min.js")))
				).with_child(html.create_element("script")
					.with_child(new html.Text(`
					const title = "${path}";

					export const page = {
						title: title,
						description: "${language.toUpperCase()} file ${path}.",
						embed: {
							title: title,
						}
					};
					export const styles = [
						"${get_prism_url("themes/prism-tomorrow.min.css")}",
						"${get_prism_url("plugins/inline-color/prism-inline-color.min.css")}"
					];`, html.TextMode.RAW))
				).with_child(html.create_element("style")
					.with_child(new html.Text(`pre[class*="language-"] { margin: 0; }`, html.TextMode.RAW))
				);
		})
	);

	const response = new Response(`${page[0].html()}\n${page[1].html()}`);
	response.headers.append("Content-Type", "text/html; charset=utf-8");
	return response;
}

function get_prism_url(component) {
	return "https://cdn.jsdelivr.net/npm/prismjs@1.24.1/" + component;
}
