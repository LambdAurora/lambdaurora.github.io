export const CONSTANTS = Object.freeze({
	site_name: "LambdAurora",
	site_logo: "/images/art/avatar_2022_02_no_bg_no_pins.png",
	root_url: "https://lambdaurora.dev",
	themes: Object.freeze({
		aurore: Object.freeze({
			primary: "#ff5aa2",
		}),
		layla: Object.freeze({
			primary: "#14bbe7",
		}),
	}),
	get_url(path: string) {
		return this.root_url + path;
	}
});
