import * as html from "@lambdaurora/libhtml";
import { ComponentBaseArgs, ComponentContext, ComponentData } from "../../engine/component.ts";

interface NavEntry {
	type: "link" | "notice" | "dir";
	name: string;
}

interface NavLinkEntry extends NavEntry {
	type: "link";
	name: string;
	link: string;
	description?: string;
	never_highlight?: boolean;
}

interface NavDirEntry extends NavEntry {
	type: "dir";
	name: string;
	link?: string;
	open?: boolean;
	items: readonly NavEntry[];
}

function should_highlight(ctx: ComponentContext<ComponentBaseArgs & { id: string, navigation_data: string }>, entry: NavEntry): boolean {
	if (entry.type === "link") {
		const link_entry = entry as NavLinkEntry;

		if (!link_entry.never_highlight && ctx.page.path !== "/" && ctx.page.path.startsWith(link_entry.link)) {
			return true;
		}
	} else if (entry.type === "dir") {
		const dir_entry = entry as NavDirEntry;

		if (dir_entry.link && ctx.page.path !== "/" && ctx.page.path.startsWith(dir_entry.link)) {
			return dir_entry.items.find(entry => should_highlight(ctx, entry)) === undefined;
		}
	}

	return false;
}

function build_nav(ctx: ComponentContext<ComponentBaseArgs & { id: string, navigation_data: string }>, nav_data: readonly NavEntry[]): html.Element[] {
	return nav_data.map(entry => {
		const li = html.li({
			attributes: {
				class: "ls_nav_entry"
			}
		});

		if (entry.type === "link") {
			const link_entry = entry as NavLinkEntry;
			const div = html.div([
				html.a({
					attributes: {
						href: link_entry.link
					},
					children: [
						entry.name
					]
				})
			]);

			if (link_entry.description) {
				div.append_child(html.span([ link_entry.description ]));
			}

			li.append_child(div);

			if (should_highlight(ctx, entry)) {
				li.style("background-color", "var(--ls_theme_background_active)");
			}
		} else if (entry.type === "notice") {
			li.append_child(entry.name);
		} else if (entry.type === "dir") {
			li.attr("class").remove("ls_nav_entry");
			li.attr("class").add("ls_nav_dir_entry");

			const dir_entry = entry as NavDirEntry;
;
			const link = dir_entry.link ? html.a({
					attributes: {
						href: dir_entry.link
					},
					children: [
						entry.name
					]
			}) : entry.name;

			const details = html.details({
				children: [
					html.summary([link]),
					html.ul(build_nav(ctx, dir_entry.items))
				]
			});
			li.append_child(details);

			if (dir_entry.open) {
				details.attr("open", "");
			}

			if (should_highlight(ctx, entry)) {
				li.style("background-color", "var(--ls_theme_background_active)");
			}
		}

		return li;
	});
}

const SideNavComponent: ComponentData<{ id: string, navigation_data: string }> = {
	selector: "sidenav",
	template: { path: "./sidenav.html" },
	render: async (ctx) => {
		const nav_data = await Deno.readTextFile(ctx.args.navigation_data)
			.then(data => JSON.parse(data)) as Array<NavEntry>;

		const nav_entries = build_nav(ctx, nav_data);

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

