import { bold, cyan, green, magenta, red, yellow } from "@std/fmt/colors";
import { format } from "@std/datetime";
import { Middleware } from "./engine.ts";

/**
 * Represents a logger middleware which will log any request made to the web server.
 */
export class LoggerMiddleware {
	private date_format: string | null = "yyyy-MM-dd hh:mm:ss.SSS";

	/**
	 * Sets the date format to use or `null` to not have date display.
	 *
	 * @param format the format of the date to log, or `null` to not log date
	 * @returns this logger middleware
	 */
	public with_date_format(format: string | null): this {
		this.date_format = format;
		return this;
	}

	/**
	 * Formats the given HTTP status as a printable string.
	 *
	 * @param status the HTTP status
	 * @returns a printable string
	 */
	format_status(status: number): string {
		let color = red;

		if (status < 500 && status >= 400) {
			color = yellow;
		} else if (status >= 300) {
			color = cyan;
		} else if (status >= 200) {
			color = green;
		}

		return bold(color(String(status)));
	}

	/**
	 * Returns the middleware of this logger.
	 *
	 * @returns the Oak middleware
	 */
	public middleware(): Middleware {
		return async (request, next) => {
			const result = await next();

			const user_agent = request.headers.get("user-agent");
			const status = result?.status ?? 404;

			const date = this.date_format !== null ? magenta(`[${format(new Date(), this.date_format)}] `) : "";

			console.log(`${date}${bold(green(`${request.method} ${request.url.pathname}`))} from: "${user_agent}" => ${this.format_status(status)}`);

			return result;
		};
	}
}
