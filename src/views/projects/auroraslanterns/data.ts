export const TITLE = "Aurora's Lanterns";
export const BRANCH = "26.1";
export const ICON = "/assets/projects/auroraslanterns/icon_64.png";
export const THUMBNAIL = get_path("/assets/overview.png");
export const KEYWORDS = [
	"Aurora's Lanterns",
	"LambdAurora",
	"Minecraft Mod"
];

export function get_path(path: string) {
	return `https://raw.githubusercontent.com/LambdAurora/AurorasLanterns/${BRANCH}/${path}`;
}
