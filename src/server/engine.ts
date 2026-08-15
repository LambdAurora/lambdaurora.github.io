import { body, head } from "@lambdaurora/libhtml";

/**
 * Represents a valid HTTP method.
 */
export type HttpMethod =
	| "DELETE"
	| "GET"
	| "HEAD"
	| "OPTIONS"
	| "PATCH"
	| "POST"
	| "PUT";

/**
 * All the existing HTTP methods.
 */
export const ALL_HTTP_METHODS: readonly HttpMethod[] = Object.freeze(["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]);

export type MiddlewareResponse = Response | null;
export type Next = () => Promise<MiddlewareResponse>;

export class RequestContext {
	/**
	 * URL of this context.
	 */
	public readonly url: URL;
	/**
	 * Method of this request.
	 */
	public readonly method: HttpMethod;
	/**
	 * Headers of this request.
	 */
	public readonly headers: Headers;

	constructor(public readonly request: Request) {
		this.url = new URL(request.url);
		this.method = request.method as HttpMethod;
		this.headers = new Headers(request.headers);
	}
}

/**
 * Middleware are functions which are chained together to deal with
 * requests.
 */
export interface Middleware {
	(context: RequestContext, next: Next): Promise<MiddlewareResponse> | MiddlewareResponse;
}

/**
 * Composes multiple middlewares into one.
 *
 * @param middlewares the middlewares to compose
 * @returns the composed middleware
 */
export function compose_middlewares(...middlewares: Middleware[]): Middleware {
	return async (context, next) => {
		let index = -1;

		async function dispatch(i: number): Promise<MiddlewareResponse> {
			if (i <= index) {
				throw new Error("next() called multiple times.");
			}
			index = i;
			let middleware = middlewares[i];
			if (i === middlewares.length) {
				middleware = next;
			}
			if (!middleware) {
				return null;
			}
			return await middleware(context, dispatch.bind(null, i + 1));
		}

		return await dispatch(0);
	};
}

export function edit_response(response: Response, data: ResponseInit): Response {
	return new Response(response.body, {
		status: response.status,
		headers: response.headers,
		...data
	});
}

export function edit_response_headers(response: Response, callback: (headers: Headers) => void) {
	const headers = new Headers(response.headers);
	callback(headers);
	return edit_response(response, { headers });
}
