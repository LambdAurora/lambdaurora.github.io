import { ComponentData } from "../../../engine/component.ts";
import { IconProps, make_render } from "./icon.ts";

const GitHubIconComponent: ComponentData<IconProps> = {
	selector: "icon:github",
	template: { path: "./github.html" },
	render: make_render()
};
export default GitHubIconComponent;
