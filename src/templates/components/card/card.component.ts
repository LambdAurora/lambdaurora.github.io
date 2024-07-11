import * as html from "@lambdaurora/libhtml";
import { ComponentData } from "../../../engine/component.ts";

const CardComponent: ComponentData<{ href?: string; }> = {
	selector: "card",
	template: /*html*/ `<div [href] [class]='["ls_card", ...(props.class ?? [])]' [style] [tags] [ls_clickable]><$content /></div>`,
	render: (ctx) => {
		if (ctx.args.href) {
			ctx.register_post_process(nodes => {
				if (nodes.length > 0 && nodes[0] instanceof html.Element) {
					const link = html.a(nodes[0].children);
					link.attributes = nodes[0].attributes;
					nodes[0] = link;
				}
			});
		}

		return {
			...ctx.args,
			ls_clickable: ctx.args.href ? "" : undefined
		};
	}
};
export default CardComponent;
