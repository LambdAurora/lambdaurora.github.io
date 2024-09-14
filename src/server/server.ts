// deno-lint-ignore-file no-explicit-any
import { brightMagenta, magenta } from "@std/fmt/colors";
import { Semaphore } from "@core/asyncutil/semaphore";
import * as html from "@lambdaurora/libhtml";
import { get_or_load_language, Prism } from "../prismjs.ts";
import { Application, Response, send } from "@oak/oak";
import { HttpStatus, LoggerMiddleware, ProxyRouter, serve_files } from "@lambdaurora/lambdawebserver";

import { PagesContext, process_page } from "../engine/page.ts";
import { DEPLOY_DIR } from "../utils.ts";
import { BuildWatcher } from "../engine/build_tool/build.ts";

const debug_web_socket_lock = new Semaphore(1);
const debug_web_socket_clients: DebugWebSocketAcceptedClient[] = [];

class DebugWebSocketAcceptedClient {
	web_socket: WebSocket;

	constructor(sock: WebSocket) {
		this.web_socket = sock;
		this.web_socket.onopen = _ => {
			console.log(brightMagenta("Debug WebSocket connected."));
		};
		this.web_socket.onclose = () => {
			debug_web_socket_lock.lock(() => {
				const index = debug_web_socket_clients.indexOf(this);
					debug_web_socket_clients.splice(index, 1);
					console.log(brightMagenta("Debug WebSocket disconnected."));
			});
		};
	}
}

export async function serve(
	pages_context: PagesContext,
	args: {
		[x: string]: any;
		_: (string | number)[];
	},
	watcher?: BuildWatcher
) {
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

			debug_web_socket_lock.lock(() => {
				debug_web_socket_clients.push(new DebugWebSocketAcceptedClient(socket));
			});

			return;
		} else if (args.debug && watcher) {
			// Wait for the debug reload to complete.
			await watcher.check_lock();
		}

		return await next();
	});
	app.use(async (context, next) => {
		const file_path = decodeURIComponent(context.request.url.pathname);
		const accept_header = context.request.headers.get("accept");

		if (accept_header) {
			try {
				if (file_path.endsWith(".css") && accept_header.includes("text/html") && !accept_header.includes("text/css")) {
					await handle_raw_file(
						context,
						pages_context,
						file_path,
						DEPLOY_DIR + file_path,
						"css"
					);
					return;
				} else if (file_path.endsWith(".scss") && accept_header.includes("text/html") && !accept_header.includes("text/scss")) {
					await handle_raw_file(
						context,
						pages_context,
						file_path,
						DEPLOY_DIR + file_path,
						"scss"
					);
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
		if (watcher) {
			watcher.add_listener(() => {
				debug_web_socket_lock.lock(() => {
					debug_web_socket_clients.forEach(client => {
						client.web_socket.send("reload");
					});
				});
			});
		}
		console.log("Access it at: " + magenta(`http://${evt.hostname === "0.0.0.0"
			? "localhost" : evt.hostname}:${port}/`)
		);
	});

	console.log("HTTP web server running.");
	await app.listen({
		port: port
	});
}

async function handle_raw_file(
	context: { response: Response },
	pages_context: PagesContext,
	path: string,
	file: string,
	language: string
) {
	const page = await process_page(path, pages_context, {
			load_view: (_: string) => Deno.readTextFile(file)
				.then(async source => {
					try {
						await get_or_load_language(language);
					} catch (_e) { /* Ignored */
					}

					const code = html.create_element("code")
						.with_attr("class", `language-${language}`);

					if (Prism.languages[language]) {
						const stuff = html.parse("<pre><code>"
							+ Prism.highlight(source, Prism.languages[language], language)
							+ "</code></pre>") as html.Element;
						code.children = stuff.get_element_by_tag_name("code")!.children;
					} else
						code.append_child(new html.Text(source));

					return html.create_element("html")
						.with_child(html.create_element("body")
							.with_child(html.create_element("pre")
								.with_attr("class", `language-${language}`)
								.with_child(code)
							)
						).with_child(html.create_element("style")
							.with_child(new html.Text(`pre[class*="language-"] { margin: 0; }`))
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
