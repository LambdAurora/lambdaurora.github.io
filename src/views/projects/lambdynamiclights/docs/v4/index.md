Welcome to the documentation pages of [LambDynamicLights] version 4!

## The Basics

Before jumping in this documentation you will need to understand some basic concepts to best understand what will be talked about here.

[LambDynamicLights] provides various utilities to make items or entities light up through data-driven features (as-in resource-packs or only JSON files for mods).
The advantage of this approach is it's extremely flexible for users (resource-packs are much approachable than mods),
and it reduces the need to fully depend on the mod for mod authors, thus simplifying heavily how mods interact with dynamic lighting.

Of course, data-driven features may reach some limits, which is why there is also the ability to interact or add features directly with Java code for modders.

The directory in which we will work in a resource-pack or a mod is `assets/<your namespace>/dynamiclights/`.  
In this directory there may be two sub-directories: `item` for item-related features, and `entity` for entity-related features:
- [Item-related features][item] will let you add or override the lighting of any items in the game.
- [Entity-related features][entity] will let you add or override the lighting of any entities in the game.

We will often use light values (aka luminance), it is important to know that in Minecraft those values are between `0` and `15` inclusive.

If you're a modder, the mod identifiers of [LambDynamicLights] are:
- `lambdynlights` for the full mod;
- `lambdynlights_api` for the API only.

Now that you got the basics, I invite you to look at the documentation page of the feature you'd like to interact with.

### For Mod Development Environments

If you're a modder, while importing [LambDynamicLights] in your environment is not strictly necessary for its API for the most basic features,
there might be some cases where the data-driven API will be too limiting, or if you just want to import the mod to test your code, it is possible to import
the mod or its API in your development environment.

As a starting point, you will need to add the following Maven repository to your buildscript:
```kotlin
repositories {
	maven {
		name = "Gegy"
		url = uri("https://maven.gegy.dev")
	}
}
```

Then you can add to your dependencies either the API, the runtime, or both:

```kotlin
dependencies {
	// The API of LambDynamicLights.
	// This is only required for compilation if you're using the Java API.
	modCompileOnly("dev.lambdaurora.lambdynamiclights:lambdynamiclights-api:<version>")

	// For runtime of LambDynamicLights.
	// Include only if you need to test in your dev env compatibility with LambDynamicLights.
	// Replace with modRuntimeOnly if you want the dependency to be transitive.
	modLocalRuntime("dev.lambdaurora.lambdynamiclights:lambdynamiclights-runtime:<version>")
}
```

## Advanced

If the data-driven APIs are not enough for you, don't worry [LambDynamicLights] has a Java-based API which provides even more features!

I invite you to read [the modding interfaces documentation page](./java.html) to learn more about those features.

[LambDynamicLights]: ../..
[item]: ./item.html "Documentation of the item-related lighting features"
[entity]: ./entity.html "Documentation of the entity-related lighting features"
