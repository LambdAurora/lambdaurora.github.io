# I Got Contacted By LootLabs, a Sketchy Ad-Filled Link Shortener

<!--description: I got contacted by a company which offers remunerating link shortening services, and it is terribly sketchy. -->
<!--author: lambdaurora -->
<!--tag: minecraft modding -->
<!--date: 2024-02-13 22:00:00 GMT+0200 -->

[[ToC]]

---

## Introduction

It was another Monday of minding my own business... And uh... A new email! Let's check it out!
Mmmh, a new collaboration proposal with me? Neat. Wait... Is that... Oh no... They did not just do that...
**An adf.ly-like service???**

Okay, this looks sketchy, time to dive in, first off let's see what that email looked like:

> Hi, LambdAurora,
>
> My name is \[REDACTED] from LootLabs, it is nice to meet you.  
> We'd like to offer you a collaboration.
>
> Shortly about us, our product is a unique link locker:
>
> - We wrap the link with our product.
> - Viewers visit the custom landing page.
> - Viewers see gaming-related ads and then are redirected to the desired link.
> - The creator is paid for ad interactions.
>
> Do you ever think about monetizing your Minecraft mods?
>
> Our goal is to help creators increase their income by monetizing their content.
>
> If you are interested in discussing further feel free to add me on  
> Discord: \[REDACTED]
>
> Looking forward to hearing from you soon. :)
>
> Best regards,  
> \[REDACTED]
> <div class="ls_source">
> <a href="/images/blog/2024/02/lootlabs/email.png" target="_blank">Screenshot of the email</a>
> </div>

Usually I'm not too surprised by that kind of contact about sponsorships/collaborations,
as I already received some proposals for Minecraft server hosting services which is not uncommon for successful Minecraft modders.  
But where this is unusual is the kind of service that's offered:
a link shortener that makes the user wait for a bit to see ads so the person who wrapped the URL can get some revenue out of it.

This isn't uncommon either in the Minecraft modding space, it was a big part of the early modded experience,
when no mod hosting websites were established. To get some revenue, mod authors had adf.ly links -
and if you look at some mods that still live a bit in the past, you can find such thing on the OptiFine website or the Forge website.

But what's uncommon is reaching out to people to get them to use the service and targeting "gamers" specifically.
And I have to admit that I have a tendency to be very distrustful of anything gamer-branded.
For example, I still have some issues with Overwolf, and Discord which was also initially gamer-branded.

The reason I'm looking into it though is, well, I was not the first to be contacted,
which also means I'm not going to be the last.
I decided to look a bit into it to discuss it with my fellow modders and potentially warn of its sketchiness to the less aware of us.

I have fallen into the rabbit hole, and it's not looking good.

## It is Sketchy

While the concept of the service itself is sketchy and not the most appreciated by users,
at a concept-level it's kind of fine. Thought that's to be taken with a grain of salt,
I think authors getting some revenue from their work is fair, but I don't think this is the way to do it, and we're way past that era now.

