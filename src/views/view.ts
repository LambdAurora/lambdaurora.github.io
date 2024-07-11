import * as html from "@lambdaurora/libhtml";
import * as md from "@lambdaurora/libmd";
import { CONSTANTS } from "../constants.ts";
import { EmbedSpec, PageSpec } from "../engine/page.ts";

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

export function remove_comments<N extends md.Node>(nodes: readonly N[]): N[] {
	return nodes.filter(node => {
		return !(node instanceof md.Comment);
	}).map(node => {
		if (node instanceof md.Element && node.children.length !== 0) {
			// deno-lint-ignore no-explicit-any
			(node as any).nodes = remove_comments(node.children);
		}

		return node;
	});
}
