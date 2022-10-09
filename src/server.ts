// deno-lint-ignore-file no-explicit-any
import * as server from "@std/http/server.ts";
import * as path from "@std/path/mod.ts";
import { readableStreamFromReader } from "@std/streams/mod.ts";
import { readAll } from "@std/streams/conversion.ts";
import { Lock } from "https://deno.land/x/async@v1.1.5/lock.ts";
import { html } from "@lib.md/mod.mjs";
import * as PRISM from "./prismjs.mjs";

import { process_page } from "./page_processor.ts";
import { DEPLOY_DIR, DECODER } from "./utils.ts";

const debug_web_socket_lock = new Lock();
const debug_web_socket_clients: DebugWebSocketAcceptedClient[] = [];

class DebugWebSocketAcceptedClient {
	web_socket: WebSocket;

	constructor(sock: WebSocket) {
		this.web_socket = sock;
		this.web_socket.onopen = _ => {
			console.log("\u001b[35;1mDebug WebSocket connected.\u001b[0m");
		};
		this.web_socket.onclose = () => {
			debug_web_socket_lock.acquire()
				.then(() => {
					const index = debug_web_socket_clients.indexOf(this);
					debug_web_socket_clients.splice(index, 1);
					debug_web_socket_lock.release();
					console.log("\u001b[35;1mDebug WebSocket disconnected.\u001b[0m");
				});
		};
	}
}

export async function serve(args: {
	[x: string]: any;
	_: (string | number)[];
}, waiter: { lock: Promise<void>, on_rebuild: () => void }) {
	const port = parseInt(args.port);

	console.log("HTTP web server running.");
	await server.serve(async request => await handle_http(request, { waiter: waiter, debug: args.debug }),
		{
			port: port,
			onListen: (params: { hostname: string, port: number }) => {
				waiter.on_rebuild = async () => {
					await debug_web_socket_lock.acquire();
					debug_web_socket_clients.forEach(client => {
						client.web_socket.send("reload");
					});
					debug_web_socket_lock.release();
				};
				console.log(`Access it at: \u001b[35;1mhttp://${params.hostname === "0.0.0.0"
					? "localhost" : params.hostname}:${port}/\u001b[0m`
				);
			}
		}
	);
}

function create_base_headers() {
	const headers = new Headers();
	headers.set("server", "lambdaurora's custom webserver");
	// Set "accept-ranges" so that the client knows it can make range requests on future requests.
	headers.set("accept-ranges", "bytes");
	headers.set("date", new Date().toUTCString());
	return headers;
}

async function handle_http(request: Request, context: { waiter: { lock: Promise<void> }, debug: boolean }) {
	// Use the request pathname as filepath.
	const url = new URL(request.url);
	const file_path = decodeURIComponent(url.pathname);

	function log(return_code = 200) {
		let color = "\u001b[32;1m";

		if (return_code === 500) {
			color = "\u001b[31;1m";
		} else if (return_code !== 200) {
			color = "\u001b[33;1m";
		}

		console.log(`\u001b[32;1m${request.method} ${file_path}\u001b[0m from: "${request.headers.get("user-agent")}" => ${color}${return_code}\u001b[0m`);
	}

	if (context.debug && file_path === "/debug/hotreloader") {
		const { socket, response } = Deno.upgradeWebSocket(request);

		await debug_web_socket_lock.acquire();
		debug_web_socket_clients.push(new DebugWebSocketAcceptedClient(socket));
		debug_web_socket_lock.release();

		return response;
	} else if (context.debug) {
		// Wait for the debug reload to complete.
		await context.waiter.lock;
	}

	let response;
	try {
		// Try opening the file.
		let file: Deno.FsFile;
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

		const accept_header = request.headers.get("accept");

		if (accept_header) {
			if (file_path.endsWith(".css") && accept_header.includes("text/html") && !accept_header.includes("text/css")) {
				response = await handle_raw_file(file_path, file, "css");
			} else if (file_path.endsWith(".scss") && accept_header.includes("text/html") && !accept_header.includes("text/scss")) {
				response = await handle_raw_file(file_path, file, "scss");
			}
		}

		if (!response) {
			// Build a readable stream so the file doesn't have to be fully loaded into
			// memory while we send it.
			const readable_stream = readableStreamFromReader(file);
			const headers = create_base_headers();

			if (file_path.match(/\.css$/)) {
				headers.set("content-type", "text/css");
			} else if (file_path.match(/.+?\.m?js$/)) {
				headers.set("content-type", "text/javascript");
			}

			// Build and send the response.
			response = new Response(readable_stream, { status: 200, headers });
		}

		log();
	} catch (e) {
		const err = e instanceof Error ? e : new Error("[non-error thrown]");

		if (!(err instanceof Deno.errors.NotFound)) {
			log(500);
			console.error(`\u001b[31;1m${err.message}\u001b[0m`);
			console.error(err);
		}

		response = await handle_fallback(err, log);
	}

	return response;
}

async function handle_fallback(err: Error, log: (return_code: number) => void) {
	if (err instanceof Deno.errors.NotFound) {
		log(404);
		return await handle_404();
	} else {
		return new Response("Internal Server Error\n" + err.message, { status: 500 });
	}
}

async function handle_404() {
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

async function handle_raw_file(path: string, file: Deno.FsFile, language: string) {
	const page = await process_page(path, {
		load_view: (_: string) => readAll(file)
			.then(source => DECODER.decode(source))
			.then(async source => {
				try {
					await import(PRISM.get_prism_url("components/prism-" + language + ".min.js"));
				} catch (_e) { /* Ignored */ }

				const code = html.create_element("code")
					.with_attr("class", `language-${language}`);

				if (Prism.languages[language]) {
					const stuff = html.parse("<pre><code>"
						+ Prism.highlight(source, Prism.languages[language], language)
						+ "</code></pre>") as html.Element;
					code.children = stuff.get_element_by_tag_name("code")?.children;
				} else
					code.append_child(new html.Text(source, html.TextMode.RAW));

				return html.create_element("html")
					.with_child(html.create_element("body")
						.with_child(html.create_element("pre")
							.with_attr("class", `language-${language}`)
							.with_child(code)
						)
					).with_child(html.create_element("style")
						.with_child(new html.Text(`pre[class*="language-"] { margin: 0; }`, html.TextMode.RAW))
					);
			}),
			load_script: (_: html.Element) => {
				return {
					page: {
						title: path,
						description: `${language.toUpperCase()} file ${path}.`,
						embed: {
							title: path
						}
					}
				}
			}
		}
	);

	const response = new Response(`${page.html()}`);
	response.headers.append("Content-Type", "text/html; charset=utf-8");
	return response;
}