Looking a bit around the email, there were social media links, to start my investigation I clicked without thinking too much until
I noticed something that already put me at very unease: the links are tracked using a third-party tool called streaklinks.com,
which is a product of [Streak](https://www.streak.com/). They also offer other services like a way to get notified when an email is read.
Luckily the service I'm using is now pre-caching images to prevent such tracking on view, but the links are still tracked.
This is already not giving a good look.

Looking at the email address, it's very easy to find the website of the service: [lootlabs.gg](https://lootlabs.gg) ([Archive](https://archive.is/nY03o)[^1]).
Time for some digging.

### On Paper LootLabs Care About Creators, but not in Reality

The home page of the website is quite empty, so I started looking into [the blog](https://lootlabs.gg/blog) ([Archive](https://archive.is/N8vca)),
and after some scrolling something ticked me off.
All the pictures followed the exact same style, nothing inherently wrong if you do manage to get an artist that is consistent,
but something else ticked me off about the style. Then I looked at a picture more closely and to my horror it was AI-generated.

One of the first examples is this picture for their [*From Smurfenstein to Skyrim: All About Game Modding*](https://lootlabs.gg/from-smurfenstein-to-skyrim-all-about-game-modding/) post,
for illustrating it, it includes this picture:

<div align="center">
<img class="ls_responsive_img" style="max-width: 35em;" alt="From Smurfenstein to Skyrim: All About Game Modding* Illustration Picture" src="https://lootlabs.gg/wp-content/uploads/2023/09/000.jpg" />
<span style="display: block;">[Archive](https://web.archive.org/web/20231101152645/https://lootlabs.gg/wp-content/uploads/2023/09/000.jpg)</span>
</div>

If you haven't found the clues that this image is AI-generated I invite you to take a closer look at the hands,
they make no sense! There's only 3 fingers thar are not even shaped correctly, aside from that the composition of this picture makes no sense either nor does the cables.

This is quite disappointing for a company claiming to help creators while also not having the dignity to spend some money on artists to illustrate their blog.
It's all about monetizing passion as they say, you don't matter only the money does.

And I'm not being this vile for only one picture, this happened multiple times!

<p align="center">
<img class="ls_responsive_img" style="max-width: 35em;" alt="Game, Chat, Create: The Synergy of Discord and UGC* Illustration Picture" src="https://lootlabs.gg/wp-content/uploads/2023/07/000.jpg" />
<span style="display: block;">
[*Game, Chat, Create: The Synergy of Discord and UGC*](https://lootlabs.gg/game-chat-create-the-synergy-of-discord-and-ugc/) ([Archive](https://archive.is/UwW3X)) - [Picture archive](https://archive.is/UwW3X/ea42f6a2e79d33555e7937e826a57d9c8af3e4ab.jpg)
</span>
</p>
<p align="center">
<img class="ls_responsive_img" style="max-width: 35em;" alt="It’s in Your Hands: UGC in Mobile Games Marketing* Illustration Picture" src="https://lootlabs.gg/wp-content/uploads/2023/11/000-1024x585.jpg" />
<span style="display: block;">
[*It’s in Your Hands: UGC in Mobile Games Marketing*](https://lootlabs.gg/its-in-your-hands-ugc-in-mobile-games-marketing/) ([Archive](https://archive.is/bl02G)) - [Picture archive](https://archive.is/bl02G/55cc6a1208236bd763c3f7e1aca8a6903621f5e3.jpg)
</span>
</p>
<p align="center">
<img class="ls_responsive_img" style="max-width: 35em;" alt="How to Create Gaming UGC that Gen Z Will Love* Illustration Picture" src="https://lootlabs.gg/wp-content/uploads/2023/07/genz-gaming-ugc-1024x605.jpg" />
<span style="display: block;">
[*How to Create Gaming UGC that Gen Z Will Love*](https://lootlabs.gg/how-to-create-gaming-ugc-that-gen-z-will-love/) ([Archive](https://archive.is/DvSlp)) - [Picture archive](https://archive.is/DvSlp/b76f71b1989182b50dc4425e57005312c9852a89.jpg)
</span>
</p>
<p align="center">
<img class="ls_responsive_img" style="max-width: 35em;" alt="How to use Discord bots for content monetization?* Illustration Picture" src="https://lootlabs.gg/wp-content/uploads/2024/02/dis2.jpg" />
<span style="display: block;">
[*How to use Discord bots for content monetization?*](https://lootlabs.gg/how-to-use-discord-bots-for-content-monetization/) ([Archive](https://archive.is/z1DiM)) - [Picture archive](https://web.archive.org/web/20240212221227/https://lootlabs.gg/wp-content/uploads/2024/02/dis2.jpg)
</span>
</p>

I think you get the idea by now and how obvious it is, the last one is quite egregious.
The worst is not all blog posts had that tendency, the very first ones actually used normal pictures which I much prefer to see than random AI-generated garbage
that makes the whole "we want to help creators to earn money" very hypocritical.

And see that last article about Discord bots? Well, it gets worse.

### Utter Disrespect Towards Minecraft Modders

So, for [the last article](https://lootlabs.gg/how-to-use-discord-bots-for-content-monetization/) where I've mentioned the AI-generated illustrations contains a video link to show off how to use their discord bot.
The same video can be found in [their help article about their Discord bot](https://help.lootlabs.gg/en/article/how-to-use-the-lootlabs-discord-bot-1ibyolf/) ([Archive](https://archive.is/bQpi0))
which is where it was initially found by some people who helped investigate the service.

Here's the video:
<div align="center">
<iframe width="560" height="315" src="https://www.youtube.com/embed/wR7VhOs4viM?si=Eybf_kySLyuy9hh9" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen>
</iframe>
</div>

It's worth noting that when we investigated it, it was uploaded as another video as this screenshot shows:
<div align="center">
<img alt="Initial Video Embed" style="max-width: 100%; height: auto;" src="/images/blog/2024/02/lootlabs/2024-02-12_23-23.png" />
</div>
But that previous link mysteriously got deleted and the video was re-uploaded. But overall the content is the same.

<details>
<summary>
__Given that now I have reasons to doubt that the video will stay online I have taken some screenshots of it for archiving purposes.__
</summary>
<br />
![First Screenshot](/images/blog/2024/02/lootlabs/discord_bot_demo_1.png)
![Second Screenshot](/images/blog/2024/02/lootlabs/discord_bot_demo_2.png)
![Third Screenshot](/images/blog/2024/02/lootlabs/discord_bot_demo_3.png)
</details>

Okay, so, after a watch of the video we notice something terrible.
Out of all the links they could have used as an example, they used 9minecraft.

For those unaware 9minecraft is a website that reposts Minecraft mods without their author's permission,
filled with a bunch of ads and download servers that are themselves filled of ads, which has a tendency to be prone to malware.

When I was saying that this service clearly did not care about creators and only the money earlier,
well we have another damning evidence that is utterly disrespectful of any Minecraft modder!

Another thing is they don't even show the ad that was displayed in the video, for some reason.
I tried the link myself, and it gives a random challenge to complete to unlock access to the link,
I did not manage to see a similar ad sadly.

I remember the ads that were present on 9minecraft, the ads that were present on CurseForge a while ago (thankfully they improved a bit on CurseForge),
and they were utterly inappropriate considering one large part of the audience of Minecraft content is children.
While I cannot verify it, I cannot prevent myself from having doubts over the ads that would be displayed to someone using the service.
All we know is it targets "gamers" and we all know that a bunch of ads that fit that category can easily be inappropriate.

### It's Not Just Ads

Okay, now that we know LootLabs doesn't care about creators and have a larger interest towards money,
I don't think there's going to be surprises if we discover that they use predatory techniques. And guess what...
**They do use predatory techniques!**

While continuing my investigation I've encountered another help article: [*What are LootLabs Themes?*](https://help.lootlabs.gg/en/article/what-are-lootlabs-themes-1x9s27b/) ([Archive](https://archive.is/3uLFB)),
this article contains a lot of pictures showing what a link redirect can look like, and looking at it closely I think we can easily identify the predatory techniques
such as asking to accept notifications, having to click on weird unrelated links, or even entertain an idle game.

For the last example I sadly didn't manage to take a screenshot of it when I've encountered it myself and despite my attempts at reloading the link I haven't managed to find it again.

Overall those techniques are scummy, scummier than other similar services. And again, given a large part of the Minecraft content audience is children, this is a massive issue.

### The Political Bit

With some more digging we found out some more things about LootLabs!

First of all, it's very probably this company is a child-company of [AdMaven](https://ad-maven.com/) which is an ad network since the whois on the domain name `lootlabs.gg` designates AdMaven as its registrant.
Which also led to discover that the privacy policies of both sites are very similar.

So we've looked a bit more into both companies and both are located in Israel.
This is further supported by the privacy policies designating that their registered offices are located in Tel Aviv.

For those reading this article in the future, this article has been written in February 2024,
while [on January 26th 2024 the Internal Court of Justice has said it that there is a real and
imminent risk of genocide in Gaza Strip](https://www.icj-cij.org/index.php/case/192).

While a company isn't a country, I don't think most would feel comfortable doing business with a company located in a country which is committing horrors.
If you're a bit confused on why a company located there is a bit of an issue, despite that I haven't found a clear claim that they support what their government is doing,
due to their location they will support the actions of their government through taxes.
I think it's also a good time to remind that there is a boycott campaign ongoing, read more on the [BDS website](https://bdsmovement.net/).

This criticism can also be applied to CurseForge, as it's operated by Overwolf which is an Israeli company.
If you're a Minecraft modder or a mod user, I would recommend you to switch to [Modrinth](https://modrinth.com) instead.
As for me, I'd also wish to pull out from CurseForge, though I haven't since I know people would end up reuploading my mods there,
which could expose users to malicious actors, and I'm not sure if [I'd trust CurseForge to take care of it properly](/blog/2022/09/lap_sitting_and_curseforge.html).

### The Lesser Stuff

We're finally starting to reach the end of the investigations and there's still some things that are not big deals but still bothering me.

First, there is an article in their FAQ called [*How do I delete my account?*](https://help.lootlabs.gg/en/article/how-do-i-delete-my-account-b90lgk/) ([Archive](https://archive.is/K9nfo)),
while such article is normal to have in a FAQ, its content is completely missing the mark.

> We do not delete any links or code implements, since it may cause errors in our statistics and algorythms.
> In order to stop working with our ads, simply remove all of our ad code from your site’s JS or delete your links in our panel.
>
> Updated on: 22/11/2023

Though, from what we've seen you still can delete your account, but they won't guide you to let you do it.

Second, another article caught our eyes. The article is [*Can I post LootLabs Links on MCPEDL?*](https://help.lootlabs.gg/en/article/can-i-post-lootlabs-links-on-mcpedl-1nb8t45/) ([Archive](https://archive.is/6Ah8S)),
and it says that yes, it is possible to post LootLabs links on MCPEDL.
While I am not in the MCPE modding space, I find the allowance of such service to not be a great look.
If this article reaches MCPEDL I hope it'll let them reconsider their choice. I think modders deserve much more respect.

## Conclusion

What a rabbit hole it was, a quite disgusting one.

After this investigation, I am honestly disgusted at what I've found out, it feels like them contacting me for a collaboration
is just a way to mock me as a creator given they give absolutely no shit about us.
If you cared about helping creators monetize their passion then you'd pay artists for illustrations instead of using grotesque AI-generated art.
If you cared about creators you wouldn't subject their audiences to predatory techniques. If you cared about creators you wouldn't track your emails to them.

This company is just trying to make money off your back, and hope to get you on board they promise you revenue.
If you know a fellow modder who's been contacted by LootLabs, and they're hesitating, I hope you now have the resources to let them make a more informed choice.

For users, thankfully there seems to exist [some browser extensions to bypass such service](https://greasyfork.org/en/scripts/483207-working-loot-link-com-bypasser-includes-all-lootlabs-gg-link-variations).

I don't even know why they thought I'd make a good client: my mods are already available on mod hosting websites such as [Modrinth](https://modrinth.com/user/LambdAurora).
Maybe I could have put such links in my Discord or on my website to get to those projects, but that's so pointless and irritating for users.
I don't think those would even have enough traffic for it to be interesting, the only page where it there would be enough traffic is my [OptiFine alternatives page](https://optifine.alternatives.lambdaurora.dev/).

Honestly, I would never use such sketchy services, if I really was in need of revenue I'd rather set up a page where my users could donate to me,
which I've already been asked about by some as they wished to donate to me.

If you want to propose me sponsorships or collaboration the first step for me to even consider it is to treat me (and my peers) with respect. LootLabs has utterly failed that.

[^1]: I initially tried to archive it using [web.archive.org](https://web.archive.org/web/20240212212812/https://lootlabs.gg/) but, if you try to look it up, the page is blank. Another not good look.
