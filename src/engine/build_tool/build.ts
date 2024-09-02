// deno-lint-ignore-file no-this-alias
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
	private output_files: {readonly path: string; readonly kind: OutputKind}[] = [];

	constructor(public readonly name: string, input_files: string[]) {
		this.input_files = input_files;
	}

	protected abstract do_action(context: TaskExecutionContext): Promise<boolean>;

	/**
	 * Runs this task.
	 *
	 * @returns `true` on success, or `false` otherwise
	 */
	public async run(system: BuildSystem): Promise<boolean> {
		if (this.output_files.length !== 0) {
			await this.clean();
		}

		return await this.run_action(system);
	}

	private async run_action(system: BuildSystem): Promise<boolean> {
		const task = this;
		return await this.do_action({
			push_output: (path, recursive) => {
				this.output_files.push({ path: path, kind: recursive ?? "file" });
			},
			async run_all_others() {
				return await system.run_except([task]);
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

	public register_task(task: Task): void {
		this.tasks.push(task);
	}

	public async run(fatal: boolean): Promise<void> {
		for (const task of this.tasks) {
			if (!await task.run(this)) {
				console.error(`Task "${task.name}" failed.`);

				if (fatal) {
					Deno.exit(1);
				}
			}
		}
	}

	public async run_except(tasks: Task[]): Promise<boolean> {
		for (const task of this.tasks) {
			if (tasks.includes(task)) {
				continue;
			}

			if (!await task.run(this)) {
				console.error(`Task "${task.name}" failed.`);

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
	private watchers: Deno.FsWatcher[] = [];
	private locks: { [x: string]: { id: number; action: Promise<unknown>; } } = {};
	private listeners: BuildWatchListener[] = [];

	constructor(private system: BuildSystem) {}

	public add_listener(listener: BuildWatchListener) {
		this.listeners.push(listener);
	}

	public start_watching(task: Task): void {
		const watcher = Deno.watchFs(task.input_files, { recursive: true });
		this.watchers.push(watcher);

		// Bootstrap the running watcher. Not using await allows for this to run in the background.
		(async () => {
			let last = Date.now();

			for await (const event of watcher) {
				if (event.flag === "rescan") continue;
				if (
					(
						event.kind === "create"
						|| event.kind === "modify"
						|| event.kind === "remove"
					) && (Date.now() - last) > 750
				) {
					last = Date.now();

					const execution_id = last.valueOf();

					const promise = task.run(this.system);
					await this.request_lock(task, execution_id, promise);
				}
			}
		})();
	}

	public async request_lock(
		task: Task,
		execution_id: number,
		action: Promise<unknown>
	): Promise<void> {
		this.locks[task.name] = {
			id: execution_id,
			action: action
		};

		await action;

		// The lock can be released, the action has ended.

		if (this.locks[task.name].id === execution_id) {
			delete this.locks[task.name];

			if (Object.values(this.locks).length === 0) {
				await Promise.all(
					this.listeners
						.map(listener => listener())
				);
			}
		}
	}

	public async check_lock(): Promise<void> {
		while (Object.values(this.locks).length !== 0) {
			await Promise.all(
				Object.values(this.locks)
				.map(lock => lock.action)
			);
		}
	}

	public shutdown(): void {
		this.watchers.forEach(watcher => watcher.close());
	}
}
