export interface Author {
	readonly name: string;
	readonly picture: string;
	readonly link?: string;
	readonly theme?: string;
}

export const AUTHORS: Record<string, Author> = {
	"lambdaurora": {
		name: "LambdAurora",
		picture: "/images/art/avatar_2022_02_no_pins.png",
	},
	"aurore": {
		name: "Aurore",
		picture: "/assets/avatar/aurore.png",
		link: "/system/aurore",
		theme: "aurore",
	},
	"layla": {
		name: "Layla",
		picture: "/assets/avatar/layla.png",
		link: "/system/layla",
		theme: "layla",
	},
	"akarys": {
		name: "Akarys",
		picture: "/assets/avatar/akarys.jpg",
		link: "https://akarys.me",
	},
};
