# LambDynamicLights v4.0.0 got released!

<!--description: The Garden Awakens, but not alone. LambDynamicLights continue its improvement and updating streak with LambDynamicLights v4.0.0 for Minecraft 1.21.4! Come read about all the new exciting features and how much the mod has been reworked to reach a new high quality.-->
<!--embed_image: /assets/blog/2024/12/ldl_4_promo.png "LambDynamicLights 4.0.0 promotional picture." -->
<!--author: lambdaurora -->
<!--author: akarys -->
<!--tag: minecraft modding, lambdynamiclights -->
<!--date: 2024-12-03 22:45:00 GMT+0200 -->

The Garden Awakens, but not alone. [LambDynamicLights] continue its improvement and updating streak with LambDynamicLights v4.0.0 for Minecraft 1.21.4!

I have worked relentlessly with my wonderful partner, [Akarys](https://bsky.app/profile/akarys.me), to bring this update to you all.
On the table we have some changes that have made it into some subsequents updates of LambDynamicLights v3 which I didn't had an occasion to really talk about,
and some very exciting changes in LambDynamicLights v4.0.0 for modders, modpack makers, and users!

Before getting into this post, I invite you to watch the new carefully crafted trailer made by Akarys, made to celebrate this new release:

<div align="center">
<iframe width="560" height="315" src="https://www.youtube.com/embed/xew0s2TwZ84" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
</iframe>
</div>

## Optimizations!

Before going into the changes brought in LambDynamicLights v4.0.0, I think it's important to address this big improvement that is also part of LambDynamicLights v3.0.0.
As you might recall from the previous blog post, no mention of it was made. This is because those performance improvements haven't made it into the initial release.

With some hard work along with Akarys, we managed to rework the dynamic lighting engine entirely with multiple goals:
- significantly clean up LambDynamicLights' code to make it more maintainable;
- significantly improve performances as this has always been the black sheep of this mod.

We will not be getting into the technical details of this rework in this post, there might be a post on either my or Akarys' blog about it in the future for those curious about it.

To illustrate this point, here's a comparison picture on 1.21.1 with LambDynamicLights v3:

![Performance comparison on 1.21.1 between unoptimized and optimized version of LambDynamicLights, the test scene uses a thousand Magma Cubes in a Basalt Deltas biome. The unoptimized version runs at 3 FPS, while the optimized version runs at 69 FPS.](/assets/blog/2024/12/ldl_perf_comparison.jpg)

Furthermore, I can now proudly say that LambDynamicLights is the most optimized dynamic lighting mod on Fabric!
[It's even more optimized than OptiFine without Sodium!](/assets/blog/2024/12/ldl_optifine_perf_comparison.png)

## New Features

While most new features target other modders, modpack makers, and resource pack makers.
Some of those new features allowed for the addition of visible features like Beacon beams lighting, or even Guardian lasers lighting!

![Guardian laser dynamically lighting the surrounding area.](https://github.com/LambdAurora/LambDynamicLights/blob/1.21.4/assets/guardian_laser.png?raw=true)

While I've voiced concern in the past about adding such features to the mod, mostly due to performance, I can now say that I'm proud to have such unique
features in this mod! This should give you an idea of how much the mod has been reworked and optimized to allow such features,
which opens up many more possibilities for other modders as well!

## New API Features and Documentation

Speaking of opening up more possibilities for other modders, and without forgetting about modpack makers or resource pack makers, this update comes pack with the final
additions of the API rework I've started with LambDynamicLights v3.0.0.

While you might recall that I've reworked how item lighting is defined in resource packs, this update is the final step of the data-ification of the mod with the added
ability to define entity lighting through resource packs! This has required additional work to make this flexible *and* feature-complete.
This new entity lighting API takes the form of both JSON and Java code:
- the Java code is mainly used to define entity luminance providers, which are identified bits of code that allow to provide a luminance value following a specific behavior;
- the JSON is mainly used to attach those luminance providers to matching entities. Some luminance providers are generic to allow their re-use on different entities.

Aside from more JSON, Java-enjoyers can rejoice through the addition of a new API: the dynamic light behavior API.
This API allows the definition of fully custom dynamic light sources and how they behave, and add them into the world.
This is the same API that's been used to make possible the Guardian lasers or the Beam beams dynamic lighting.

To accompany all of this, [a new documentation page](/projects/lambdynamiclights/docs/v4/) is available on this very website!
This has been needed for a good while now, as the old documentation was too condensed and too confusing.

As a bonus, the API code is also multi-loader, so multi-loader modders rejoice, you can now make the dynamic lighting code fully common!

I am excited to see what people will build with those new features!

## Changelog

- Added the ability to define entity light sources in resource packs.
  - Please refer yourself to the documentation for more details.
- Added display entities dynamic lighting ([#209](https://github.com/LambdAurora/LambDynamicLights/issues/209)).
  - This affects both block and item displays.
  - If a custom brightness is defined then dynamic lighting disables itself.
- Added a new API to define fully custom dynamic lighting of varying shapes.
  - Added dynamic lighting to Beacon beams ([#115][issue115]).
  - Added dynamic lighting to End Gateway beams ([#115][issue115]).
  - Added dynamic lighting to Guardian lasers ([#115][issue115]).
- Added debug settings and renderers to facilitate debugging.
  - Added a debug renderer of active dynamic lighting cells.
  - Added a debug renderer to display chunk rebuilds.
  - Added a debug renderer of dynamic light levels.
  - Added a debug renderer of display the bounding boxes of custom dynamic light sources.
- Added built-in support for Trinkets and Accessories, should work as soon as they update.
- Updated the data displayed in the F3 HUD to show more information about dynamic lighting.
- Refactored heavily the ticking of entity dynamic lighting to make it more abstract.
- Refactored heavily how chunk rebuilds are queued and how dynamic light sources are represented.
- Fixed API publication for loom-based setups.
- Added Upside-down English translations ([#254](https://github.com/LambdAurora/LambDynamicLights/pull/254)).
- Updated Dutch translations ([#252](https://github.com/LambdAurora/LambDynamicLights/pull/252)).
- Updated German translations ([#253](https://github.com/LambdAurora/LambDynamicLights/pull/253)).
- Updated Italian translations ([#255](https://github.com/LambdAurora/LambDynamicLights/pull/255)).
- Updated [SpruceUI].

## Downloads

<div style="display: flex; flex-direction: row; justify-content: center; gap: 1.5em; margin: 2em;">
	<a
		href="https://modrinth.com/mod/lambdynamiclights/version/4.0.0+1.21.4"
		title="LambDynamicLights Modrinth page"
		style="display: inline-flex; align-items: center; gap: .5em;"
	>
		<icon:modrinth ls_size="xl" aria-hidden="true" />
		Modrinth
	</a>
	<a
		href="https://www.curseforge.com/minecraft/mc-mods/lambdynamiclights/files/5959688"
		title="LambDynamicLights CurseForge page"
		style="display: inline-flex; align-items: center; gap: .5em;"
	>
		<icon:curseforge ls_size="xl" aria-hidden="true" color="var(--ls_theme_primary)" />
		CurseForge
	</a>
	<a
		href="https://github.com/LambdAurora/LambDynamicLights/releases/tag/v4.0.0%2B1.21.4"
		title="LambDynamicLights GitHub page"
		style="display: inline-flex; align-items: center; gap: .5em;"
	>
		<icon:github ls_size="xl" aria-hidden="true" color="var(--ls_theme_primary)" />
		GitHub releases
	</a>
</div>

## Wait a Minute, There's More!?

For those who have watched carefully the trailer, they might have noticed an additional section at the end.

This is also the trailer of Illuminated: our new mod and flashlight addon to LambDynamicLights.

In addition of flashlights setting a very special mood in the game, it also show what the new dynamic lighting behavior API *can* do.

We hope that you will try it out and enjoy it!

### Illuminated Downloads

As soon as the project passes approval from CurseForge and Modrinth.

<!--
<div style="display: flex; flex-direction: row; justify-content: center; gap: 1.5em; margin: 2em;">
	<a
		href="https://modrinth.com/mod/dawns_reach/version/1.0.0+1.21.4"
		title="Illuminated Modrinth page"
		style="display: inline-flex; align-items: center; gap: .5em;"
	>
		<icon:modrinth ls_size="xl" aria-hidden="true" />
		Modrinth
	</a>
	<a
		href="https://www.curseforge.com/minecraft/mc-mods/dawns_reach/files/5798757"
		title="Illuminated CurseForge page"
		style="display: inline-flex; align-items: center; gap: .5em;"
	>
		<icon:curseforge ls_size="xl" aria-hidden="true" color="var(--ls_theme_primary)" />
		CurseForge
	</a>
	<a
		href="https://github.com/LambdAurora/Illuminated/releases/tag/v1.0.0%2B1.21.4"
		title="Illuminated GitHub page"
		style="display: inline-flex; align-items: center; gap: .5em;"
	>
		<icon:github ls_size="xl" aria-hidden="true" color="var(--ls_theme_primary)" />
		GitHub releases
	</a>
</div>
-->

## Conclusion

If you've enjoyed this post, this update, or Illuminated, we invite you to follow us on our socials ([@lambdaurora.dev](https://bsky.app/profile/lambdaurora.dev) and [@akarys.me](https://bsky.app/profile/akarys.me) on Bluesky, [@LambdAurora](https://www.youtube.com/@LambdAurora) and [@Akarys42](https://www.youtube.com/@akarys42) on YouTube).
If you have questions, feedback, or even just want to say hi, don't hesitate to come by [my Discord server](https://discord.lambdaurora.dev)!

Thank you for your support and have fun!

<div style="display: flex; flex-direction: row; justify-content: center; gap: 1.5em; margin: 2em;">
	<img class="ls_img" src="/assets/squib/aurora_eepy.png" style="width: 200px; transform: rotate(-45deg);" />
	<img class="ls_img" src="/assets/squib/akarys_silly.png" style="width: 200px;" />
</div>

[LambDynamicLights]: /projects/lambdynamiclights "LambDynamicLights' page"
[SpruceUI]: https://github.com/LambdAurora/SpruceUI "SpruceUI page"
[issue115]: https://github.com/LambdAurora/LambDynamicLights/issues/115
