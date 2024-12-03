import { ComponentData } from "../../../engine/component.ts";
import { IconProps, make_render } from "./icon.ts";

const CurseForgeIconComponent: ComponentData<IconProps> = {
	selector: "icon:curseforge",
	template: { path: "./curseforge.html" },
	render: make_render()
};
export default CurseForgeIconComponent;
