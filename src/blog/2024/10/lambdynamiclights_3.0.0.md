# LambDynamicLights v3.0.0 got released!

<!--description: The long-awaited release of LambDynamicLights for Minecraft 1.21 has finally landed as LambDynamicLights v3.0.0! Discover its changelog, some talks about why it took so long, and the future of the mod.-->
<!--embed_image: /assets/blog/2024/10/ldl_1.21_promo.png "LambDynamicLights 3.0.0 promotional picture." -->
<!--author: lambdaurora -->
<!--tag: minecraft modding, lambdynamiclights -->
<!--date: 2024-10-09 22:45:00 GMT+0200 -->
<!--modified: 2024-10-11 22:00:00 GMT+0200 -->

<div align="center" style="margin-top: 2em; margin-bottom: 2em;">
<img class="ls_responsive_img" style="max-width: 40em;" src="/assets/blog/2024/10/ldl_1.21_promo.png">
<span style="display: block;">*Banner made by [Akarys](https://twitter.com/Akarys_/), my wonderful partner.*</span>
</div>

Finally! The long-awaited release of LambDynamicLights for Minecraft 1.21 has landed as LambDynamicLights v3.0.0!

This is quite a big update, and with the long delay I think a blog post in addition to my usual changelogs is due.

## Changes

- Changed how item light sources are defined in resource packs:
  - Now item light sources support a wide-range of selection predicates thanks to data-driven improvements in the base game.
    - This means enchanted items can now selectively light up, this should mostly address ([#89](https://github.com/LambdAurora/LambDynamicLights/issues/89)).
  - Please refer yourself to the documentation for more details.
- Updated to Minecraft 1.21 ([#227](https://github.com/LambdAurora/LambDynamicLights/pull/227)).
- Updated configuration library.
  - **Configuration corruption should now be fixed.**
- Updated Mexican Spanish translations ([#214](https://github.com/LambdAurora/LambDynamicLights/pull/214)).
- Updated Italian translations ([#232](https://github.com/LambdAurora/LambDynamicLights/pull/232)).
- Updated Polish translations ([#235](https://github.com/LambdAurora/LambDynamicLights/pull/235)).
- Removed block entity lighting as the use-case was extremely niche.
  - This may be re-introduced if a valid use-case is found.

### License Change

One surprising change in this update is the license.

This mod initially released under MIT, which was fine at the time, and was pretty permissive.

Though I was pretty naive at the time too, and filled to the brim with good faith.
I have quickly realized that the Minecraft modding community isn't always in good faith, and this has made me reevaluate my choice.

I came to the conclusion I needed a custom license, most open-source licenses are too permissive, and I felt like going full All-Rights-Reserved would be awful
for everyone. With the help of my partner we came up with a new license to help find a middle-ground: [Lambda License](https://github.com/LambdAurora/LambDynamicLights/blob/bbefb8860bca2e797f8a2ba8a59d1120b6e1c7b4/LICENSE).

The goals of the license are:
- to let people be able to use the source code for contributions or source-only forks;
- but binary distribution is now much more closed: distribution requires a permission and the conditions to get such permission are laid out in the license.

There are provisions in case I suddenly disappear without a trace one day to avoid this mod getting lost to time.
My goal with this license is to involve good faith from me, the author, and you, the user.

I wish I could've avoided this, but having witnessed grifters and bad-faith actors around some of my mods, with in addition to this some recent events,
I believe there was no choice but to protect further my work.

I am open to discussion with the NeoForge ports for them to get permission to use the new code, my goal is not to make life harder for the good-faith ports.

## Downloads

<div style="display: flex; flex-direction: row; gap: 1.5em; margin: 2em;">
	<a
		href="https://modrinth.com/mod/lambdynamiclights/version/3.0.1+1.21.1"
		title="LambDynamicLights Modrinth page"
		style="display: inline-flex; align-items: center; gap: .5em;"
	>
		<svg aria-hidden="true" viewBox="16 -2 150 150" version="1.1" data-view-component="true" width="42" height="42">
			<path fill-rule="evenodd" fill="#1bd96a" d="M159.07,89.29A70.94,70.94,0,1,0,20,63.52H32A58.78,58.78,0,0,1,145.23,49.93l-11.66,3.12a46.54,46.54,0,0,0-29-26.52l-2.15,12.13a34.31,34.31,0,0,1,2.77,63.26l3.19,11.9a46.52,46.52,0,0,0,28.33-49l11.62-3.1A57.94,57.94,0,0,1,147.27,85Z"></path><path fill-rule="evenodd" fill="#1bd96a" d="M108.92,139.3A70.93,70.93,0,0,1,19.79,76h12a59.48,59.48,0,0,0,1.78,9.91,58.73,58.73,0,0,0,3.63,9.91l10.68-6.41a46.58,46.58,0,0,1,44.72-65L90.43,36.54A34.38,34.38,0,0,0,57.36,79.75C57.67,80.88,58,82,58.43,83l13.66-8.19L68,63.93l12.9-13.25,16.31-3.51L101.9,53l-7.52,7.61-6.55,2.06-4.69,4.82,2.3,6.38s4.64,4.94,4.65,4.94l6.57-1.74,4.67-5.13,10.2-3.24,3,6.84L104.05,88.43,86.41,94l-7.92-8.81L64.7,93.48a34.44,34.44,0,0,0,28.72,11.59L96.61,117A46.6,46.6,0,0,1,54.13,99.83l-10.64,6.38a58.81,58.81,0,0,0,99.6-9.77l11.8,4.29A70.77,70.77,0,0,1,108.92,139.3Z"></path>
		</svg>
		Modrinth
	</a>
	<a
		href="https://www.curseforge.com/minecraft/mc-mods/lambdynamiclights/files/5798757"
		title="LambDynamicLights CurseForge page"
		style="display: inline-flex; align-items: center; gap: .5em;"
	>
		<svg aria-hidden="true" viewBox="-2017 853 43 23" version="1.1" data-view-component="true" src="https://www.curseforge.com/Content/2-0-8083-18015/Skins/CurseForge/images/anvil.svg" width="42" height="42" style="fill: var(--ls_theme_primary);">
			<path fill-rule="evenodd" d="M-2005.7,853l0.7,3c-3.5,0-12,0-12,0s0.2,0.9,0.3,1c0.3,0.5,0.6,1.1,1,1.5c1.9,2.2,5.2,3.1,7.9,3.6  c1.9,0.4,3.8,0.5,5.7,0.6l2.2,5.9h1.2l0.7,1.9h-1l-1.7,5.5h16.7l-1.7-5.5h-1l0.7-1.9h1.2c0,0,1-6.1,4.1-8.9c3-2.8,6.7-3.2,6.7-3.2  V853H-2005.7z M-1988.9,868.1c-0.8,0.5-1.7,0.5-2.3,0.9c-0.4,0.2-0.6,0.8-0.6,0.8c-0.4-0.9-0.9-1.2-1.5-1.4  c-0.6-0.2-1.7-0.1-3.2-1.4c-1-0.9-1.1-2.1-1-2.7v-0.1c0-0.1,0-0.1,0-0.2s0-0.2,0.1-0.3l0,0l0,0c0.2-0.6,0.7-1.2,1.7-1.6  c0,0-0.7,1,0,2c0.4,0.6,1.2,0.9,1.9,0.5c0.3-0.2,0.5-0.6,0.6-0.9c0.2-0.7,0.2-1.4-0.4-1.9c-0.9-0.8-1.1-1.9-0.5-2.6  c0,0,0.2,0.9,1.1,0.8c0.6,0,0.6-0.2,0.4-0.4c-0.1-0.3-1.4-2.2,0.5-3.6c0,0,1.2-0.8,2.6-0.7c-0.8,0.1-1.7,0.6-2,1.4c0,0,0,0,0,0.1  c-0.3,0.8-0.1,1.7,0.5,2.5c0.4,0.6,0.9,1.1,1.1,1.9c-0.3-0.1-0.5,0-0.7,0.2c-0.2,0.2-0.3,0.6-0.2,0.9c0.1,0.2,0.3,0.4,0.5,0.4  c0.1,0,0.1,0,0.2,0h0.1c0.3-0.1,0.5-0.5,0.4-0.8c0.2,0.2,0.3,0.7,0.2,1c0,0.3-0.2,0.6-0.3,0.8c-0.1,0.2-0.3,0.4-0.4,0.6  s-0.2,0.4-0.2,0.6c0,0.2,0,0.5,0.1,0.7c0.4,0.6,1.2,0,1.4-0.5c0.3-0.6,0.2-1.3-0.2-1.9c0,0,0.7,0.4,1.2,1.8  C-1987.4,866.2-1988.1,867.6-1988.9,868.1z"></path>
		</svg>
		CurseForge
	</a>
	<a
		href="https://github.com/LambdAurora/LambDynamicLights/releases/tag/v3.0.1%2B1.21.1"
		title="LambDynamicLights GitHub page"
		style="display: inline-flex; align-items: center; gap: .5em;"
	>
		<svg aria-hidden="true" viewBox="0 0 16 16" version="1.1" data-view-component="true" width="42" height="42" style="fill: var(--ls_theme_primary);">
			<path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
		</svg>
		GitHub releases
	</a>
</div>

## A Long Wait, and What's Next?

Yes, I am a bit late to the party. LambDynamicLights skipped 1.20.6 and finally gets an official 1.21 ports on the dawn of 1.21.2.

Turns out I've been pretty busy in my life: graduating with a Master degree in software engineering, getting really hooked into the Splatoon fandom, work, modding drama.
Long-gone are the days of being a student with load of free time and a deep interest in Minecraft.

When I finally sat down and decided to get the mod released for 1.21, I had a more ambitious goal to attempt to decrease the needs for user support:
- I wanted to rework entirely the API to give more options to resource pack makers, which would avoid me getting issues about how someone wants X item to glow under Y conditions.
  - This can be seen in the changes here with a brand-new JSON format for item light sources, and a new Java API.
  - Though there are things missing: the dynamic lighting API for entities is still the good old same. I planned to rework it as well but I ran out of time.
    I've decided that releasing the mod as-is was more important and to take advantage of the next release cycle to start work on it.
- I wanted to fix the recurring issues of user's configurations getting corrupted.
  - This got fixed and with some investigations in the latest versions of Night-Config and some talks with its author, some issues got resolved in the library itself!
- And finally, I wanted to optimize the mod to alleviate most complaints about the mod being slow.
  As you may have noticed, this has not been done here, it will require a lot of work. Unlike the API where I need to stick to a release cycle due to breakage, for this one I can continue work on it anytime.

So yeah, a lot of ambitions but not much time to get it all done.
At least it can give you insight into what to expect for the next releases. I will not give any ETA for any of these changes as it's quite hard to estimate, and I'm still busy.

I cannot hide that I'm a bit disappointed to have to scale back this release, especially since a bounty was placed and people added up to 60€ for the mod to release quicker.
It was a good motivation though. From the bottom of my heart, thank you everyone who reached out and added to the bounty.

I hope I have reassured some people who thought the mod was gone for good. **It is not yet the end of LambDynamicLights.**
Expect a faster release for 1.21.2.

I also had to delay some other things, I have two other blog posts that I have planned and partially worked on so stay tuned for more.
As a reminder my blog has [an RSS feed](/blog/feed.xml)!

Thank you for your support and have fun!

<img class="ls_img" src="/assets/squib/aurora_eepy.png" style="width: 200px; transform: rotate(-45deg);" />
