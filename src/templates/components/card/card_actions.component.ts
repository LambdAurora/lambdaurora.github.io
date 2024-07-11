import { ComponentBaseArgs, ComponentData } from "../../../engine/component.ts";

const CardActionsComponent: ComponentData<ComponentBaseArgs> = {
	selector: "card:actions",
	template: /*html*/ `<div [class]='["ls_card_actions", ...(props.class ?? [])]'>
		<$content />
	</div>`,
	render: (ctx) => ({ ...ctx.args })
};
export default CardActionsComponent;
