export * from "https://cdn.jsdelivr.net/npm/prismjs@1.27/prism.min.js";

export function get_prism() {
	return Prism;
}

const PRISM_LANGS = {};

export function get_prism_url(component) {
	return "https://cdn.jsdelivr.net/npm/prismjs@1.27/" + component;
}

export async function get_or_load_language(language) {
	if (PRISM_LANGS[language]) {
		return PRISM_LANGS[language];
	} else {
		try {
			return PRISM_LANGS[language] = await import(get_prism_url(`components/prism-${language}.min.js`));
		} catch (e) {
			return null;
		}
	}
}
