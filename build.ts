import { copy } from "@std/fs";
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
import { initCompiler } from "sass";

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

const sass_compiler = initCompiler();
const style_step = new BuildTask(
	"Style",
	async context => {
		const deployed_style_dir = DEPLOY_DIR + "/style";

		context.push_output(deployed_style_dir, "directory");

		await copy("./src/style", deployed_style_dir);

		const absolute_deploy_dir = await Deno.realPath(DEPLOY_DIR);

		async function explore_and_compile(dir: string): Promise<boolean> {
			for await (const entry of Deno.readDir(dir)) {
				if (entry.isDirectory) {
					await explore_and_compile(`${dir}/${entry.name}`);
				} else if (entry.isFile && entry.name.endsWith(".scss")) {
					const file = `${dir}/${entry.name}`;
					const index = file === `${deployed_style_dir}/style.scss`;
					const output_file = index ? `${DEPLOY_DIR}/style.css` : file.replace(".scss", ".css");
					console.debug(`Compiling ${file} to ${output_file}...\x1b[0m`)
					try {
						const result = sass_compiler.compile(file, {
							style: args.debug ? "expanded" : "compressed",
							sourceMap: true,
						});

						await Deno.writeTextFile(output_file, result.css);

						if (index) {
							const source_map = result.sourceMap!;
							source_map.sourceRoot = "/style";
							source_map.sources = source_map.sources.map(source => source.replace(`file://${absolute_deploy_dir}`, ""))
							await Deno.writeTextFile(output_file + ".map", JSON.stringify(source_map));
						}
					} catch (error) {
						console.error(error);
						return false;
					}
				}
			}

			return true;
		}

		return await explore_and_compile(deployed_style_dir);
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
