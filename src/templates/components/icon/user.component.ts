import { ComponentData } from "../../../engine/component.ts";
import { IconProps, make_render } from "./icon.ts";

const UserIconComponent: ComponentData<IconProps> = {
	selector: "icon:user",
	template: { path: "./user.html" },
	render: make_render()
};
export default UserIconComponent;
