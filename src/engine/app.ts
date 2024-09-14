/*
 * Copyright 2024 LambdAurora <email@lambdaurora.dev>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export interface ApplicationData {
	name: string;
	root_url: string;
	logo?: string;
	debug: boolean;
}

export class Application implements Readonly<ApplicationData> {
	public readonly name: string;
	public readonly root_url: string;
	public readonly logo?: string;
	public readonly debug: boolean;

	constructor(
		data: ApplicationData
	) {
		this.name = data.name;
		this.root_url = data.root_url;
		this.logo = data.logo;
		this.debug = data.debug;
	}

	public get_url(path: string) {
		return this.root_url + path;
	}
}
