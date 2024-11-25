export const TITLE = "LambDynamicLights";
export const ICON = "/assets/projects/lambdynamiclights/icon_64.png";
export const KEYWORDS = [
	"LambDynamicLights",
	"LambdAurora",
	"Minecraft Mod",
	"dynamic lighting",
	"dynamic lights"
];
export const BRANCH = "1.21.2";

export function get_path(path: string) {
	return `https://raw.githubusercontent.com/LambdAurora/LambDynamicLights/${BRANCH}/${path}`;
}
