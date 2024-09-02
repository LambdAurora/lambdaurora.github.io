import { Task, TaskExecutionContext } from "./build.ts";

/**
 * Represents an entry in the static resources to be copied.
 */
export interface StaticResourceEntry {
	/**
	 * The input path of the resource.
	 */
	input: string;
	/**
	 * The path relative to the output directory.
	 */
	path: string;
}

/**
 * Represents a task which copies static resources.
 */
export class CopyStaticResourcesTask extends Task {
	private readonly entries: (string | StaticResourceEntry)[];
	private readonly output_dir: string;

	constructor(
		name: string,
		input_files: (string | StaticResourceEntry)[],
		output_dir: string
	) {
		super(name, input_files.map(file => {
			if (typeof file === "string") {
				return file;
			} else {
				return file.input;
			}
		}));

		this.entries = input_files;
		this.output_dir = output_dir;
	}

	protected async do_action(context: TaskExecutionContext): Promise<boolean> {
		console.log("Copying static resources...");

		for (const entry of this.entries) {
			const input_path = typeof entry === "string" ? entry : entry.input;

			const stat = await Deno.stat(input_path);

			if (stat.isDirectory) {
				let output_dir = this.output_dir;

				if (!(typeof entry === "string")) {
					output_dir += `/${entry.path}`;
				}

				await this.copy_dir(context, input_path, output_dir);
			} else {
				const output_path = this.output_dir
					+ (typeof entry === "string" ? input_path : entry.path);

				await Deno.copyFile(input_path, output_path);
				context.push_output(output_path);
			}
		}

		console.log("Static resources have been copied.");
		return true;
	}

	private async copy_dir(
		context: TaskExecutionContext,
		input: string,
		output_dir: string
	) {
		await Deno.mkdir(output_dir, { recursive: true });

		for await (const entry of Deno.readDir(input)) {
			const input_path = `${input}/${entry.name}`;
			const out_path = `${output_dir}/${entry.name}`;

			if (entry.isDirectory) {
				await this.copy_dir(context, input_path, out_path);
			} else {
				await Deno.copyFile(input_path, out_path);
				context.push_output(out_path);
			}
		}

		context.push_output(output_dir, "empty_directory");
	}
}
