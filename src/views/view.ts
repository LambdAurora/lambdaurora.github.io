import {html, md} from "@lib.md/mod.mjs";
import {CONSTANTS} from "../constants.ts";

export interface EmbedSpec {
	type: "website" | "article";
	title: string;
	image: { url: string; alt: string; };
	style: "normal" | "large";
}

export interface IconsSpec {
	favicon?: string;
}

export interface PageSpec {
	title: string;
	description: string;
	keywords?: string[];
	embed?: Partial<EmbedSpec>;
	icons?: IconsSpec;
	custom?: { [x: string]: unknown };
}

export type PostProcessFunction = (page: html.Element) => Promise<void>;

export interface PreloadSpec {
	source: string;
	type: string;
}

export interface StyleSpec {
	source: string;
	hash?: string;
	cross_origin?: string;
}

export type StyleSpecEntry = string | StyleSpec;

export interface ViewSpec {
	page: PageSpec;
	preload?: PreloadSpec[];
	post_process?: PostProcessFunction;
	styles?: StyleSpecEntry[];
	custom?: { [x: string]: unknown };
}

export function resolve_embed(page: PageSpec): EmbedSpec {
	return {
		type: page.embed?.type ?? "website",
		title: page.embed?.title ?? page.title,
		image: page.embed?.image ?? {
			url: CONSTANTS.get_url(CONSTANTS.site_logo),
			alt: "Website Logo"
		},
		style: page.embed?.style ?? "normal"
	}
}

export function remove_comments(nodes: md.Node[]) {
	return nodes.filter(node => {
		return !(node instanceof md.Comment);
	}).map(node => {
		if (node instanceof md.Element && node.nodes.length !== 0) {
			node.nodes = remove_comments(node.nodes);
		}

		return node;
	});
}
