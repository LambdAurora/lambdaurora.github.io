# LambDynamicLights v4.5.0 got released with NeoForge support!

<!--description: LambDynamicLights has received a fair share of updates lately, but now is time to properly address the multi-platform and the mess that is dynamic lighting on NeoForge.-->
<!--embed_image: /assets/blog/2025/09/ldl_neoforge_promo.png "LambDynamicLights 4.5.0 promotional picture." -->
<!--author: lambdaurora -->
<!--tag: minecraft modding, lambdynamiclights -->
<!--date: 2025-09-24 00:05:00 GMT+0200 -->

Since my last blog post (which has been a while, almost a year!), LambDynamicLights has gotten consistent and regular updates to ensure its availability
on new Minecraft updates. The mod has also gotten some backports to 1.20.1! Though, not many of those updates warranted a long-form post.

Until now, LambDynamicLights v4.5.0 has been released with NeoForge support!

<div align="center" style="margin-top: 2em; margin-bottom: 2em;">
<img class="ls_responsive_img" style="max-width: 40em;" src="/assets/blog/2025/09/ldl_neoforge_promo.png">
<span style="display: block;">*Banner made by [Akarys](https://bsky.app/profile/akarys.me/), my wonderful partner.*</span>
</div>

This is quite the milestone, especially as I've spent these last few months working towards this goal.

For ease of use, both Fabric and NeoForge are supported using the same JAR! So no way to get the wrong JAR! ;)

## What's Next?

Well, given the date, I think the first priority is going to be to port the mod to The Copper Age drop.

Then, despite the numerous additions, there is still much to do!

