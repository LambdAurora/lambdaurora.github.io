/*
 * Copyright 2024 LambdAurora <email@lambdaurora.dev>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import * as html from "@lambdaurora/libhtml";
import * as md from "@lambdaurora/libmd";
import { Application } from "./app.ts";
import { EmbedSpec, PageSpec, PreloadEntrySpec, StyleEntrySpec } from "./page_data.ts";

export type PostProcessFunction = (page: html.Element) => Promise<void>;

export interface ViewSpec {
	page: PageSpec;
	preload?: PreloadEntrySpec[];
	post_process?: PostProcessFunction;
	styles?: StyleEntrySpec[];
	custom?: { [x: string]: unknown };
}

export function resolve_embed(app: Application, page: PageSpec): EmbedSpec {
	return {
		type: page.embed?.type ?? "website",
		title: page.embed?.title ?? page.title,
		image: page.embed?.image ?? (app.logo ? {
			url: app.get_url(app.logo),
			alt: "Website Logo"
		} : undefined),
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
