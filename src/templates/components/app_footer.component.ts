import { ComponentBaseArgs, ComponentData } from "../../engine/component.ts";

const AppFooterComponent: ComponentData<ComponentBaseArgs> = {
	selector: "app_footer",
	template: { path: "./app_footer.html" },
	render: (ctx) => ({ ...ctx.args })
};
export default AppFooterComponent;
