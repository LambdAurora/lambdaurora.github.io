// deno-lint-ignore-file no-explicit-any
import { brightMagenta, magenta, red } from "@std/fmt/colors";
import { Semaphore } from "@core/asyncutil/semaphore";
import * as html from "@lambdaurora/libhtml";
import { get_or_load_language, Prism } from "../prismjs.ts";

import { compose_middlewares, edit_response_headers, RequestContext } from "./engine.ts";
import { LoggerMiddleware } from "./request_logger.ts";
import { ProxyRouter } from "./proxy.ts";
import { serve_files } from "./static.ts";

import { PagesContext, process_page } from "../engine/page.ts";
import { DEPLOY_DIR } from "../utils.ts";
import { BuildWatcher } from "../engine/build_tool/build.ts";
import { serveFile } from "@std/http/file-server";
import { STATUS_CODE } from "@std/http/status";

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

	const proxy = new ProxyRouter();

	proxy.all("/AurorasDecorations", "https://lambdaurora.dev/AurorasDecorations", {
		path_mode: "root",
		redirect: "rewrite"
	});

	const middlewares = compose_middlewares(
		new LoggerMiddleware().middleware(),
		proxy.proxy(),
		async (request, next) => {
			if (args.debug && request.url.pathname === "/debug/hotreloader") {
				if (request.headers.get("upgrade") !== "websocket") {
					request.request.body?.cancel();
					return new Response(null, { status: 426 });
				}

				const { socket, response } = Deno.upgradeWebSocket(request.request);

				debug_web_socket_lock.lock(() => {
					debug_web_socket_clients.push(new DebugWebSocketAcceptedClient(socket));
				});

				return response;
			} else if (args.debug && watcher) {
				// Wait for the debug reload to complete.
				await watcher.check_lock();
			}

			return await next();
		},
		async (_, next) => {
			const response = await next();
			if (response) {
				return edit_response_headers(response, headers => {
					headers.set("Access-Control-Allow-Origin", "*");
				});
			} else {
				return null;
			}
		},
		async (request, next) => {
			const file_path = decodeURIComponent(new URL(request.url).pathname);
			const accept_header = request.headers.get("accept");

			if (accept_header) {
				try {
					if (file_path.endsWith(".css") && accept_header.includes("text/html") && !accept_header.includes("text/css")) {
						return await handle_raw_file(
							pages_context,
							file_path,
							DEPLOY_DIR + file_path,
							"css"
						);
					} else if (file_path.endsWith(".scss") && accept_header.includes("text/html") && !accept_header.includes("text/scss")) {
						return await handle_raw_file(
							pages_context,
							file_path,
							DEPLOY_DIR + file_path,
							"scss"
						);
					}
				} catch {
					/* No file found, let other middlewares handle it. */
				}
			}

			return await next();
		},
		serve_files(DEPLOY_DIR),
	);

	const server = Deno.serve({ port }, async (request: Request) => {
		return await middlewares(new RequestContext(request), async () => {
			const response = await serveFile(request, DEPLOY_DIR + "/404.html");
			return new Response(response.body, {...response, status: STATUS_CODE.NotFound});
		}) as Response;
	});

	if (watcher) {
		watcher.add_listener(() => {
			debug_web_socket_lock.lock(() => {
				debug_web_socket_clients.forEach(client => {
					client.web_socket.send("reload");
				});
			});
		});
	}
	console.log("Access it at: " + magenta(`http://${server.addr.hostname === "0.0.0.0"
		? "localhost" : server.addr.hostname}:${port}/`)
	);

	Deno.addSignalListener("SIGINT", () => {
		console.log(red("Shutting down."));
		server.shutdown();
	});
}

async function handle_raw_file(
	pages_context: PagesContext,
	path: string,
	file: string,
	language: string
): Promise<Response> {
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

	return new Response(page.html(), {
		headers: {
			"Content-Type": "text/html; charset=utf-8",
		},
	});
}
