import { ComponentBaseArgs, ComponentData } from "../../../engine/component.ts";

const CardSectionComponent: ComponentData<ComponentBaseArgs> = {
	selector: "card:section",
	template: /*html*/ `<div [class]='["ls_card_section", ...(props.class ?? [])]'>
		<$content />
	</div>`,
	render: (ctx) => ({ ...ctx.args })
};
export default CardSectionComponent;
