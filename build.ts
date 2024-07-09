import { copy, move } from "@std/fs";
import { parseArgs } from "@std/cli";

import { process_all_pages, enable_debug_pages } from "./src/page_processor.ts";
import { process_all_tutorials } from "./src/tutorial_processor.mjs";
import { process_all_blog_entries } from "./src/blog/processor.mjs";
import { serve } from "./src/server/server.ts";
import { BUILD_DIR, DEPLOY_DIR } from "./src/utils.ts";
import { COMPONENTS } from "./src/component.ts";
import { BuildSystem, BuildTask } from "./src/engine/build_tool/build.ts";

const args = parseArgs(Deno.args, { default: { port: 8080 }});

if (args.debug) enable_debug_pages();

const build_system = new BuildSystem();

const public_step = new BuildTask(
	"Copy Public Assets",
	async context => {
		console.log("Copying static resources...");

		async function visit(directory: string) {
			await Deno.mkdir(DEPLOY_DIR + directory, { recursive: true });
	
			for await (const dir_entry of Deno.readDir("./public" + directory)) {
				if (dir_entry.isDirectory) {
					const dir = directory + "/" + dir_entry.name;

					await visit(dir);
					context.push_output(`${DEPLOY_DIR}/${dir}`, "empty_directory");
				} else if (dir_entry.isFile) {
					const file = "/" + directory + "/" + dir_entry.name;
					const output_file = DEPLOY_DIR + file;

					await copy("./public" + file, output_file);
					context.push_output(output_file);
				}
			}
		}
	
		await visit("");

		console.log("Static resources have been copied.");

		return true;
	},
	["./public"]
);
build_system.register_task(public_step);

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

async function build() {
	console.log("Cleaning build directory...");
	try {
		await Deno.remove(BUILD_DIR, {recursive: true});
	} catch (e) {
		if (!(e instanceof Deno.errors.NotFound)) {
			throw e;
		}
	}
	await build_system.run(!(args.serve && args.debug));

	await COMPONENTS.load_all();

	await process_all_pages();
	await process_all_tutorials();
	await process_all_blog_entries();
}

await build();

const watchers: Deno.FsWatcher[] = [];

function start_watching(waiter: { lock: Promise<void>, on_rebuild: () => Promise<void> }, build_func: () => Promise<unknown>, ...directories: string[]) {
	for (const directory of directories) {
		const watcher = Deno.watchFs(directory, { recursive: true });
		watchers.push(watcher);

		// Bootstrap the running watcher. Not using await allows for this to run in the background.
		(async function () {
			let last = Date.now();

			for await (const event of watcher) {
				if (event.flag === "rescan") continue;
				if ((event.kind === "create" || event.kind === "modify" || event.kind === "remove") && (Date.now() - last) > 750) {
					last = Date.now();
					const promise = build_func().then(async _ => { await waiter.on_rebuild(); });
					waiter.lock = promise;
					await promise;
				}
			}
		})();
	}
}

function stop_watching() {
	watchers.forEach(watcher => watcher.close());
}

if (args.serve) {
	const waiter = { lock: new Promise<void>(resolved => resolved()), on_rebuild: async () => {} };

	if (args.debug) {
		start_watching(waiter, async () => await public_step.run(), "./public");
		start_watching(waiter, async () => await style_step.run(), "./src/style/");
		start_watching(waiter, async () => {
			try {
				await build();
			} catch (e) {
				console.error(e);
			}
		}, "./src/templates", "./src/views", "./src/tutorials", "./src/blog");
	}

	await serve(args, waiter);

	stop_watching();
}
