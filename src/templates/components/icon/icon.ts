import { ComponentContext } from "../../../engine/component.ts";

export interface IconProps {
	color?: string;
}

export function make_render() {
	return (context: ComponentContext<IconProps>) => {
		let style = undefined;

		if (context.args.color) {
			style = {
				fill: context.args.color
			};
		}

		// deno-lint-ignore no-explicit-any
		const args_to_return: any = { ...context.args };

		if (style) {
			args_to_return.style = style;
		}

		return args_to_return;
	}
}
