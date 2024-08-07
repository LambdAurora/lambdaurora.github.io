export type OutputKind = "file" | "directory" | "empty_directory";

export interface TaskExecutionContext {
	push_output(path: string, kind?: OutputKind): void;
}

/**
 * Represents the task executor which takes a context as input, and returns `true` on success, or `false` otherwise.
 */
export type TaskExecutor = (context: TaskExecutionContext) => Promise<boolean>;

/**
 * Represents a build task.
 */
export class BuildTask {
	/**
	 * Input files to watch changes for.
	 */
	public readonly input_files: string[];
	private output_files: {readonly path: string; readonly kind: OutputKind}[] = [];

	constructor(
		public readonly name: string,
		public readonly executor: TaskExecutor,
		input_files: string[]
	) {
		this.input_files = input_files;
	}

	/**
	 * Runs this build task.
	 *
	 * @returns `true` on success, or `false` otherwise
	 */
	public async run(): Promise<boolean> {
		if (this.output_files.length !== 0) {
			await this.clean();
		}

		return await this.build();
	}

	private async build(): Promise<boolean> {
		return await this.executor({
			push_output: (path, recursive) => {
				this.output_files.push({ path: path, kind: recursive ?? "file" });
			}
		});
	}

	/**
	 * Cleans the output of this task.
	 */
	public async clean(): Promise<void> {
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
 * Represents the build system.
 */
export class BuildSystem {
	private tasks: BuildTask[] = [];

	public register_task(task: BuildTask): void {
		this.tasks.push(task);
	}

	public async run(fatal: boolean): Promise<void> {
		for (const task of this.tasks) {
			if (!await task.run()) {
				console.error(`Task "${task.name}" failed.`);

				if (fatal) {
					Deno.exit(1);
				}
			}
		}
	}

	public watch(): BuildWatcher {
		const build_watcher = new BuildWatcher();

		this.tasks.forEach(task => {
			build_watcher.start_watching(task);
		});

		return build_watcher;
	}
}

export class BuildWatcher {
	private watchers: Deno.FsWatcher[] = [];
	private locks: { [x: string]: Promise<unknown> } = {};

	public start_watching(task: BuildTask): void {
		const watcher = Deno.watchFs(task.input_files, { recursive: true });
		this.watchers.push(watcher);

		// Bootstrap the running watcher. Not using await allows for this to run in the background.
		(async () => {
			let last = Date.now();

			for await (const event of watcher) {
				if (event.flag === "rescan") continue;
				if ((event.kind === "create" || event.kind === "modify" || event.kind === "remove") && (Date.now() - last) > 750) {
					last = Date.now();
					const promise = task.run();
					await this.request_lock(task, promise);
				}
			}
		})();
	}

	public async request_lock(task: BuildTask, action: Promise<unknown>): Promise<void> {
		this.locks[task.name] = action;

		await action;

		delete this.locks[task.name];
	}

	public async check_lock(): Promise<void> {
		while (Object.values(this.locks).length !== 0) {
			await Promise.all(Object.values(this.locks));
		}
	}

	public shutdown(): void {
		this.watchers.forEach(watcher => watcher.close());
	}
}
