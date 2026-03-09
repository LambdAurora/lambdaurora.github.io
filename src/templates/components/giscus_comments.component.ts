import { ComponentData } from "../../engine/component.ts";

const GiscusComments: ComponentData<{ repo?: string, repo_id?: string, discussion_number: number, ls_theme_color: string, }> = {
	selector: "giscus_comments",
	template: { path: "./giscus_comments.component.html" },
	render: (ctx) => {
		return {
			app: ctx.app,
			repo: ctx.args.repo ?? "LambdAurora/lambdaurora.github.io",
			repo_id: ctx.args.repo_id ?? "MDEwOlJlcG9zaXRvcnkxMDY1ODM0NTc=",
			discussion_number: ctx.args.discussion_number,
			reactions: true,
			emit_metadata: false,
			theme: ctx.args.ls_theme_color,
		};
	}
};
export default GiscusComments;
