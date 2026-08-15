/*
 * Copyright 2024 LambdAurora <email@lambdaurora.dev>
 *
 * This file is part of lambdawebserver.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ALL_HTTP_METHODS, compose_middlewares, HttpMethod, Middleware } from "./engine.ts";
import { STATUS_CODE } from "@std/http";

/**
 * Represents the redirect policy for proxying.
 *
 * - `follow` means the server will quietly follow the redirect and proxy the result of the redirect;
 * - `rewrite` means the server will attempt to reinterpret the given proxy URL if the redirect URL is relative, otherwise use the `forward` rule;
 * - `forward` means the server will forward the redirect request to the client.
 */
export type ProxyRedirectPolicy = "forward" | "rewrite" | "follow";

/**
 * Represents the proxy path mode.
 *
 * - `single` means only the given proxy path will be proxied;
 * - `root` means the given proxy path will act as a proxy root where the matching checks if the URL path starts with the proxy path,
 *   and the rest of the path is given to the redirect URL.
 */
export type ProxyPathMode = "single" | "root";

/**
 * Represents the proxy path matcher type.
 */
export type RoutePathMatcher = string | RegExp;

/**
 * Represents the options given to a proxy route.
 */
export interface ProxyRouteOptions {
	path_mode?: ProxyPathMode;
	exclude_paths?: RoutePathMatcher[];
	redirect?: ProxyRedirectPolicy;
}

/**
 * Represents a proxied route.
 *
 * @version 3.0.0
 * @since 1.0.0
 */
export class ProxyRoute {
	private readonly insensitive_path: string;
	private readonly path_mode: ProxyPathMode = "single";
	private readonly redirect_policy: ProxyRedirectPolicy;

	constructor(
		private readonly methods: HttpMethod[] | Readonly<HttpMethod[]>,
		private readonly path: string,
		private readonly target: URL,
		private readonly options?: ProxyRouteOptions
	) {
		this.insensitive_path = path.toLowerCase();

		if (this.options?.path_mode) this.path_mode = this.options.path_mode;
		this.redirect_policy = this.options?.redirect ? this.options.redirect : "follow";
	}

	private get_target_path(given: string): string | null {
		if (this.path_mode === "single") return this.insensitive_path === given.toLowerCase() ? "" : null;
		else if (given.toLowerCase().startsWith(this.insensitive_path)) return given.substring(this.path.length);
		else return null;
	}

	private async resolve_response(request: Request, request_headers: Headers, url: URL, target_url: URL): Promise<Response | null> {
		const response = await fetch(target_url, {
			headers: request_headers,
			method: request.method,
			body: request.body === null ? request.body : undefined,
			redirect: this.redirect_policy === "follow" ? "follow" : "manual"
		});

		const headers = new Headers(response.headers);

		function reply() {
			return new Response(response.body, {
				headers: headers,
				status: response.status,
				statusText: response.statusText
			});
		}

		if (response.status === STATUS_CODE.NotFound) {
			return null;
		} else if (response.status === STATUS_CODE.MovedPermanently && this.redirect_policy === "rewrite") {
			const location = response.headers.get("location");
			if (!location) return null;
			const target = new URL(location);

			if (target.origin === target_url.origin && target.pathname.startsWith(this.target.pathname)) {
				// We can rewrite the location.
				const rewritten_url = new URL(url);
				const where_to_go = target.pathname.substring(this.target.pathname.length);
				rewritten_url.pathname = this.path + where_to_go;

				headers.set("location", rewritten_url.href);

				return reply();
			} else {
				return reply();
			}
		} else {
			return reply();
		}
	}

	/**
	 * Returns the Oak middleware of this proxied route.
	 *
	 * @returns the Oak middleware
	 */
	public middleware(): Middleware {
		return async (request, next) => {
			if (!this.methods.includes(request.method as HttpMethod)) return await next();

			const url_path = decodeURIComponent(new URL(request.url).pathname);
			const found = this.get_target_path(url_path);

			if (found !== null) {
				if (this.options?.exclude_paths) {
					for (const exclude of this.options.exclude_paths) {
						if (typeof exclude === "string") {
							if (url_path === exclude) return await next();
						} else {
							if (exclude.test(url_path)) return await next();
						}
					}
				}

				const headers = new Headers(request.headers);
				headers.set("host", this.target.host);

				const proxy_url = new URL(this.target);
				proxy_url.pathname += found;

				const response = await this.resolve_response(request.request, headers, new URL(request.url), proxy_url);

				if (response === null) {
					return await next();
				}

				return response;
			} else {
				return await next();
			}
		};
	}
}

