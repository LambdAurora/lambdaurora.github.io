import { ComponentBaseArgs, ComponentData } from "../../../engine/component.ts";

const TreeView: ComponentData<ComponentBaseArgs> = {
	selector: "tree_view_item",
	template: /*html*/ `<li class="ls_tree_view_item">
		<$content />
	</li>`,
	render: (ctx) => ({ ...ctx.args })
};
export default TreeView;
