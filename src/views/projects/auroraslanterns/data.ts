export const TITLE = "Aurora's Lanterns";
export const ICON = "/assets/projects/auroraslanterns/icon_64.png";
export const THUMBNAIL = "https://github.com/LambdAurora/AurorasLanterns/raw/1.21.8/assets/overview.png";
export const KEYWORDS = [
	"Aurora's Lanterns",
	"LambdAurora",
	"Minecraft Mod"
];
export const BRANCH = "1.21.8";

export function get_path(path: string) {
	return `https://raw.githubusercontent.com/LambdAurora/AurorasLanterns/${BRANCH}/${path}`;
}
