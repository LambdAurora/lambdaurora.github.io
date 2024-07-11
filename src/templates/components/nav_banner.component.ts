import { ComponentData } from "../../engine/component.ts";

const NavBannerComponent: ComponentData<{ path?: string, style?: string, ls_small_reverse?: string }> = {
	selector: "nav_banner",
	template: /*html*/ `<a [class]='["ls_nav_banner", ...(props.class ?? [])]' [href]="path" [style] [ls_small_reverse]>
		<$content />
	</a>`,
	render: ({args}) => ({
		...args,
		path: args.path ?? "/"
	})
};
export default NavBannerComponent;
