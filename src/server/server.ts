// deno-lint-ignore-file no-explicit-any
import {magenta} from "@std/fmt/colors.ts";
import {readAll} from "@std/streams/conversion.ts";
import {Lock} from "https://deno.land/x/async@v1.1.5/lock.ts";
import {html} from "@lib.md/mod.mjs";
import * as PRISM from "../prismjs.mjs";
import {Application, Response} from "@oak/mod.ts";
import {send} from "@oak/send.ts";
import {HttpStatus, LoggerMiddleware, ProxyRouter, serve_files} from "@lambdawebserver/mod.ts";

import {process_page} from "../page_processor.ts";
import {DEPLOY_DIR, DECODER} from "../utils.ts";

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
	const app = new Application();

	const proxy = new ProxyRouter();

	proxy.all("/AurorasDecorations", "https://lambdaurora.dev/AurorasDecorations", {
		path_mode: "root",
		redirect: "rewrite"
	});

	app.use(new LoggerMiddleware().middleware());
	app.use(proxy.proxy());
	app.use(async (context, next) => {
		if (args.debug && context.request.url.pathname === "/debug/hotreloader") {
			const socket = context.upgrade();

			await debug_web_socket_lock.acquire();
			debug_web_socket_clients.push(new DebugWebSocketAcceptedClient(socket));
			debug_web_socket_lock.release();

			return;
		} else if (args.debug) {
			// Wait for the debug reload to complete.
			await waiter.lock;
		}

		return await next();
	});
	app.use(async (context, next) => {
		const file_path = decodeURIComponent(context.request.url.pathname);
		const accept_header = context.request.headers.get("accept");

		if (accept_header) {
			try {
				if (file_path.endsWith(".css") && accept_header.includes("text/html") && !accept_header.includes("text/css")) {
					const file = await Deno.open(DEPLOY_DIR + file_path, {read: true});
					await handle_raw_file(context, file_path, file, "css");
					return;
				} else if (file_path.endsWith(".scss") && accept_header.includes("text/html") && !accept_header.includes("text/scss")) {
					const file = await Deno.open(DEPLOY_DIR + file_path, {read: true});
					await handle_raw_file(context, file_path, file, "scss");
					return;
				}
			} catch {
				/* No file found, let other middlewares handle it. */
			}
		}

		return await next();
	});
	app.use(serve_files(DEPLOY_DIR));
	app.use(async (context, _) => {
		await send(context, DEPLOY_DIR + "/404.html", {
			root: ""
		});
		context.response.status = HttpStatus.NotFound;
	});

	app.addEventListener("listen", evt => {
		waiter.on_rebuild = async () => {
			await debug_web_socket_lock.acquire();
			debug_web_socket_clients.forEach(client => {
				client.web_socket.send("reload");
			});
			debug_web_socket_lock.release();
		};
		console.log("Access it at: " + magenta(`http://${evt.hostname === "0.0.0.0"
			? "localhost" : evt.hostname}:${port}/`)
		);
	});

	console.log("HTTP web server running.");
	await app.listen({
		port: port
	});
}

async function handle_raw_file(context: { response: Response }, path: string, file: Deno.FsFile, language: string) {
	const page = await process_page(path, {
			load_view: (_: string) => readAll(file)
				.then(source => DECODER.decode(source))
				.then(async source => {
					try {
						await import(PRISM.get_prism_url("components/prism-" + language + ".min.js"));
					} catch (_e) { /* Ignored */
					}

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
			load_script: _ => {
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

	context.response.body = page.html();
	context.response.headers.append("Content-Type", "text/html; charset=utf-8");
}
