import { copy } from "https://deno.land/std/fs/copy.ts";
import { existsSync, move } from "https://deno.land/std/fs/mod.ts";

import { BUILD_DIR, DEPLOY_DIR, DECODER, ENCODER } from "./src/constants.mjs"

async function build() {
	/* Main */

	console.log("Creating build directory...");
	if (existsSync(BUILD_DIR))
		await Deno.remove(BUILD_DIR, {recursive: true});

	await Deno.mkdir(BUILD_DIR).then(() => copy("./public", DEPLOY_DIR)).then(() => console.log("Copied static resources."));

	/* Style stuff */

	await copy("./src/style", DEPLOY_DIR + "/style");
	const result = await Deno.run(
		{
			cmd: [
				"sass",
				`${DEPLOY_DIR}/style/style.scss:${DEPLOY_DIR}/style/style.css`,
				`${DEPLOY_DIR}/style:${DEPLOY_DIR}/style`,
				"--style=compressed"
			] 
		}
	).status();

	if (!result.success) {
		console.error("Failed to build style.");
		Deno.exit(result.code);
	}

	Deno.readFile(DEPLOY_DIR + "/style/style.css.map")
		.then(source => DECODER.decode(source))
		.then(source => {
			const json = JSON.parse(source);
			json.sourceRoot = "/style";
			return JSON.stringify(json);
		}).then(source => ENCODER.encode(source))
		.then(source => Deno.writeFile(DEPLOY_DIR + "/style.css.map", source))
		.then(() => Deno.remove(DEPLOY_DIR + "/style/style.css.map"))
		.then(() => move(DEPLOY_DIR + "/style/style.css", DEPLOY_DIR + "/style.css"));
}

await build();
