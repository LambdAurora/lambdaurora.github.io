import { copy } from "https://deno.land/std/fs/copy.ts";
import { existsSync, move } from "https://deno.land/std/fs/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";

import { process_all_pages } from "./src/page_processor.mjs";
import { process_all_tutorials } from "./src/tutorial_processor.mjs";
import { process_all_blog_entries } from "./src/blog_processor.mjs";
import { serve } from "./src/server.mjs";
import { BUILD_DIR, DEPLOY_DIR, DECODER, ENCODER } from "./src/utils.mjs";
import { COMPONENTS } from "./src/component.mjs";

const args = parse(Deno.args, { default: { port: 8080 }});

async function build() {
	/* Main */

	console.log("Creating build directory...");
	if (existsSync(BUILD_DIR))
		await Deno.remove(BUILD_DIR, {recursive: true});

	await Deno.mkdir(BUILD_DIR).then(() => copy("./public", DEPLOY_DIR)).then(() => console.log("Copied static resources."));
	await copy("./src/script", DEPLOY_DIR + "/script");

	/* Style stuff */
	if (!await build_style()) {
		console.error("Failed to build style.");

		if (!(args.serve && args.debug)) {
			Deno.exit(1);
		}
	}

	await COMPONENTS.load_all();

	await process_all_pages();
	await process_all_tutorials();
	await process_all_blog_entries();
}

async function build_style() {
	console.log("Building styles...");

	const deployed_style_dir = DEPLOY_DIR + "/style";

	if (existsSync(deployed_style_dir)) {
		await Deno.remove(deployed_style_dir, { recursive: true });
	}

	await copy("./src/style", deployed_style_dir);
	const result = await Deno.run(
		{
			cmd: [
				"sass",
				`${deployed_style_dir}/style.scss:${deployed_style_dir}/style.css`,
				`${deployed_style_dir}:${deployed_style_dir}`,
				args.debug ? "--style=expanded" : "--style=compressed"
			] 
		}
	).status();

	if (!result.success) {
		return false;
	}

	if (existsSync(DEPLOY_DIR + "/style.css")) {
		await Deno.remove(DEPLOY_DIR + "/style.css");
	}

	await Deno.readFile(deployed_style_dir + "/style.css.map")
		.then(source => DECODER.decode(source))
		.then(source => {
			const json = JSON.parse(source);
			json.sourceRoot = "/style";
			return JSON.stringify(json);
		}).then(source => ENCODER.encode(source))
		.then(source => Deno.writeFile(DEPLOY_DIR + "/style.css.map", source))
		.then(() => Deno.remove(deployed_style_dir + "/style.css.map"))
		.then(() => move(deployed_style_dir + "/style.css", DEPLOY_DIR + "/style.css"));

	return true;
}

await build();

if (args.serve) {
	const watchers = [];

	if (args.debug) {
		const public_watcher = Deno.watchFs("./public", { recursive: true });
		watchers.push(public_watcher);

		new Promise(async function(resolve, _) {
			let last = Date.now();

			for await (const event of public_watcher) {
				if (event.kind !== "access" && (Date.now() - last) > 500) {
					last = Date.now();
					await build();
				}
			}

			resolve();
		});

		const style_watcher = Deno.watchFs("./src/style", { recursive: true });
		watchers.push(style_watcher);

		new Promise(async function(resolve, _) {
			let last = Date.now();

			for await (const event of style_watcher) {
				if (event.kind !== "access" && (Date.now() - last) > 500) {
					last = Date.now();
					await build_style();
				}
			}

			resolve();
		});

		const templates_watcher = Deno.watchFs("./src/templates", { recursive: true });
		watchers.push(templates_watcher);

		new Promise(async function(resolve, _) {
			let last = Date.now();

			for await (const event of templates_watcher) {
				if (event.kind !== "access" && (Date.now() - last) > 500) {
					last = Date.now();
					try {
						await build();
					} catch (e) {
						console.error(e);
					}
				}
			}

			resolve();
		});

		const views_watcher = Deno.watchFs("./src/views", { recursive: true });
		watchers.push(views_watcher);

		new Promise(async function(resolve, _) {
			let last = Date.now();

			for await (const event of views_watcher) {
				if (event.kind !== "access" && (Date.now() - last) > 500) {
					last = Date.now();
					try {
						await build();
					} catch (e) {
						console.error(e);
					}
				}
			}

			resolve();
		});

		const tutorials_watcher = Deno.watchFs("./src/tutorials", { recursive: true });
		watchers.push(tutorials_watcher);

		new Promise(async function(resolve, _) {
			let last = Date.now();

			for await (const event of tutorials_watcher) {
				if (event.kind !== "access" && (Date.now() - last) > 500) {
					last = Date.now();
					try {
						await build();
					} catch (e) {
						console.error(e);
					}
				}
			}

			resolve();
		});

		const blog_watcher = Deno.watchFs("./src/blog", { recursive: true });
		watchers.push(blog_watcher);

		new Promise(async function(resolve, _) {
			let last = Date.now();

			for await (const event of blog_watcher) {
				if (event.kind !== "access" && (Date.now() - last) > 500) {
					last = Date.now();
					try {
						await build();
					} catch (e) {
						console.error(e);
					}
				}
			}

			resolve();
		});
	}

	await serve(args);

	watchers.forEach(watcher => watcher.close());
}
