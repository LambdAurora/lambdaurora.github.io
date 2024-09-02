import { copy, move } from "@std/fs";
import { parseArgs } from "@std/cli";

import { process_all_pages, enable_debug_pages } from "./src/page_processor.ts";
import { process_all_tutorials } from "./src/tutorial_processor.mjs";
import { process_all_blog_entries } from "./src/blog/processor.mjs";
import { serve } from "./src/server/server.ts";
import { BUILD_DIR, DEPLOY_DIR } from "./src/utils.ts";
import { BuildSystem, BuildTask, BuildWatcher } from "./src/engine/build_tool/build.ts";
import { COMPONENTS } from "./src/engine/component.ts";
import { CopyStaticResourcesTask } from "./src/engine/build_tool/tasks.ts";

const args = parseArgs(Deno.args, { default: { port: 8080 }});

if (args.debug) enable_debug_pages();

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

		return true;
	},
	["./src/style/"]
);
build_system.register_task(style_step);

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

		await COMPONENTS.load_all();

		await process_all_pages();
		await process_all_tutorials();
		await process_all_blog_entries();

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

	await serve(args, watcher);

	if (watcher) {
		watcher.shutdown();
	}
}
