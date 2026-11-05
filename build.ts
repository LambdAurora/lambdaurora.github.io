import { copy } from "@std/fs";
import { parseArgs } from "@std/cli";

import { PagesContext, process_all_pages } from "./src/engine/page.ts";
import { process_all_tutorials } from "./src/tutorial_processor.mjs";
import { process_all_blog_entries } from "./src/blog/processor.ts";
import { serve } from "./src/server/server.ts";
import { BUILD_DIR, DEPLOY_DIR } from "./src/utils.ts";
import {
	BuildSystem,
	BuildTask,
	BuildWatcher,
} from "./src/engine/build_tool/build.ts";
import { COMPONENTS } from "./src/engine/component.ts";
import { CopyStaticResourcesTask } from "./src/engine/build_tool/tasks.ts";
import { Application } from "./src/engine/app.ts";
import { CONSTANTS } from "./src/constants.ts";
import { initCompiler } from "sass";

const args = parseArgs(Deno.args, { default: { port: 8080 } });

const app = new Application({
	name: CONSTANTS.site_name,
	root_url: CONSTANTS.root_url,
	logo: CONSTANTS.site_logo,
	themes: CONSTANTS.themes,
	debug: args.debug,
});
const pages_context = new PagesContext(
	app,
	"src/templates/page.html",
	"src/views",
);

const build_system = new BuildSystem(BUILD_DIR);

const assets_step = new CopyStaticResourcesTask(
	"copy_public_assets",
	["./public"],
	DEPLOY_DIR,
);
build_system.register_task(assets_step);

const sass_compiler = initCompiler();
const style_step = new BuildTask(
	"style",
	async (context) => {
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
					const output_file = index
						? `${DEPLOY_DIR}/style.css`
						: file.replace(".scss", ".css");
					console.debug(`Compiling ${file} to ${output_file}...\x1b[0m`);
					try {
						const result = sass_compiler.compile(file, {
							style: args.debug ? "expanded" : "compressed",
							sourceMap: true,
						});

						await Deno.writeTextFile(output_file, result.css);

						if (index) {
							const source_map = result.sourceMap!;
							source_map.sourceRoot = "/style";
							source_map.sources = source_map.sources.map((source) =>
								source.replace(`file://${absolute_deploy_dir}`, "")
							);
							await Deno.writeTextFile(
								output_file + ".map",
								JSON.stringify(source_map),
							);
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
	["./src/style/"],
);
build_system.register_task(style_step);

const components_task = new BuildTask(
	"components",
	async () => {
		await COMPONENTS.load_all();
		return true;
	},
	[COMPONENTS.root],
);
build_system.register_task(components_task);

const blog_step = new BuildTask(
	"blog",
	async (context) => {
		await process_all_blog_entries(pages_context);
		context.push_output(DEPLOY_DIR + "/blog", "directory");
		return true;
	},
	["./src/templates/page.html", "./src/blog"],
);
blog_step.depends(components_task);
build_system.register_task(blog_step);

const tutorials_step = new BuildTask(
	"tutorials",
	async (context) => {
		await process_all_tutorials(pages_context);
		context.push_output(DEPLOY_DIR + "/tutorials", "directory");
		return true;
	},
	["./src/templates/page.html", "./src/tutorials"],
);
tutorials_step.depends(components_task);
build_system.register_task(tutorials_step);

const build_step = new BuildTask(
	"build",
	async (context) => {
		console.log("Building pages...");

		(await process_all_pages(
			pages_context,
			pages_context.views_root,
			DEPLOY_DIR,
		)).forEach(({path, kind}) => context.push_output(path, kind));

		return true;
	},
	["./src/templates/page.html", "./src/views"],
);
build_step.depends(components_task);
build_system.register_task(build_step);

await build_system.run(!(args.serve && args.debug));

if (args.serve) {
	let watcher: BuildWatcher | undefined = undefined;

	if (args.debug) {
		watcher = build_system.watch();
	}

	await serve(pages_context, args, watcher);

	if (watcher) {
		Deno.addSignalListener("SIGINT", () => {
			watcher.shutdown();
		});
	}
}
