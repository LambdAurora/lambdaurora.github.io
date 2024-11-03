import { ComponentData } from "../../../engine/component.ts";
import { IconProps, make_render } from "./icon.ts";

const WarningIconComponent: ComponentData<IconProps> = {
	selector: "icon:warning",
	template: { path: "./warning.html" },
	render: make_render()
};
export default WarningIconComponent;
