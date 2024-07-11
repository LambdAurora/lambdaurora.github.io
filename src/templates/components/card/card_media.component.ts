import * as html from "@lambdaurora/libhtml";
import { ComponentData } from "../../../engine/component.ts";

const CardMediaComponent: ComponentData<{ darken?: string }> = {
	selector: "card:media",
	template: /*html*/ `<div [class]='["ls_card_section", "ls_card_media", ...props.class]' [ls_theme] [ls_size]>
		<img [src]="img" [alt] class="ls_responsive_img" />
		<$content of="darkener" />
		<$content />
	</div>`,
	render: (ctx) => {
		const props = {
			...ctx.args,
			class: ctx.args.class ?? [],
			ls_theme: undefined as (string | undefined),
			darkener: [] as html.Node[],
		};

		if (ctx.args.darken) {
			props.class.push("ls_card_media_darkened");
			props.ls_theme = "dark";

			if (ctx.args.darken !== "none") {
				const darkener = html.div({
					attributes: {
						class: "ls_card_media_darkener",
						darken_intensity: ctx.args.darken !== "" ? ctx.args.darken : undefined,
					}
				});

				props.darkener = [ darkener ];
			}
		}

		return props;
	}
};
export default CardMediaComponent;
