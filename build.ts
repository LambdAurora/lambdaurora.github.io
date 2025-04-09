import { copy, move } from "@std/fs";
import { parseArgs } from "@std/cli";

import { PagesContext, process_all_pages } from "./src/engine/page.ts";
import { process_all_tutorials } from "./src/tutorial_processor.mjs";
import { process_all_blog_entries } from "./src/blog/processor.mjs";
import { serve } from "./src/server/server.ts";
import { BUILD_DIR, DEPLOY_DIR } from "./src/utils.ts";
import { BuildSystem, BuildTask, BuildWatcher } from "./src/engine/build_tool/build.ts";
import { COMPONENTS } from "./src/engine/component.ts";
import { CopyStaticResourcesTask } from "./src/engine/build_tool/tasks.ts";
import { Application } from "./src/engine/app.ts";
import { CONSTANTS } from "./src/constants.ts";

const args = parseArgs(Deno.args, { default: { port: 8080 }});

const app = new Application({
	name: CONSTANTS.site_name,
	root_url: CONSTANTS.root_url,
	logo: CONSTANTS.site_logo,
	debug: args.debug
});
const pages_context = new PagesContext(
	app,
	"src/templates/page.html",
	"src/views"
);

const build_system = new BuildSystem();

const assets_step = new CopyStaticResourcesTask(
	"Copy Public Assets",
	["./public"],
	DEPLOY_DIR
);
build_system.register_task(assets_step);

const style_step = new BuildTask(
	"Style",
	async context => {
		console.log("Building styles...");

		const deployed_style_dir = DEPLOY_DIR + "/style";

		context.push_output(deployed_style_dir, "directory");

		await copy("./src/style", deployed_style_dir);
		const result = await new Deno.Command("sass", {
			args: [
				`${deployed_style_dir}/style.scss:${deployed_style_dir}/style.css`,
				`${deployed_style_dir}:${deployed_style_dir}`,
				args.debug ? "--style=expanded" : "--style=compressed"
			],
			stdout: "piped",
			stderr: "piped"
		}).output();

		if (!result.success) {
			return false;
		}

		try {
			await Deno.remove(DEPLOY_DIR + "/style.css");
		} catch (e) {
			if (!(e instanceof Deno.errors.NotFound)) {
				throw e;
			}
		}

		await Deno.readTextFile(deployed_style_dir + "/style.css.map")
			.then(source => {
				const json = JSON.parse(source);
				json.sourceRoot = "/style";
				return JSON.stringify(json);
			})
			.then(source => Deno.writeTextFile(DEPLOY_DIR + "/style.css.map", source))
			.then(() => Deno.remove(deployed_style_dir + "/style.css.map"))
			.then(() => move(deployed_style_dir + "/style.css", DEPLOY_DIR + "/style.css"));

		context.push_output(DEPLOY_DIR + "/style.css", "file");
		context.push_output(DEPLOY_DIR + "/style.css.map", "file");

		return true;
	},
	["./src/style/"]
);
build_system.register_task(style_step);

const components_task = new BuildTask(
	"Components",
	async () => {
		await COMPONENTS.load_all();
		return true;
	},
	[COMPONENTS.root]
);
build_system.register_task(components_task);

const build_step = new BuildTask(
	"Build",
	async context => {
		console.log("Cleaning build directory...");
		try {
			await Deno.remove(BUILD_DIR, {recursive: true});
		} catch (e) {
			if (!(e instanceof Deno.errors.NotFound)) {
				throw e;
			}
		}

		const result = await context.run_all_others();

		if (!result && !(args.serve && args.debug)) {
			return result;
		}

		console.log("Building pages...");

		await process_all_pages(pages_context, pages_context.views_root, DEPLOY_DIR);
		await process_all_tutorials(pages_context);
		await process_all_blog_entries(pages_context);

		console.log("Build completed.");

		return result;
	},
	["./src/templates", "./src/views", "./src/tutorials", "./src/blog"]
);
build_system.register_task(build_step);

await build_step.run(build_system);

if (args.serve) {
	let watcher: BuildWatcher | undefined = undefined;

	if (args.debug) {
		watcher = build_system.watch();
	}

	await serve(pages_context, args, watcher);

	if (watcher) {
		watcher.shutdown();
	}
}
