export * from "https://cdn.jsdelivr.net/npm/prismjs@1.27/prism.min.js";
import "https://cdn.jsdelivr.net/npm/prismjs@1.27/components/prism-css.min.js";
import "https://cdn.jsdelivr.net/npm/prismjs@1.27/components/prism-css-extras.min.js";

//startregion FROM: https://cdn.jsdelivr.net/npm/prismjs@1.27/plugins/inline-color/prism-inline-color.js
// Copied from the markup language definition
const HTML_TAG = /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/g;

// a regex to validate hexadecimal colors
const HEX_COLOR = /^#?((?:[\da-f]){3,4}|(?:[\da-f]{2}){3,4})$/i;

/**
 * Parses the given hexadecimal representation and returns the parsed RGBA color.
 *
 * If the format of the given string is invalid, `undefined` will be returned.
 * Valid formats are: `RGB`, `RGBA`, `RRGGBB`, and `RRGGBBAA`.
 *
 * Hexadecimal colors are parsed because they are not fully supported by older browsers, so converting them to
 * `rgba` functions improves browser compatibility.
 *
 * @param {string} hex
 * @returns {string | undefined}
 */
function parseHexColor(hex) {
	const match = HEX_COLOR.exec(hex);
	if (!match) {
		return undefined;
	}
	hex = match[1]; // removes the leading "#"

	// the width and number of channels
	const channelWidth = hex.length >= 6 ? 2 : 1;
	const channelCount = hex.length / channelWidth;

	// the scale used to normalize 4bit and 8bit values
	const scale = channelWidth == 1 ? 1 / 15 : 1 / 255;

	// normalized RGBA channels
	const channels = [];
	for (let i = 0; i < channelCount; i++) {
		const int = parseInt(hex.substr(i * channelWidth, channelWidth), 16);
		channels.push(int * scale);
	}
	if (channelCount == 3) {
		channels.push(1); // add alpha of 100%
	}

	// output
	const rgb = channels.slice(0, 3).map(function (x) {
		return String(Math.round(x * 255));
	}).join(',');
	const alpha = String(Number(channels[3].toFixed(3))); // easy way to round 3 decimal places

	return 'rgba(' + rgb + ',' + alpha + ')';
}

const VALID_COLORS = [
	"aliceblue",
	"antiquewhite",
	"aqua",
	"aquamarine",
	"azure",
	"beige",
	"bisque",
	"black",
	"blanchedalmond",
	"blue",
	"blueviolet",
	"brown",
	"burlywood",
	"cadetblue",
	"chartreuse",
	"chocolate",
	"coral",
	"cornflowerblue",
	"cornsilk",
	"crimson",
	"cyan",
	"darkblue",
	"darkcyan",
	"darkgoldenrod",
	"darkgray",
	"darkgrey",
	"darkgreen",
	"darkkahki",
	"darkmagenta",
	"darkolivegreen",
	"darkorange",
	"darkorchid",
	"darkred",
	"darksalmon",
	"darkseagreen",
	"darkslateblue",
	"darkslategray",
	"darkslategrey",
	"darkturquoise",
	"darkviolet",
	"deeppink",
	"deepskyblue",
	"dimgray",
	"dimgrey",
	"dodgerblue",
	"firebrick",
	"floralwhite",
	"forestgreen",
	"gray",
	"grey",
	"green",
	"kahki",
	"magenta",
	"navajowhite",
	"orange",
	"red",
	"white"
];

/**
 * Validates the given Color using the current browser's internal implementation.
 *
 * @param {string} color
 * @returns {string | undefined}
 */
function validateColor(color) {
	if (color.match(/^(?:rgb(?:\(\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?\)|a\(\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?\d{1,3}\s?,\s?(?:\d{1,3}|[01]\.\d*)\s?\)))$/)) {
		return color;
	} else if (VALID_COLORS.includes(color.toLocaleLowerCase())) {
		return color;
	} else {
		return undefined;
	}
}

/**
 * An array of function which parse a given string representation of a color.
 *
 * These parser serve as validators and as a layer of compatibility to support color formats which the browser
 * might not support natively.
 *
 * @type {((value: string) => (string|undefined))[]}
 */
const parsers = [
	parseHexColor,
	validateColor
];

Prism.hooks.add('wrap', env => {
	if (env.type === 'color' || env.classes.indexOf('color') >= 0) {
		const content = env.content;

		// remove all HTML tags inside
		const rawText = content.split(HTML_TAG).join('');

		let color;
		for (let i = 0, l = parsers.length; i < l && !color; i++) {
			color = parsers[i](rawText);
		}

		if (!color) {
			return;
		}

		const previewElement = '<span class="ls_color_ship"><span style="background-color:' + color + ';"></span></span>';
		env.content = previewElement + content;
	}
});
//endregion
