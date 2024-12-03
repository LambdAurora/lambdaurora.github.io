import { ComponentData } from "../../../engine/component.ts";
import { IconProps, make_render } from "./icon.ts";

const ModrinthIconComponent: ComponentData<IconProps> = {
	selector: "icon:modrinth",
	template: { path: "./modrinth.html" },
	render: make_render()
};
export default ModrinthIconComponent;
