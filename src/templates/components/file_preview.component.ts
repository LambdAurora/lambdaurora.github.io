import * as html from "@lambdaurora/libhtml";
import { ComponentData } from "../../engine/component.ts";

const FilePreview: ComponentData<{ path: string }> = {
	selector: "file_preview",
	template: { path: "./file_preview.html" },
	render: async (ctx) => {
		const source = await Deno.readTextFile(ctx.args.path);

		return {
			source: new html.Text(source.trim())
		};
	}
};
export default FilePreview;
