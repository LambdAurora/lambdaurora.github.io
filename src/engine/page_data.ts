/*
 * Copyright 2024 LambdAurora <email@lambdaurora.dev>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Represents an embed.
 */
export interface EmbedSpec {
	/**
	 * The type of embed.
	 */
	type: "website" | "article";
	/**
	 * The title for the embed.
	 */
	title: string;
	/**
	 * The image to include in the embed.
	 */
	image?: { url: string; alt: string; };
	/**
	 * The style of embed for the image.
	 */
	style: "normal" | "large";
}

export interface IconsSpec {
	favicon?: string;
}

export interface PreloadEntrySpec {
	source: string;
	type: string;
}

export interface RichStyleEntrySpec {
	source: string;
	hash?: string;
	cross_origin?: string;
}

export type StyleEntrySpec = string | RichStyleEntrySpec;

export interface PageSpec {
	/**
	 * The title of the page.
	 */
	title: string;
	/**
	 * The description of the page.
	 */
	description: string;
	/**
	 * The keywords of the page.
	 */
	keywords?: string[];
	embed?: Partial<EmbedSpec>;
	icons?: IconsSpec;
	custom?: { [x: string]: unknown };
}

export interface PageData extends PageSpec {
	/**
	 * The path of this page.
	 */
	path: string;
}
