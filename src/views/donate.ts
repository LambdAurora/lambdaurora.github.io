import * as html from "@lambdaurora/libhtml";
import { ViewSpec } from "../engine/view.ts";

const title = "Donate";
const description = "Enjoy my work? Here are some ways you can support me and my work.";

export const SPEC: ViewSpec = {
	page: {
		title: "LambdAurora - " + title,
		description,
		embed: {
			title: title
		}
	},
	post_process: async (page) => {
		const head = page.children[0] as html.Element;
		head.append_child(html.script({
			attributes: {
				id: "discord:component-embed",
				type: "application/json",
			},
			children: [JSON.stringify({
				component: {
					type: 17,
					accent_color: 16734882,
					components: [
						{
							type: 9,
							components: [
								{
									type: 10,
									content: `# LambdAurora - ${title}!\n${description}`
								},
							],
							accessory: {
								type: 11,
								media: {
									url: "https://lambdaurora.dev/images/art/avatar_2022_02_no_bg.png"
								}
							}
						},
						{
							type: 14,
							spacing: 1
						},
						{
							type: 1,
							components: [
								{
									type: 2,
									style: 5,
									url: "https://ko-fi.com/LambdAurora", label: "ko-fi"
								},
								{
									type: 2,
									style: 5,
									url: "https://throne.com/LambdAurora", label: "Throne"
								}
							]
						}
					]
				}
			})]
		}));
	}
};
