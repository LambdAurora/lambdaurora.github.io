import { copy } from "https://deno.land/std@0.155.0/fs/copy.ts";
import { move } from "https://deno.land/std@0.155.0/fs/mod.ts";
import { parse } from "https://deno.land/std@0.155.0/flags/mod.ts";

import { process_all_pages } from "./src/page_processor.mjs";
import { process_all_tutorials } from "./src/tutorial_processor.mjs";
import { process_all_blog_entries } from "./src/blog_processor.mjs";
import { serve } from "./src/server.ts";
import { BUILD_DIR, DEPLOY_DIR, DECODER, ENCODER } from "./src/utils.ts";
import { COMPONENTS } from "./src/component.mjs";

const args = parse(Deno.args, { default: { port: 8080 }});

interface BuildStepContext {
	add_file: (file: string, recursive?: boolean) => void
}

type BuildStepExecutor = (context: BuildStepContext) => Promise<boolean>;

class BuildStep {
	step_executor: BuildStepExecutor;
	files: {readonly name: string, readonly recursive: boolean}[];

	constructor(step_executor: BuildStepExecutor, parent_dir?: string) {
		this.step_executor = step_executor;
		this.files = [];

		if (parent_dir) {
			this.files.push({ name: parent_dir, recursive: true });
		}
	}

	async execute() {
		if (this.files.length !== 0) {
			await this.cleanup();
		}
		return await this.build();
	}

	async build() {
		return await this.step_executor({
			add_file: (file: string, recursive = false) => {
				this.files.push({ name: file, recursive: recursive });
			}
		});
	}

	async cleanup() {
		const deletion_tasks: Promise<void>[] = [];

		for (const file of this.files) {
			deletion_tasks.push(Deno.remove(file.name, { recursive: file.recursive })
				.catch(error => {
					if (!(error instanceof Deno.errors.NotFound)) {
						throw error;
					}
				})
			);
		}

		this.files = [];

		await Promise.all(deletion_tasks);
	}
}

const public_step = new BuildStep(async context => {
	console.log("Copying static resources...");

	async function visit(directory: string) {
		await Deno.mkdir(DEPLOY_DIR + directory, { recursive: true });

		for await (const dir_entry of Deno.readDir("./public" + directory)) {
			if (dir_entry.isDirectory) {
				await visit(directory + "/" + dir_entry.name);
			} else if (dir_entry.isFile) {
				const file = "/" + directory + "/" + dir_entry.name;
				const output_file = DEPLOY_DIR + file;
				context.add_file(output_file);

				await copy("./public" + file, output_file);
			}
		}
	}

	await visit("");

	return true;
});

const style_step = new BuildStep(async context => {
	console.log("Building styles...");

	const deployed_style_dir = DEPLOY_DIR + "/style";

	context.add_file(deployed_style_dir, true);

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

	try {
		await Deno.remove(DEPLOY_DIR + "/style.css");
	} catch (e) {
		if (!(e instanceof Deno.errors.NotFound)) {
			throw e;
		}
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
}, DEPLOY_DIR + "/style");

async function build() {
	/* Main */

	console.log("Creating build directory...");
	try {
		await Deno.remove(BUILD_DIR, {recursive: true});
	} catch (e) {
		if (!(e instanceof Deno.errors.NotFound)) {
			throw e;
		}
	}

	await public_step.execute();
	await copy("./src/script", DEPLOY_DIR + "/script");

	/* Style stuff */
	if (!await style_step.execute()) {
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

await build();

const watchers: Deno.FsWatcher[] = [];

function start_watching(build_func: () => void, ...directories: string[]) {
	for (const directory of directories) {
		const watcher = Deno.watchFs(directory, { recursive: true });
		watchers.push(watcher);

		// Bootstrap the running watcher. Not using await allows for this to run in the background.
		(async function () {
			let last = Date.now();

			for await (const event of watcher) {
				if (event.kind !== "access" && (Date.now() - last) > 500) {
					last = Date.now();
					await build_func();
				}
			}
		})();
	}
}

function stop_watching() {
	watchers.forEach(watcher => watcher.close());
}

if (args.serve) {
	if (args.debug) {
		start_watching(async () => await public_step.execute(), "./public");
		start_watching(async () => await style_step.execute(), "./src/style/");
		start_watching(async () => {
			try {
				await build();
			} catch (e) {
				console.error(e);
			}
		}, "./src/templates", "./src/views", "./src/tutorials", "./src/blog");
	}

	await serve(args);

	stop_watching();
}
