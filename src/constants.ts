export const CONSTANTS = Object.freeze({
	site_name: "LambdAurora",
	site_logo: "/images/art/avatar_2022_02_no_bg_no_pins.png",
	root_url: "https://lambdaurora.dev",
	get_url(path: string) {
		return this.root_url + path;
	}
});
