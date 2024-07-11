import { ComponentData } from "../../../engine/component.ts";

const CardMediaWithContentComponent: ComponentData<{ darken?: string }> = {
	selector: "card:media_with_content",
	template: /*html*/ `<card:media [class] [img] [alt] [ls_size] [darken]>
		<div class="ls_card_content">
			<$content />
		</div>
	</card:media>`,
	render: (ctx) => ({ ...ctx.args })
};
export default CardMediaWithContentComponent;
