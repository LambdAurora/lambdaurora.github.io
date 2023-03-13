# 1. Introduction To Minecraft Modding

<!--description:Introduction to Minecraft modding: what are the prerequisites, where you can begin, and what's to keep in mind.-->

Minecraft modding involves modifying the base game to add new features, 
modify features, replace features, or even remove features if wanted.
Minecraft modding can be fun, both for players and modders alike, 
as it allows expanding the game in fun ways and express creativity in new ways.

Modding is interesting because it allows you to expand your technical knowledge (optimization, rendering, etc.),
express creativity in unique ways, better your game design skills, and share stuff with people!

If you want to have a good time with modding, you should primarily approach it as a hobby and for fun,
if a modder manages to make modding their job, good for them, but that's very unlikely to happen.
Despite modern social networks emphasis on numbers, you really shouldn't look at how many times your mod
has been downloaded or how much money it made, you should focus on your own fun!

Let's get into it!

[[ToC]]

## Prerequisites

To start modding you may need to know some stuff first to make it easier.

Minecraft is made in [Java], Java has the advantage of being a relatively flexible enough language for modding.
This means we can easily inject new Java code, or even replace parts of the code with other. This means a very important thing:

**You should learn Java first!**

Knowing Java will help you greatly in writing code for your mods.

Not interested in learning Java but still want to make mods?
It's ok! There's alternatives to participate in the modding scene:
- [MCreator] is a tool to make mods with a graphical interface, it generates the Java code for you,
  though such code is usually rather ugly and a pain for other modders to support.

Have a different skill set? You're not a fan of programming but you prefer texturing or writing lore?  
That's fine! Everyone's different, looking for other modders that know how to code might be interesting to work
as a team on a mod. Lots of big mods are made by teams of people!

If you go with the non-programmer way, this article won't be entirely relevant to you, though
some points may still be interesting.

If you go with the programmer way and know enough Java,
you should get an IDE (Integrated Development Environment), this will improve greatly your programming experience.
IDEs commonly used by the community are:

- [Intellij IDEA](https://www.jetbrains.com/idea/), this is the most popular IDE in the community;
- [VSCode](https://code.visualstudio.com/);
- [Eclipse](https://www.eclipse.org/), an IDE that has fallen out of popularity lately.

Once you've got the IDE, you might need to familiarize yourself with [Gradle] which is the build tool used.

## The Mod Loader

The mod loader is a big question, some may want to make their mod on all mod loaders, some only choose one.
The mod loader is what will load your mod, usually there's standard libraries made along them for your mod
to use, simplifying greatly some things and improving greatly compatibility.

There's currently 3 main mod loaders:

- [Quilt], which is the newest and based off Fabric, it's my personal favorite mod loader which means I'll be talking more about it.
  Quilt has a focus on compatibility and mod integration (which I'll talk more in details later), and try to offer to both modders and players very interesting features.
  And as a treat Fabric mods run on Quilt too.
- [Forge], a very old mod loader with a big community, it has a large API but is often criticized of being too heavy.
- [Fabric], was a response to Forge's technical issues, and is a popular mod loader today. Though it has issues which I won't detail here.

The rest of this article should talk of things that would apply no matter the mod loader,
but when it comes to code they're very different, this means if I have more articles that introduce code they won't always be relevant,
and it also usually means mods of a specific loader cannot run on others.

## Mappings

Mappings are the names of the methods, fields, and other various symbols in the Minecraft code.
Minecraft is obfuscated, this means that all the names are shortened and loose meaning,
for a long while Mojang did not offer official mappings, this lead to the community creating various
mappings using retro-engineering like [MCP](https://github.com/MinecraftForge/MCPConfig) which is now defunct,
or Fabric's [Yarn](https://github.com/FabricMC/yarn/), and [Quilt Mappings](https://github.com/QuiltMC/quilt-mappings/).

For newer versions Mojang publishes the official mappings (often called "mojmap"),
which are the actual original names. Though it lacks any kind of documentation (which [Parchment] is trying to fix).

If you want to make a mod that's available on multiple mod loaders it's recommended to use mojmap.
For Quilt or Fabric you may choose to use Yarn or Quilt Mappings as alternatives, though it's not a must,
so it should be chosen purely out of preference.

## Modding Philosophy

Before jumping straight to modding, I wish to discuss something that's often overlooked in modding tutorials:
the modding philosophy.

If your mod is intended to be used along other mods by a lot of people, then you really should pay attention to this part.

Here's some things you should keep in mind when modding:

### Clean and Readable Code

You should keep your code readable!
While it might seem an obvious advice, it's often a forgotten one.
Clean and readable code will greatly help you when you wish to update your mod.

### Test Your Mod

You should always try to test your mod before publishing it, of course bugs always slip in,
but a tested mod is less likely to break!

Mod loaders start to include tools to use the Game Test system as seen in [Henrik Kniberg's keynote](https://www.youtube.com/watch?v=TNkPE6NTNHQ),
or unit testing abilities, allowing to automatize the testing of your mod.

### Compatibility & Integration

One of the amazing things of modding is being able to combine mods, it's so popular that people create modpacks and share them.

To allow this to happen it requires to put extra attention to your mod's code to make it compatible.
Other mod authors will also appreciate if your mod is made with compatibility in mind since solving such issues
is always annoying, especially for other parties that can't fix your incompatibility.

Though, I'd argue that compatibility is not enough, integration is much better.
If possible you should strive for integration, it creates more cohesive experiences for players.

For example having a mod that adds a new tree and wood type, and a mod that adds wooden chairs,
them not crashing and working along will be compatibility, though it doesn't mean there's a wooden chair
for the new wood type. Making so that a wooden chair for that new wood type is also added when both mods
are presents is integration.  
You don't just make it work "together", you make them work hand-in-hand together. And that, in my opinion, is much better and enjoyable.

## Let Me Begin!

Okay! okay!

I am not going to cover how to code a mod here,
so now it's time to dig into the mod loader's documentation you wish to use.

Great starting points are example mods like [Quilt's template mod][QTM] and wikis.

So now go wild!

[Java]: https://en.wikipedia.org/wiki/Java_(programming_language) "Java (Wikipedia)"
[Gradle]: https://gradle.org/
[MCreator]: https://mcreator.net/
[Quilt]: https://quiltmc.org/
[Forge]: http://minecraftforge.net/
[Fabric]: https://fabricmc.net/
[Parchment]: https://parchmentmc.org/
[QTM]: https://github.com/QuiltMC/quilt-template-mod