I have some things to look into next, no promises, as it's all still in the investigation stage:
- more optimizations, like culling to avoid computing dynamic light sources that are not visible;
- a system to support negative lighting after a request;
- maybe a proper API to make particles light up (the mod already uses the feature, but I haven't had time to properly design an API around this).

Outside the mod itself, I will also look into [Ars Nouveau](https://modrinth.com/mod/ars-nouveau), as the mod has used its own stripped-down version
of the old LambDynamicLights' lighting engine.
My goal will be to improve compatibility and integration, [I've already started work on it](https://github.com/baileyholl/Ars-Nouveau/pull/1933).

[I also have a Throne page now.](https://donate.lambdaurora.dev) If you want to support me and allow me to continue to provide quality updates to LambDynamicLights and my other mods, I would appreciate it!

## Why now? And why not earlier?

Initially, LambDynamicLights has gotten some forks, which, *at first*, only focused on porting the mod to Forge/NeoForge.
Back then, it was just Forge, and I've focused my efforts on Fabric, especially due to preferring the platform.
When we were actually building OptiFine alternatives, the platform of choice was Fabric, especially since Forge still had OptiFine despite its issues.

However, this changed last year as I've gotten huge delays to update the mod ([see my LambDynamicLights v3 blog post for reference](http://localhost:9091/blog/2024/10/lambdynamiclights_3.0.0.html#a-long-wait,-and-what's-next?)).
The forks had started moving forward without upstream and making Fabric ports.
One publishing to Fabric only weeks away from the official LambDynamicLights v3 update.
As I was reevaluating my approach to how I license my mods, this has blindsided me, as I planned to give out permission to continue updating the NeoForge fork.
Of course, this has broken the hope I had and forced me to change how I approach the multiplatform problem.

My issue with the forks that updated before upstream is that they have not made any attempts at helping me port the upstream mod;
instead short-circuiting it entirely, and they've done a bad job: I've witnessed quite a share of bugs unique to these forks.

This has also put LambDynamicLights v3 in a difficult spot: the API **had** to evolve, it was stuck with a very bad design, and it prevented the internals of the mod from properly improving.
I've tried very hard to not break the API contract within the same Minecraft version, which is (or should be) a common philosophy in loaders/APIs.
But those forks have essentially forced me to make breaking API changes that would be incompatible with them.
I am sorry to API users who've had to deal with this mess.

Someone approached me to make [a NeoForge-only fork](https://modrinth.com/mod/lambdynamiclights-unofficial-neoforge), which I've appreciated, though it has ceased updating, and I can't blame that.
This has led me to actually look into properly making the API JAR usable directly on NeoForge, to make sure the fork would keep the same API contract.
It was easy since the API JAR already was not dependent on any loader-specific features, and used [Yumi Commons' events](https://github.com/YumiProject/yumi-commons) for the few events it has. The Fabric-style entrypoint is also easy to re-create on NeoForge.

Ever since, I've spent a lot of time working on new tools to ensure the mod would work properly on NeoForge using Sinytra Connector as well,
going as far as abstracting as much as possible some loader-specific features and making a new entrypoint system inspired by Fabric while working
*with* NeoForge mods, allowing NeoForge mods to interoperate with LambDynamicLights using the new API.

However, even with the API JAR now properly multiloader, this has not led the previous forks to seek a solution or to resolve the API disparity.
This has led to a big mess on NeoForge, with mods looking into dynamic lighting getting hit by a wall where the most feature-complete and optimized option is not native to their platform, and the forks being severely behind with a diverging API.

I think true multiloader support is one that also has in mind Sinytra Connector and actually looks into how to make an API multiloader if it provides one.
Though Sinytra Connector is only the cherry on top, in LambDynamicLights' case the whole cake was still missing on NeoForge.
For example, LambDynamicLights could not be easily searched for in launchers when targeting NeoForge, and websites do not give me the ability to properly mark a loader-specific dependency.

Now my efforts into building the tooling I sought have paid off; all the libraries I've been using are now working on NeoForge natively as well.
LambDynamicLights on NeoForge is finally feasible without sacrificing my development ergonomics.
It is clear that there is a demand, and it would be stupid now that I have the tooling to let the situation fester any longer.

tl;dr I first had no interest, then NeoForge dynamic lighting became a mess, and I have the tooling now.

## Downloads

### 1.21.8

<div class="ls_download_container">
	<a
		href="https://modrinth.com/mod/lambdynamiclights/version/4.5.0+1.21.8"
		title="LambDynamicLights Modrinth page"
		class="ls_download_item"
	>
		<svg aria-hidden="true" viewBox="16 -2 150 150" version="1.1" data-view-component="true" width="42" height="42">
			<path fill-rule="evenodd" fill="#1bd96a" d="M159.07,89.29A70.94,70.94,0,1,0,20,63.52H32A58.78,58.78,0,0,1,145.23,49.93l-11.66,3.12a46.54,46.54,0,0,0-29-26.52l-2.15,12.13a34.31,34.31,0,0,1,2.77,63.26l3.19,11.9a46.52,46.52,0,0,0,28.33-49l11.62-3.1A57.94,57.94,0,0,1,147.27,85Z"></path><path fill-rule="evenodd" fill="#1bd96a" d="M108.92,139.3A70.93,70.93,0,0,1,19.79,76h12a59.48,59.48,0,0,0,1.78,9.91,58.73,58.73,0,0,0,3.63,9.91l10.68-6.41a46.58,46.58,0,0,1,44.72-65L90.43,36.54A34.38,34.38,0,0,0,57.36,79.75C57.67,80.88,58,82,58.43,83l13.66-8.19L68,63.93l12.9-13.25,16.31-3.51L101.9,53l-7.52,7.61-6.55,2.06-4.69,4.82,2.3,6.38s4.64,4.94,4.65,4.94l6.57-1.74,4.67-5.13,10.2-3.24,3,6.84L104.05,88.43,86.41,94l-7.92-8.81L64.7,93.48a34.44,34.44,0,0,0,28.72,11.59L96.61,117A46.6,46.6,0,0,1,54.13,99.83l-10.64,6.38a58.81,58.81,0,0,0,99.6-9.77l11.8,4.29A70.77,70.77,0,0,1,108.92,139.3Z"></path>
		</svg>
		Modrinth
	</a>
	<a
		href="https://www.curseforge.com/minecraft/mc-mods/lambdynamiclights/files/7027118"
		title="LambDynamicLights CurseForge page"
		class="ls_download_item"
	>
		<svg aria-hidden="true" viewBox="-2017 853 43 23" version="1.1" data-view-component="true" src="https://www.curseforge.com/Content/2-0-8083-18015/Skins/CurseForge/images/anvil.svg" width="42" height="42" style="fill: var(--ls_theme_primary);">
			<path fill-rule="evenodd" d="M-2005.7,853l0.7,3c-3.5,0-12,0-12,0s0.2,0.9,0.3,1c0.3,0.5,0.6,1.1,1,1.5c1.9,2.2,5.2,3.1,7.9,3.6  c1.9,0.4,3.8,0.5,5.7,0.6l2.2,5.9h1.2l0.7,1.9h-1l-1.7,5.5h16.7l-1.7-5.5h-1l0.7-1.9h1.2c0,0,1-6.1,4.1-8.9c3-2.8,6.7-3.2,6.7-3.2  V853H-2005.7z M-1988.9,868.1c-0.8,0.5-1.7,0.5-2.3,0.9c-0.4,0.2-0.6,0.8-0.6,0.8c-0.4-0.9-0.9-1.2-1.5-1.4  c-0.6-0.2-1.7-0.1-3.2-1.4c-1-0.9-1.1-2.1-1-2.7v-0.1c0-0.1,0-0.1,0-0.2s0-0.2,0.1-0.3l0,0l0,0c0.2-0.6,0.7-1.2,1.7-1.6  c0,0-0.7,1,0,2c0.4,0.6,1.2,0.9,1.9,0.5c0.3-0.2,0.5-0.6,0.6-0.9c0.2-0.7,0.2-1.4-0.4-1.9c-0.9-0.8-1.1-1.9-0.5-2.6  c0,0,0.2,0.9,1.1,0.8c0.6,0,0.6-0.2,0.4-0.4c-0.1-0.3-1.4-2.2,0.5-3.6c0,0,1.2-0.8,2.6-0.7c-0.8,0.1-1.7,0.6-2,1.4c0,0,0,0,0,0.1  c-0.3,0.8-0.1,1.7,0.5,2.5c0.4,0.6,0.9,1.1,1.1,1.9c-0.3-0.1-0.5,0-0.7,0.2c-0.2,0.2-0.3,0.6-0.2,0.9c0.1,0.2,0.3,0.4,0.5,0.4  c0.1,0,0.1,0,0.2,0h0.1c0.3-0.1,0.5-0.5,0.4-0.8c0.2,0.2,0.3,0.7,0.2,1c0,0.3-0.2,0.6-0.3,0.8c-0.1,0.2-0.3,0.4-0.4,0.6  s-0.2,0.4-0.2,0.6c0,0.2,0,0.5,0.1,0.7c0.4,0.6,1.2,0,1.4-0.5c0.3-0.6,0.2-1.3-0.2-1.9c0,0,0.7,0.4,1.2,1.8  C-1987.4,866.2-1988.1,867.6-1988.9,868.1z"></path>
		</svg>
		CurseForge
	</a>
	<a
		href="https://github.com/LambdAurora/LambDynamicLights/releases/tag/v4.5.0%2B1.21.8"
		title="LambDynamicLights GitHub page"
		class="ls_download_item"
	>
		<svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" width="42" height="42" style="fill: var(--ls_theme_primary);">
			<path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
		</svg>
		GitHub releases
	</a>
</div>

### 1.21.5

<div class="ls_download_container">
	<a
		href="https://modrinth.com/mod/lambdynamiclights/version/4.5.0+1.21.5"
		title="LambDynamicLights Modrinth page"
		class="ls_download_item"
	>
		<svg aria-hidden="true" viewBox="16 -2 150 150" version="1.1" data-view-component="true" width="42" height="42">
			<path fill-rule="evenodd" fill="#1bd96a" d="M159.07,89.29A70.94,70.94,0,1,0,20,63.52H32A58.78,58.78,0,0,1,145.23,49.93l-11.66,3.12a46.54,46.54,0,0,0-29-26.52l-2.15,12.13a34.31,34.31,0,0,1,2.77,63.26l3.19,11.9a46.52,46.52,0,0,0,28.33-49l11.62-3.1A57.94,57.94,0,0,1,147.27,85Z"></path><path fill-rule="evenodd" fill="#1bd96a" d="M108.92,139.3A70.93,70.93,0,0,1,19.79,76h12a59.48,59.48,0,0,0,1.78,9.91,58.73,58.73,0,0,0,3.63,9.91l10.68-6.41a46.58,46.58,0,0,1,44.72-65L90.43,36.54A34.38,34.38,0,0,0,57.36,79.75C57.67,80.88,58,82,58.43,83l13.66-8.19L68,63.93l12.9-13.25,16.31-3.51L101.9,53l-7.52,7.61-6.55,2.06-4.69,4.82,2.3,6.38s4.64,4.94,4.65,4.94l6.57-1.74,4.67-5.13,10.2-3.24,3,6.84L104.05,88.43,86.41,94l-7.92-8.81L64.7,93.48a34.44,34.44,0,0,0,28.72,11.59L96.61,117A46.6,46.6,0,0,1,54.13,99.83l-10.64,6.38a58.81,58.81,0,0,0,99.6-9.77l11.8,4.29A70.77,70.77,0,0,1,108.92,139.3Z"></path>
		</svg>
		Modrinth
	</a>
	<a
		href="https://www.curseforge.com/minecraft/mc-mods/lambdynamiclights/files/7027103"
		title="LambDynamicLights CurseForge page"
		class="ls_download_item"
	>
		<svg aria-hidden="true" viewBox="-2017 853 43 23" version="1.1" data-view-component="true" src="https://www.curseforge.com/Content/2-0-8083-18015/Skins/CurseForge/images/anvil.svg" width="42" height="42" style="fill: var(--ls_theme_primary);">
			<path fill-rule="evenodd" d="M-2005.7,853l0.7,3c-3.5,0-12,0-12,0s0.2,0.9,0.3,1c0.3,0.5,0.6,1.1,1,1.5c1.9,2.2,5.2,3.1,7.9,3.6  c1.9,0.4,3.8,0.5,5.7,0.6l2.2,5.9h1.2l0.7,1.9h-1l-1.7,5.5h16.7l-1.7-5.5h-1l0.7-1.9h1.2c0,0,1-6.1,4.1-8.9c3-2.8,6.7-3.2,6.7-3.2  V853H-2005.7z M-1988.9,868.1c-0.8,0.5-1.7,0.5-2.3,0.9c-0.4,0.2-0.6,0.8-0.6,0.8c-0.4-0.9-0.9-1.2-1.5-1.4  c-0.6-0.2-1.7-0.1-3.2-1.4c-1-0.9-1.1-2.1-1-2.7v-0.1c0-0.1,0-0.1,0-0.2s0-0.2,0.1-0.3l0,0l0,0c0.2-0.6,0.7-1.2,1.7-1.6  c0,0-0.7,1,0,2c0.4,0.6,1.2,0.9,1.9,0.5c0.3-0.2,0.5-0.6,0.6-0.9c0.2-0.7,0.2-1.4-0.4-1.9c-0.9-0.8-1.1-1.9-0.5-2.6  c0,0,0.2,0.9,1.1,0.8c0.6,0,0.6-0.2,0.4-0.4c-0.1-0.3-1.4-2.2,0.5-3.6c0,0,1.2-0.8,2.6-0.7c-0.8,0.1-1.7,0.6-2,1.4c0,0,0,0,0,0.1  c-0.3,0.8-0.1,1.7,0.5,2.5c0.4,0.6,0.9,1.1,1.1,1.9c-0.3-0.1-0.5,0-0.7,0.2c-0.2,0.2-0.3,0.6-0.2,0.9c0.1,0.2,0.3,0.4,0.5,0.4  c0.1,0,0.1,0,0.2,0h0.1c0.3-0.1,0.5-0.5,0.4-0.8c0.2,0.2,0.3,0.7,0.2,1c0,0.3-0.2,0.6-0.3,0.8c-0.1,0.2-0.3,0.4-0.4,0.6  s-0.2,0.4-0.2,0.6c0,0.2,0,0.5,0.1,0.7c0.4,0.6,1.2,0,1.4-0.5c0.3-0.6,0.2-1.3-0.2-1.9c0,0,0.7,0.4,1.2,1.8  C-1987.4,866.2-1988.1,867.6-1988.9,868.1z"></path>
		</svg>
		CurseForge
	</a>
	<a
		href="https://github.com/LambdAurora/LambDynamicLights/releases/tag/v4.5.0%2B1.21.5"
		title="LambDynamicLights GitHub page"
		class="ls_download_item"
	>
		<svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" width="42" height="42" style="fill: var(--ls_theme_primary);">
			<path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
		</svg>
		GitHub releases
	</a>
</div>

### 1.21.1

<div class="ls_download_container">
	<a
		href="https://modrinth.com/mod/lambdynamiclights/version/4.5.0+1.21.1"
		title="LambDynamicLights Modrinth page"
		class="ls_download_item"
	>
		<svg aria-hidden="true" viewBox="16 -2 150 150" version="1.1" data-view-component="true" width="42" height="42">
			<path fill-rule="evenodd" fill="#1bd96a" d="M159.07,89.29A70.94,70.94,0,1,0,20,63.52H32A58.78,58.78,0,0,1,145.23,49.93l-11.66,3.12a46.54,46.54,0,0,0-29-26.52l-2.15,12.13a34.31,34.31,0,0,1,2.77,63.26l3.19,11.9a46.52,46.52,0,0,0,28.33-49l11.62-3.1A57.94,57.94,0,0,1,147.27,85Z"></path><path fill-rule="evenodd" fill="#1bd96a" d="M108.92,139.3A70.93,70.93,0,0,1,19.79,76h12a59.48,59.48,0,0,0,1.78,9.91,58.73,58.73,0,0,0,3.63,9.91l10.68-6.41a46.58,46.58,0,0,1,44.72-65L90.43,36.54A34.38,34.38,0,0,0,57.36,79.75C57.67,80.88,58,82,58.43,83l13.66-8.19L68,63.93l12.9-13.25,16.31-3.51L101.9,53l-7.52,7.61-6.55,2.06-4.69,4.82,2.3,6.38s4.64,4.94,4.65,4.94l6.57-1.74,4.67-5.13,10.2-3.24,3,6.84L104.05,88.43,86.41,94l-7.92-8.81L64.7,93.48a34.44,34.44,0,0,0,28.72,11.59L96.61,117A46.6,46.6,0,0,1,54.13,99.83l-10.64,6.38a58.81,58.81,0,0,0,99.6-9.77l11.8,4.29A70.77,70.77,0,0,1,108.92,139.3Z"></path>
		</svg>
		Modrinth
	</a>
	<a
		href="https://www.curseforge.com/minecraft/mc-mods/lambdynamiclights/files/7027087"
		title="LambDynamicLights CurseForge page"
		class="ls_download_item"
	>
		<svg aria-hidden="true" viewBox="-2017 853 43 23" version="1.1" data-view-component="true" src="https://www.curseforge.com/Content/2-0-8083-18015/Skins/CurseForge/images/anvil.svg" width="42" height="42" style="fill: var(--ls_theme_primary);">
			<path fill-rule="evenodd" d="M-2005.7,853l0.7,3c-3.5,0-12,0-12,0s0.2,0.9,0.3,1c0.3,0.5,0.6,1.1,1,1.5c1.9,2.2,5.2,3.1,7.9,3.6  c1.9,0.4,3.8,0.5,5.7,0.6l2.2,5.9h1.2l0.7,1.9h-1l-1.7,5.5h16.7l-1.7-5.5h-1l0.7-1.9h1.2c0,0,1-6.1,4.1-8.9c3-2.8,6.7-3.2,6.7-3.2  V853H-2005.7z M-1988.9,868.1c-0.8,0.5-1.7,0.5-2.3,0.9c-0.4,0.2-0.6,0.8-0.6,0.8c-0.4-0.9-0.9-1.2-1.5-1.4  c-0.6-0.2-1.7-0.1-3.2-1.4c-1-0.9-1.1-2.1-1-2.7v-0.1c0-0.1,0-0.1,0-0.2s0-0.2,0.1-0.3l0,0l0,0c0.2-0.6,0.7-1.2,1.7-1.6  c0,0-0.7,1,0,2c0.4,0.6,1.2,0.9,1.9,0.5c0.3-0.2,0.5-0.6,0.6-0.9c0.2-0.7,0.2-1.4-0.4-1.9c-0.9-0.8-1.1-1.9-0.5-2.6  c0,0,0.2,0.9,1.1,0.8c0.6,0,0.6-0.2,0.4-0.4c-0.1-0.3-1.4-2.2,0.5-3.6c0,0,1.2-0.8,2.6-0.7c-0.8,0.1-1.7,0.6-2,1.4c0,0,0,0,0,0.1  c-0.3,0.8-0.1,1.7,0.5,2.5c0.4,0.6,0.9,1.1,1.1,1.9c-0.3-0.1-0.5,0-0.7,0.2c-0.2,0.2-0.3,0.6-0.2,0.9c0.1,0.2,0.3,0.4,0.5,0.4  c0.1,0,0.1,0,0.2,0h0.1c0.3-0.1,0.5-0.5,0.4-0.8c0.2,0.2,0.3,0.7,0.2,1c0,0.3-0.2,0.6-0.3,0.8c-0.1,0.2-0.3,0.4-0.4,0.6  s-0.2,0.4-0.2,0.6c0,0.2,0,0.5,0.1,0.7c0.4,0.6,1.2,0,1.4-0.5c0.3-0.6,0.2-1.3-0.2-1.9c0,0,0.7,0.4,1.2,1.8  C-1987.4,866.2-1988.1,867.6-1988.9,868.1z"></path>
		</svg>
		CurseForge
	</a>
	<a
		href="https://github.com/LambdAurora/LambDynamicLights/releases/tag/v4.5.0%2B1.21.1"
		title="LambDynamicLights GitHub page"
		class="ls_download_item"
	>
		<svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" width="42" height="42" style="fill: var(--ls_theme_primary);">
			<path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
		</svg>
		GitHub releases
	</a>
</div>

## Closing Words

Thank you for your support and have fun!
I am really excited to see how the mod will be integrated on NeoForge!

<div style="display: flex; flex-direction: row; justify-content: center; gap: 1.5em; margin: 2em;">
	<img class="ls_img" src="/assets/squib/aurora_eepy.png" style="width: 200px; transform: rotate(-45deg);" />
</div>
