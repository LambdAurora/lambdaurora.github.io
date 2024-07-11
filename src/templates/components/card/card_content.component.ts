import { ComponentBaseArgs, ComponentData } from "../../../engine/component.ts";

const CardContentComponent: ComponentData<ComponentBaseArgs> = {
	selector: "card:content",
	template: /*html*/ `<card:section [class]>
		<div class="ls_card_content">
			<$content />
		</div>
	</card:section>`,
	render: (ctx) => ({ ...ctx.args })
};
export default CardContentComponent;
