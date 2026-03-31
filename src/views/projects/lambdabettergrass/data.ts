export const title = "LambdaBetterGrass";
export const BRANCH = "26.1";

export function get_path(path: string) {
	return `https://raw.githubusercontent.com/LambdAurora/LambdaBetterGrass/${BRANCH}/${path}`;
}
