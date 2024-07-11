import { ComponentContext } from "../../../engine/component.ts";

export interface IconProps {
	color?: string;
}

export function make_render(default_fill?: string) {
	return (context: ComponentContext<IconProps>) => {
		let style = undefined;

		if (context.args.color || default_fill) {
			style = {
				fill: context.args.color ?? default_fill
			};
		}

		return {
			...context.args,
			style: style
		}
	}
}
