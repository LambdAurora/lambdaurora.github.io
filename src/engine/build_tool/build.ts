// deno-lint-ignore-file no-this-alias

import { debounce } from "@std/async/debounce";
import { AsyncLock } from "@olli/async-lock";
import { concat_path, hash_files } from "../fs.ts";

export type OutputKind = "file" | "directory" | "empty_directory";

export interface TaskExecutionContext {
	push_output(path: string, kind?: OutputKind): void;
	run_all_others(): Promise<boolean>;
}

/**
 * Represents the task executor which takes a context as input,
 * and returns `true` on success, or `false` otherwise.
 */
export type TaskExecutor = (context: TaskExecutionContext) => Promise<boolean>;

/**
 * Represents a task part of the build system.
 */
export abstract class Task {
	/**
	 * Input files to watch changes for.
	 */
	public readonly input_files: string[];
	private _dependencies: Task[] = [];
	private dependents: Task[] = [];
	private output_files: {readonly path: string; readonly kind: OutputKind}[] = [];

	constructor(public readonly name: string, input_files: string[]) {
		this.input_files = input_files;
	}

	protected abstract do_action(context: TaskExecutionContext): Promise<boolean>;

	/**
	 * Marks the given task as a dependency of this task.
	 *
	 * @param dependency this task's dependency
	 */
	public depends(dependency: Task) {
		this._dependencies.push(dependency);
		dependency.dependents.push(this);
	}

	/**
	 * @returns the dependencies of this task
	 */
	public get dependencies(): readonly Task[] {
		return this._dependencies;
	}

	private async hash_input() {
		return await hash_files(this.input_files);
	}

	/**
	 * Runs this task.
	 *
	 * @returns `true` on success, or `false` otherwise
	 */
	public async run(system: BuildSystem, watch: boolean, parent_changed: boolean): Promise<boolean> {
		const hash_path = concat_path(system.build_dir, this.name + ".hash");
		const hash = await this.hash_input();

		try {
			const old_hash = await Deno.readTextFile(hash_path);

			if (old_hash === hash && !parent_changed) {
				return true;
			}
		} catch (_) {
			// Ignore.
		}

		if (!watch) {
			for (const dependency of this.dependencies) {
				const result = await dependency.run(system, false, false);
				if (!result) {
					return false;
				}
			}
		}

		if (this.output_files.length !== 0) {
			await this.clean(system);
		}

		const result = await this.run_action(system);
		await Deno.writeTextFile(hash_path, hash);

		if (result && watch) {
			for (const dependent of this.dependents) {
				if (!await dependent.run(system, true, true))
					return false;
			}
		}

		return result;
	}

	private async run_action(system: BuildSystem): Promise<boolean> {
		console.log(`> Task \x1b[36;1m${this.name}\x1b[0m`);

		const task = this;
		const result = await this.do_action({
			push_output: (path, recursive) => {
				this.output_files.push({ path: path, kind: recursive ?? "file" });
			},
			async run_all_others() {
				return await system.run_except([task]);
			}
		});

		if (!result) {
			console.error(`> Task \x1b[36;1m${this.name}\x1b[0m - \x1b[31;1mFAILED\x1b[0m`);
		} else {
			console.log(`> Task \x1b[36;1m${this.name}\x1b[0m - \x1b[32;1mSUCCESS\x1b[0m`);
		}

		return result;
	}

	/**
	 * Cleans the output of this task.
	 */
	public async clean(system: BuildSystem): Promise<void> {
		if (system.verbose) {
			console.log(`> Task \x1b[36;1m${this.name}\x1b[0m - \x1b[31;1mCLEANING\x1b[0m`);
		}

		const tasks: Promise<void>[] = [];

		for (const file of this.output_files) {
			if (file.kind === "empty_directory") {
				try {
					tasks.push(
						Array.fromAsync(Deno.readDir(file.path))
							.then(files => {
								if (files.length === 0) {
									return Deno.remove(file.path);
								}
							}).catch(error => {
								if (!(error instanceof Deno.errors.NotFound)) {
									throw error;
								}
							})
					);
				} catch (error) { 
					if (!(error instanceof Deno.errors.NotFound)) {
						throw error;
					}
				}
			} else {
				if (system.verbose) {
					console.log(`  Queue ${file.path} for removal...`);
				}
				tasks.push(Deno.remove(file.path, { recursive: file.kind === "directory" })
					.catch(error => {
						if (!(error instanceof Deno.errors.NotFound)) {
							throw error;
						}
					})
				);
			}
		}

		await Promise.all(tasks);

		this.output_files = [];
	}
}

/**
 * Represents a build task.
 */
export class BuildTask extends Task {
	constructor(
		name: string,
		public readonly executor: TaskExecutor,
		input_files: string[]
	) {
		super(name, input_files);
	}

	protected async do_action(context: TaskExecutionContext): Promise<boolean> {
		return await this.executor(context);
	}
}

/**
 * Represents the build system.
 */
export class BuildSystem {
	private tasks: Task[] = [];
	public verbose: boolean = false;

	constructor(public readonly build_dir: string) {
	}

	public register_task(task: Task): void {
		this.tasks.push(task);
	}

	private create_pipeline(): Task[] {
		const pipeline = [...this.tasks];
		const dependencies = [];

		for (const task of pipeline) {
			dependencies.push(...task.dependencies);
		}

		for (const dependency of dependencies) {
			const index = pipeline.indexOf(dependency);
			if (index === -1) continue;
			pipeline.splice(index, 1);
		}

		return pipeline;
	}

	public async run(fatal: boolean): Promise<void> {
		for (const task of this.create_pipeline()) {
			if (!await task.run(this, false, false)) {
				if (fatal) {
					Deno.exit(1);
				}
			}
		}
	}

	public async run_except(tasks: Task[]): Promise<boolean> {
		for (const task of this.create_pipeline()) {
			if (tasks.includes(task)) {
				continue;
			}

			if (!await task.run(this, false, false)) {
				return false;
			}
		}

		return true;
	}

	public watch(): BuildWatcher {
		const build_watcher = new BuildWatcher(this);

		this.tasks.forEach(task => {
			build_watcher.start_watching(task);
		});

		return build_watcher;
	}
}

export type BuildWatchListener = (() => Promise<void>) | (() => void);

export class BuildWatcher {
	private readonly watchers: Deno.FsWatcher[] = [];
	private readonly listeners: BuildWatchListener[] = [];
	private readonly lock = new AsyncLock();

	constructor(private readonly system: BuildSystem) {}

	public add_listener(listener: BuildWatchListener) {
		this.listeners.push(listener);
	}

	public start_watching(task: Task): void {
		const watcher = Deno.watchFs(task.input_files, { recursive: true });
		this.watchers.push(watcher);

		console.log(`> Task \x1b[36;1m${task.name}\x1b[0m - \x1b[35;1mWATCHING\x1b[0m`);
		task.input_files.forEach(input_file => console.log(`  - ` + input_file));

		const action = debounce(async (_: Deno.FsEvent) => {
			await this.lock.run(() => task.run(this.system, true, false));
			await Promise.all(
				this.listeners.map(listener => listener())
			);
		}, 750);

		// Bootstrap the running watcher. Not using await allows for this to run in the background.
		(async () => {
			for await (const event of watcher) {
				if (event.flag === "rescan") return;
				if (
					event.kind === "create"
					|| event.kind === "modify"
					|| event.kind === "remove"
				) {
					action(event);
				}
			}
		})();
	}

	public async check_lock(): Promise<void> {
		await this.lock.run(() => {});
	}

	public shutdown(): void {
		this.watchers.forEach(watcher => watcher.close());
	}
}
