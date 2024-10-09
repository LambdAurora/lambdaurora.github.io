# LambDynamicLights v3.0.0 got released!

<!--description: The long-awaited release of LambDynamicLights for Minecraft 1.21 has finally landed as LambDynamicLights v3.0.0! Discover its changelog, some talks about why it took so long, and the future of the mod.-->
<!--author: lambdaurora -->
<!--tag: minecraft modding, lambdynamiclights -->
<!--date: 2024-10-09 22:45:00 GMT+0200 -->

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
