import { CONSTANTS } from "../../constants.ts";
import { ComponentData } from "../../engine/component.ts";

const MainNavBannerComponent: ComponentData<object> = {
	selector: "main_nav_banner",
	template: /*html*/ `<nav_banner class="ls_sky_background" ls_small_reverse>
		<img [src]="icon" alt />
		<span>\${name}</span>
	</nav_banner>`,
	render: (context) => {
		const icon = CONSTANTS.site_logo;

		context.preload.push({ type: "image", source: icon });

		return {
			name: CONSTANTS.site_name,
			icon: icon
		};
	}
};
export default MainNavBannerComponent;
