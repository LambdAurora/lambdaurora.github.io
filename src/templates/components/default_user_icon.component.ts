import { ComponentBaseArgs, ComponentData } from "../../engine/component.ts";

const DefaultUserIcon: ComponentData<ComponentBaseArgs> = {
	selector: "default_user_icon",
	template: /*html*/ `<span class="ls_icon_default_user">
		<icon:user ls_size="small" />
	</span>`,
	render: () => ({})
};
export default DefaultUserIcon;
