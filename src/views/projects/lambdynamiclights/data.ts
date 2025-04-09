export const TITLE = "LambDynamicLights";
export const ICON = "/assets/projects/lambdynamiclights/icon_64.png";
export const THUMBNAIL = "https://github.com/LambdAurora/LambDynamicLights/raw/1.21.4/assets/fox_holding.png";
export const KEYWORDS = [
	"LambDynamicLights",
	"LambdAurora",
	"Minecraft Mod",
	"dynamic lighting",
	"dynamic lights"
];
export const BRANCH = "1.21.5";

export function get_path(path: string) {
	return `https://raw.githubusercontent.com/LambdAurora/LambDynamicLights/${BRANCH}/${path}`;
}
