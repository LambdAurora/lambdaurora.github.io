import { ComponentData } from "../../../engine/component.ts";
import { IconProps, make_render } from "./icon.ts";

const PenIconComponent: ComponentData<IconProps> = {
	selector: "icon:pen",
	template: { path: "./pen.html" },
	render: make_render()
};
export default PenIconComponent;
