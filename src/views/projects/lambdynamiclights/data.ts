export const TITLE = "LambDynamicLights";
export const ICON = "/assets/projects/lambdynamiclights/icon_64.png";
export const BRANCH = "1.21.9";
export const THUMBNAIL = `https://github.com/LambdAurora/LambDynamicLights/raw/${BRANCH}/assets/fox_holding.png`;
export const KEYWORDS = [
	"LambDynamicLights",
	"LambdAurora",
	"Minecraft Mod",
	"dynamic lighting",
	"dynamic lights",
	"fabric",
	"neoforge",
	"forge", // fuck you
	"quilt", // >:(
];

export function get_path(path: string) {
	return `https://raw.githubusercontent.com/LambdAurora/LambDynamicLights/${BRANCH}/${path}`;
}
