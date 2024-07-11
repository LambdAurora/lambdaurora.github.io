import * as html from "@lambdaurora/libhtml";
import { ComponentData } from "../../engine/component.ts";

const SideNavComponent: ComponentData<{ id: string, navigation_data: string }> = {
	selector: "sidenav",
	template: { path: "./sidenav.html" },
	render: async (ctx) => {
		const nav_data = await Deno.readTextFile(ctx.args.navigation_data)
			.then(data => JSON.parse(data)) as Array<{ type: string; name: string; link: string; description?: string; }>;

		const nav_entries = nav_data.map(entry => {
			const li = html.li({
				attributes: {
					class: "ls_nav_entry"
				}
			});

			if (entry.type === "link") {
				const div = html.div([
					html.a({
						attributes: {
							href: entry.link
						},
						children: [
							entry.name
						]
					})
				]);

				if (entry.description) {
					div.append_child(html.span([ entry.description ]));
				}

				li.append_child(div);

				if (ctx.page.path !== "/" && ctx.page.path.startsWith(entry.link)) {
					li.style("background-color", "var(--ls_theme_background_active)");
				}
			} else if (entry.type === "notice") {
				li.append_child(entry.name);
			}

			return li;
		});

		const header = ctx.args.children.find(node => node instanceof html.Element && node.tag.name === "header") as html.Element | undefined;
		const footer = ctx.args.children.find(node => node instanceof html.Element && node.tag.name === "footer") as html.Element | undefined;

		return {
			name: ctx.args.id,
			nav: nav_entries,
			header: header?.children,
			footer: footer?.children,
		};
	}
};
export default SideNavComponent;