/**
 * Represents a proxy router which is used to build the corresponding Oak middleware.
 *
 * @version 3.0.0
 * @since 1.0.0
 */
export class ProxyRouter {
	private routes: ProxyRoute[] = [];

	/**
	 * Adds a proxy route for all HTTP methods.
	 *
	 * @param path the path to proxy
	 * @param target the proxy destination
	 * @param options the proxy options
	 * @return this proxy router
	 */
	public all(path: string, target: URL | string, options?: ProxyRouteOptions): this {
		this.routes.push(new ProxyRoute(ALL_HTTP_METHODS, path, new URL(target), options));
		return this;
	}

	/**
	 * Adds a proxy route for the HTTP DELETE method.
	 *
	 * @param path the path to proxy
	 * @param target the proxy destination
	 * @param options the proxy options
	 * @return this proxy router
	 */
	public delete(path: string, target: URL | string, options?: ProxyRouteOptions): this {
		this.routes.push(new ProxyRoute(["DELETE"], path, new URL(target), options));
		return this;
	}

	/**
	 * Adds a proxy route for the HTTP GET method.
	 *
	 * @param path the path to proxy
	 * @param target the proxy destination
	 * @param options the proxy options
	 * @returns this proxy router
	 */
	public get(path: string, target: URL | string, options?: ProxyRouteOptions): this {
		this.routes.push(new ProxyRoute(["GET"], path, new URL(target), options));
		return this;
	}

	/**
	 * Adds a proxy route for the HTTP HEAD method.
	 *
	 * @param path the path to proxy
	 * @param target the proxy destination
	 * @param options the proxy options
	 * @returns this proxy router
	 */
	public head(path: string, target: URL | string, options?: ProxyRouteOptions): this {
		this.routes.push(new ProxyRoute(["HEAD"], path, new URL(target), options));
		return this;
	}

	/**
	 * Adds a proxy route for the HTTP OPTIONS method.
	 *
	 * @param path the path to proxy
	 * @param target the proxy destination
	 * @param options the proxy options
	 * @returns this proxy router
	 */
	public options(path: string, target: URL | string, options?: ProxyRouteOptions): this {
		this.routes.push(new ProxyRoute(["OPTIONS"], path, new URL(target), options));
		return this;
	}

	/**
	 * Adds a proxy route for the HTTP PATCH method.
	 *
	 * @param path the path to proxy
	 * @param target the proxy destination
	 * @param options the proxy options
	 * @returns this proxy router
	 */
	public patch(path: string, target: URL | string, options?: ProxyRouteOptions): this {
		this.routes.push(new ProxyRoute(["PATCH"], path, new URL(target), options));
		return this;
	}

	/**
	 * Adds a proxy route for the HTTP POST method.
	 *
	 * @param path the path to proxy
	 * @param target the proxy destination
	 * @param options the proxy options
	 * @returns this proxy router
	 */
	public post(path: string, target: URL | string, options?: ProxyRouteOptions): this {
		this.routes.push(new ProxyRoute(["POST"], path, new URL(target), options));
		return this;
	}

	/**
	 * Adds a proxy route for the HTTP PUT method.
	 *
	 * @param path the path to proxy
	 * @param target the proxy destination
	 * @param options the proxy options
	 * @returns this proxy router
	 */
	public put(path: string, target: URL | string, options?: ProxyRouteOptions): this {
		this.routes.push(new ProxyRoute(["PUT"], path, new URL(target), options));
		return this;
	}

	/**
	 * Returns the proxy middleware.
	 *
	 * @returns the Oak middleware
	 */
	public proxy(): Middleware {
		if (this.routes.length === 0) {
			throw new Error("No proxy routes have been specified.");
		} else if (this.routes.length === 1) {
			return this.routes[0].middleware();
		} else {
			return compose_middlewares(...this.routes.map(route => route.middleware()));
		}
	}
}
