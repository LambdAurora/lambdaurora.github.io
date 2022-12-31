# Modding Just Broke in Minecraft - No It Didn't

<!--description: A critical response to PippenFTS' "Modding Just Broke in Minecraft" video. -->
<!--author: lambdaurora -->
<!--tag: critical response, minecraft modding, mod compatibility -->
<!--date: 2022-12-28 23:57:00 GMT+0200 -->
<!--modified: 2022-12-31 -->

## Introduction

The YouTuber PippenFTS recently released a video named `Modding Just Broke in Minecraft - Here's What Happened`.

If you don't know who this is, PippenFTS is involved in the [Build The Earth](https://buildtheearth.net/) project, whose goal is to recreate Earth in Minecraft.
It is a neat project, and I already stumbled upon the channel because of a video about an architect suing the project over... a building.

Before diving into this, watch the video first, then let's look at what's wrong!

<div align="center">
<iframe width="560" height="315" src="https://www.youtube.com/embed/r0M1xMt9MT0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
</iframe>
</div>

> **UPDATE:** as you may see, the video is now taken down [with this community post as explanation](https://www.youtube.com/post/UgkxDbiWd1J6PjcVYSISnLjF4YsmmWgKsNhr).
> If you still wish to watch it, [you can through the power of archiving](https://web.archive.org/web/20221226145228/https://www.youtube.com/watch?v=r0M1xMt9MT0).  
> Though, the video still has been removed for a reason so don't go after the guy. However, I wish to keep the article up as I believe it still has a fair share of information
> that could be used in further debates if those happen.

Though, I have to admit, writing a blog post criticizing a video is a bit hard since such thing is easier when you can easily quote specific parts of a video.

---

[[ToC]]

## Disclaimer

Before stepping into this response, I have to say that I am a Minecraft modder, that I worked on [Fabric], and I am currently working on [Quilt].
This means I may be biased towards those loaders, and I *could* totally miss something.

## The Global Message of the Video

The video has a very specific message: "before with Forge I could assemble huge modpacks without looking too much at the mods, and it worked, now with Fabric I can't do the same".
I didn't really grow up with Forge modpacks, but I did modded Minecraft with random Forge mods, and most of the time my mod combinations worked (while not very thought out and mostly lucky).

Now that I actively mod with Quilt, I also learned to maintain packs as some kind of side effect of wanting to play mods with friends. Which means I maintain packs on Fabric and now Quilt.
And... I haven't personally noticed any of the "it's more incompatible" claims.
Hell, some of those packs even had much harder constraints like "it must run during the entire 1.17 Snapshot cycle"
or "I want this modded world to be usable after a Minecraft update". And those constraints are very uncommon, and **hard**.

From my time in modding it feels like that once you involve content mods, you should lose any hope of being able to port your favorite modded world to newer Minecraft versions
and that you should stay in the version it was made in. I do not agree, I want to be able to continue my worlds and always improve over them while getting new hot content from Mojang!

This highlights some important stuff here: it means the pack had to be able to work on the newer versions and not break the world. One of those was in the 1.17 Snapshot cycle which meant
it was even more chaotic with the literal data format of the world changing. And yet we managed, I even wrote custom tooling for that snapshot cycle.
For this to even work it means mods must not randomly rename stuff or refactor too heavily their data formats, and if possible support DataFixerUpper "DFU", Mojang's solution to port
worlds to newer versions. Those are still problems with pending answers in the modding space, problems that I hope we can fix with Quilt.

Enough my experience and let's look at what the video points at and the problems I have with it.

## "Fabric/Quilt Think Forge Compatibility is Unimportant"

The video talks about how Fabric/Quilt thinks Forge compatibility is unimportant, but I'm not sure if this is really true, or at least it's much more nuanced.

This is about how you can't run Forge mods on Fabric/Quilt. And it's used as an argument in the global point that Fabric/Quilt have less compatible ecosystems.  
I don't think this is a good argument.

This is a logic problem, we have the compatibility issue represented as $P$, and we have $A$ the set of mods on Fabric/Quilt and $B$ the set of mods on Forge.
While we currently have $A \cup B \implies P$, this doesn't prove $A \implies P$.

Now to address that message that Fabric/Quilt doesn't care about Forge compatibility: it's not really true since large parts of the user base wants this!
What we don't do nor want to do is actually built that into the loader, because it is insanely hard to do it right and to maintain. And there's history as asie points out in a comment on the video:

> Initially the problem was legal in nature - while Forge itself is open-source, it used a component ("MCP 'Searge' mappings") which was not, 
> and the only project which had permission to use and redistribute them was Forge. 
> Said component was necessary to support unmodified Forge mods at all,
> and - coupled with the Forge team's incorrect accusations of competitors unjustly using their work (like FyberOptic's Meddle) - a decision was made to avoid using Forge's existing work,
> which also made compatibility much harder.
> <div class="ls_source">
> [asie's comment](https://www.youtube.com/watch?v=r0M1xMt9MT0&lc=Ugwi_R19jt9GoJmI5HJ4AaABAg)
> </div>

The video talk about [Patchwork], which is kind of a holy grail at this point. In theory, it's awesome and flawless, in practice it has a lot of issues to solve,
so let's see what was its state before switching to Quilt
 - Patchwork originally targeted Fabric, which doesn't currently have APIs to modify the way mods are loaded (this means you cannot easily patch at runtime Forge mods to run under Fabric);
 - [it re-implemented the Forge API by hand](https://github.com/PatchworkMC/patchwork-api), this means replacing Forge patches with mixins: this is both hard **to do** and **to maintain**;
 - it had to patch Forge mods to work with Fabric by giving them metadata to make Fabric recognize them, but also to redirect some API calls that were directly added to Minecraft sources through patches.

This highlights very interesting and technical challenges to solve since both loaders take very different approach: Forge is made of *patches* to the game, this means it modifies directly the Minecraft JAR
and this is visible to modders, this also means Forge can change signatures of methods, add new ones, etc.  
If a mod for another loader expect a method and Forge modified its signature, it will crash.  Not because the loader is less compatible, or the mod is less compatible,
but because of fundamental different philosophies:  
Fabric instead apply bytecode modifications at runtime, this means the Minecraft JAR isn't really modified, or at least not visibly. Method signatures are never changed.
New ones can be added, but usually are not visible even though this starts to change thanks to interface injection.

I think you can see where the issue is with running Forge mods on Fabric/Quilt,
you would need to patch the mods (preferably at runtime to lessen need for manual interaction from the user),
and you need the Forge API reimplemented in some ways, so it doesn't use patches or that guarantees incompatibilities with Fabric/Quilt mods.

This is also why Patchwork is waiting on Quilt since it has an interesting project: Chasm (Collision Handling ASM, [ASM](https://asm.ow2.io/) being the library used for bytecode modification).
This leads us directly into the next chapter.

## Bytecode Modification or "But Mixin Can Cause Incompatibilities"

Near the end of the video, it's mentioned that after confrontation the Fabric community changed its tone about denying incompatibilities and said
"it's because mixins can be incompatible and require modders to use it correctly".

But I think this still doesn't address the root issues.

Let's start with what's [Mixin](https://github.com/SpongePowered/Mixin):

> Mixin is a trait/mixin framework for Java using ASM and hooking into the runtime classloading process via a set of pluggable built-in or user-provided services.
> <div class="ls_source">SpongePowered
> </div>

But that doesn't really help if you're not familiar with computer science concepts like trait or mixin. Mixin is an Object-Oriented Programming concept that involve to add properties 
to an existing class/object. This allows to add new functions to an existing class. So for example I can add new methods to the class `PlayerEntity`.
If this still sounds confusing, the tl;dr is it allows us to inject code, but by writing actual Java code. What mixin does is it take chunks of compiled code and paste them at specific places.

In modding this was truly revolutionary because before that... Code injection was much, much more tedious.

Before Mixin we had... Forge's coremods, a very touchy subject for Forge.
While APIs and abstractions are neat, they do not do everything, and sometimes you do need to inject code into Minecraft's codebase to do what you want for your mod.
But they came with a big cost: incompatibilities, or at least that's what Forge says.

In reality, it wasn't the use of injections that caused the incompatibilities but the bad use of them and the poor amount of documentation.
If you were to ask for help with a coremod in Forge spaces, you would quickly end up being yelled at for even daring to pronounce such name.
Forge tried to dissuade anyone from using coremods and made them extremely inaccessible, only allowing Java magicians to understand and do it properly.
This is what lead to most incompatibilities, because in some case you will need to inject but not having the documentation to do so you would do it improperly and cause issues.

Mixin... made it better, instead of writing bytecode analysis and replacement you wrote Java code, annotated with instructions on how to place the code.
This was much more accessible, or at least in appearance. Fabric used Mixin because it filled the gaps and allowed Fabric API to be easier to develop and easier to port.
Mixin was necessary for Fabric to succeed.

The issue is Mixin only can hide so much the complexity away, while using `@Inject` or `@ModifyArg` is relatively safe and hard to mess up, `@Redirect` or `@Overwrite` are by definition
incompatible injections: they both represent the replacement of code that cannot be chained.  
This is not always very clear, and the documentation is highly technical and already require advanced Java knowledge and know how the JVM works. But this is kind of hidden away.

So, yes, Mixin can cause incompatibilities when not used properly, but this is true for anything, actually. As seen previously Forge had the same issue in a much worse way with coremods (imo),
and the cherry on top of the cake is Forge gained Mixin support, so the difference here may only boil down to how the feature is communicated.

Now to quickly come back to Chasm, it is a backend, it's not designed to be used by modders directly, but it's designed to replace what's "behind Mixin", this means to a modder they could continue
using Mixin, it just handle things differently at the back. It also allows new APIs to be used by modders that interact with Chasm, and the great thing is it will be faster and more
compatible (hence the name Collision-Handling ASM). [This is a stemming from the thoughts of one of Fabric's founder about replacing mixin](https://github.com/FabricMC/fabric-loader/issues/244),
and it's finally coming to reality.

This is important for a project like Patchwork as it will allow to take Forge patches, and hopefully convert them to Chasm code, allowing much easier maintenance of the project and
the framework being much more powerful (and safe) means it'll also be easier to patch mods and make everything fit.

As magic as it sounds, it's not all magic, at Quilt we will need to ensure availability of and readable documentation to ensure most modders use those new technologies appropriately.
This will also give new tools to handle some tricky injections much better and make everything globally more compatible, as long as we do our documentation job correctly.

To sum up: Mixin doesn't cause the incompatibilities but the surrounding communication does, even though some incompatibilities stem from Mixin limitations.
And yet it still doesn't explain everything.

## APIs can cause incompatibilities too

I don't like how Forge is put on a pedestal throughout the video, because it's not all rainbows and butterflies either.

This is quite counter-intuitive but modding APIs can also create incompatibilities between mods, this often highlights a bad design or an API that missed a use case.
Let's take my favorite and most paradoxal example: Forge registries.

Let's first dive into why I pick this example: [Aurora's Decorations](/AurorasDecorations/), my decoration mod.
It has a very different approach from most content mods: it adds new wooden blocks but providing the variants of just the Vanilla wood types wasn't enough for me.
No, it had to support modded wood types natively, with the less user-intervention possible. To do this I had to analyze the registry as it's constructed: notice every wood-like pattern
then generate my own blocks and items based on that.

This is rather novel, at least to my knowledge, because it's a really difficult thing to do, and this is why modders prefer to have 50 addons just to make mods actually integrate well with each other
beyond simple compatibility. I do not strive for compatibility, I want integration, which is much superior when done right.

And this is where the first roadblock would come if I were developing for Forge: that mod loader has a much tighter control over registries.
Forge has a different philosophy and implementation here, Forge being plagued by slow loading in older versions decided to take steps into solving that, through multi-threading...
They initialized mods in parallel... This... is... *urgh*, not the best for my case.

The issue here is Forge locks down registries and prevent modders to use them to register stuff, you have to use their system to register your stuff, which will be added safely into the
identifier-value map of the registries. This is important for safe code. And very bad for my mod, who relies on being able to register stuff at any time based on the changes to the registry.
The irony is it didn't really solve Forge slowness issues since Fabric/Quilt manage to load way faster **without multithreading**.

While this won't really cause mods to crash, it means the integration isn't optimal and when assembling mod packs you will not be able to take random mods to mix and match them,
if you want to do it properly you will need to sit down and chase down the 50 addons, so they actually integrate with each other.
Wasn't this the main complaint of the video, that you had to spend time debugging mod packs?

Some would argue that my argument is flawed and that my mod could be ported to Forge. Yes it could, but at what price? You would need to go directly against Forge's philosophy and hack
it to make it work, which could break things and actually result in an incompatible mess.

The other example I like is events and mod loading order.  
Events are pieces of code that we register and then are fired up when specific things happen, like "player place a block". They are one of the main basis of any Minecraft mod loader,
Forge, Fabric and Quilt all use them, but we also take different approaches there:  

Forge has priorities, allowing to say "hey I want a higher priority on this event, so I can check if the player has the permission to interact with the block first before letting anyone else do stuff",
the issue here is you can end up with modders having difficulty choosing the priority and mods fighting for the same priority.

Fabric/Quilt have a very different approach here: we do not have priorities, we try to design our events to avoid the need for priorities, but we also offer the "event phase" system,
which basically allows to give a name to a group of code to fire up, and we allow to order those, so you can say "hey I want to be before that group of mods".  
This solves entirely the "there's not enough priority values" and allow modders to discuss how to resolve incompatibilities in an easier manner.

This is also seen with mod loading order: Fabric/Quilt doesn't allow to modify mod loading order because it's bad practice, you can't depend on every mod and guarantee to run last,
you need to think and approach the problem differently, and this way solve the problem at hand.

Those changes in philosophy may not be very apparent to the end user since they might just look at "does it crash or not", but compatibility goes much beyond that.

## OptiFine

Let's address the elephant in the room.

In this video I have seen numerous occurrences of the mod, and this may be one of the reasons PippenFTS is complaining: lots of Fabric/Quilt mod will refuse to work with the mod.  
Though, it later appeared that visuals are not always accurate, to quote a Discord discussion following the video release:

> *PippenFTS:* All the visuals are created by my editor,  
> *Another person:* So... you didn't take the time to verify what you were "researching"?  
> *PippenFTS:* We're talking about a hundred shots per minute of footage, I try to catch everything I can but the more I micro-manage the less time I have.

So, perhaps all the issues PippenFTS encountered may not have been about OptiFine, it's sneakily one of the most incompatible mods out there,
thus I think it's still worth talking about since it had such a cultural impact that a lot of people will still want to use it even though its relevance in modern versions is lessened.

Some of you may know me from [the OptiFine alternatives list](https://lambdaurora.dev/optifine_alternatives/), in which I wrote a very important text:

> OptiFine was originally a great mod offering many quality of life improvements for the player in the beginning.
> However, over the years, its benefits have dwindled and has caused many issues for modders.
> This is due to Minecraft's codebase improving over the years and OptiFine's aggressiveness towards replacing entire swaths of code while being closed source making it very difficult 
> to figure out why OptiFine has broken another modder's mod. Also, worth noting that OptiFine natively doesn't support Fabric, and it's hard to maintain OptiFabric.
>   
>   
> In the modern Minecraft era, with Fabric's community effort, 
> modders have begun to create alternatives for most of OptiFine's features to allow players to maintain better performance, better mod compatibility, and better support.
> <div class="ls_source">
> [OptiFine Alternatives - LambdAurora](https://lambdaurora.dev/optifine_alternatives/)
> </div>

OptiFine doesn't use coremods, nor does it use mixins, instead it patches the game, just like how Forge does.
This comes with most of the same problems you would have with running Forge on Fabric.
Combine this with OptiFine modifying rendering, a very difficult to navigate place for modders and a notoriously hard thing to build API for to make mods compatible.

The Fabric community had a "that's enough" moment and decided to replace OptiFine, I am part of the movement with 2 mods replacing parts of it.
The mod that consolidated the movement is [Sodium](https://modrinth.com/mod/sodium): it manages to optimize the rendering of the game much better than OptiFine ever did,
and the nail in the coffin is [Iris](https://irisshaders.net/) who combines Sodium and OptiFine shaders. All of that with much better compatibility.

This is one of the strength of Fabric and Quilt: the ability to give up on OptiFine and move on with mods that work much better together, **and the ability to improve it together**.
Communication between modders is strong, and collaborative efforts are too.

Fabric/Quilt have another strength compared to Forge: the Fabric Renderer API. This API allows mods to modify rendering of block models, this allows a lot of stuff to happen, and the best
is it was made in such a way that it allows high compatibility between mods. On Forge a mod like Sodium would have a harder time to be compatible with everything.
Though this might change in the future.

The Fabric Renderer API allows mods like [Enhanced Block Entities](https://modrinth.com/mod/ebe), [LambdaBetterGrass](https://modrinth.com/mod/lambdabettergrass) to exist.
While it is flawed (LambdaBetterGrass' better snow combined with Iris shaders to give me nightmares), it can be improved upon (and will be).

While I regret that PippenFTS did not find great success in the quest of OptiFine alternatives, most of the time the compatibility there is much greater than with OptiFine.

## So, is stuff incompatible? If so, what is causing it?

I don't think Fabric has a much higher rate of incompatibilities than Forge. In general, modders are well-mannered, and you can easily throw multiple mods together.
Hell, Fabric/Quilt are making this easier than on Forge where you would often need some random library while for Fabric/Quilt a lot of them are bundled with the mods already and are
almost invisible to the user (which can cause debugging issues when the UI is for it is missing though).

The issue is different: it can range from communication issues, *which was true for Fabric for a time*, to integration issues that are entirely disregarded in this video.

For a long time Fabric had an awful error UI when mod resolution failed, Quilt regressed there for a bit but is recovering too. Those will cause issues with troubleshooting and make it
harder for users, giving the impression of a higher failure rate on such mod loader. We cannot deny it, but it's not really true anymore either.

The documentation for modding wasn't always great, between lots of lost chat logs during the early days, Fabric not having a forum, a nearly deserted subreddit (seriously, do not go there for support), 
a lot of information is now gated behind Discord guilds instead of freely available on forums (yes I am part of the group of people who do not like the over-reliance of Discord).  
This is one of the reason I have personally been part of the crowd who pushed a lot for [Quilt to have a forum](https://forum.quiltmc.org "QuiltMC's forum, don't hesitate to come!").
And the surprise is it's regularly active with support requests, and people answering them!

And I can't think this video was made entirely in good faith: while we could do better, I have witnessed and look over support requests in several modding Discord guilds, and most of the time
a solution is found quickly, but it needs the user requesting help to listen.

Educating both users and modders on how to mod the game is important to increasing compatibility and success chance when assembling a mod pack.

We, modders, are also working hard to make mods not only more compatible, but more integrated with each other! This is one of the technical goals of Quilt, which I use to my advantage
in my mods.

## My issues with the video

The video is flawed from the start, believing in the myth of the "golden age", and built on the experience of someone who join Discord guilds, asks for support, and does anything
other than what the helpers ask of them.

Then based on that assumes plentiful of things, while absolutely disregarding the actual work needed to put a modpack together, and not just a modpack that doesn't crash: an actual
well-made modpack with integration of its different mods. This will require work, on **any** mod loader.
Mods have dependencies, addons to make integrations proper, etc.

I noticed other mistakes like implying that you don't mod with Java on Forge while on Fabric you do.
Or that Fabric allowed mods to update less: it both does and doesn't, in theory Forge should be the one who allow this since it has a much bigger abstraction layer.
In theory, it should make mods less reliant on Mojang code, meaning less breakage. As you can see in reality it's not true, sometimes Fabric mods survive for long because they rely on very little
code or injections, but it's not always true either.

One other argument I absolutely dislike in the video is about mods getting lost because their author isn't updating the mod anymore and Fabric getting more and more dominant.
I think this is again a bad identification of the issue. Fabric existing or not wouldn't have changed anything there. It's also worth noting that a lot of early mods do not have
permissive licensing, preventing other modders to legally update those mods. I don't think this argument has its place in the video.

What pushed me into writing this blog post was when apparently people gave the impression that "Forge and Fabric mods working together is unimportant" and the video turned into a Fabric shit-fest.
While I don't like current Fabric for other reasons, I also don't like it when it's talked badly about for the wrong reasons. Any mod loader can be criticized, even Quilt,
but you need the good reasons.

I almost gave the benefit of the doubt, hoping the video wasn't a "Forge good, Fabric bad" rant because it was coated into some kind of other problem, but the reality is different.

## Conclusion

Finally, sweet release.

Modern modding still has issues, I cannot deny it, but this video is just *so* wrong.
Forge wasn't more compatible despite it being one of its goal, sure it was better than no API, but it's not the best we can reach.
Fabric ecosystem isn't less compatible, and especially not because of Mixins even though it can be improved.

Modding compatibility is high, higher than before.
Modders and API makers are working together, very hard, to make the modding scene better for everyone.

This video only skims the surface of "does it crash or not" while issues can go much deeper and be much sneakier as we've seen in this post, not because taking a scoop of 300 mods 
doesn't crash means it's issue-free or actually compatible.

I do not know to whom this will reach, but I hope it gives another perspective and new arguments to fuel your own critical thinking.

It's also worth noting I have very strong opinions about mod integration and some modders don't agree with them (so far it was always Forge modders, but I also feel like every time I had discussions
about it there were severe misunderstandings on what I wanted to do).

Anyway, I'll continue to work on Quilt with the many amazing people there to hopefully make compatibility better and most importantly integration better, with lots of robust APIs thanks
to all the experiences Forge and Fabric had.

[fabric]: https://fabricmc.net "FabricMC's website"
[quilt]: https://quiltmc.org "QuiltMC's website"
[patchwork]: https://patchworkmc.net/ "PatchworkMC's website"
