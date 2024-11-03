import { ComponentBaseArgs, ComponentData } from "../../../engine/component.ts";

const TreeView: ComponentData<ComponentBaseArgs> = {
	selector: "tree_view",
	template: /*html*/ `<ul class="ls_tree_view">
		<$content />
	</ul>`,
	render: (ctx) => ({ ...ctx.args })
};
export default TreeView;
