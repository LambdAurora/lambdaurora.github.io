As a modder you might need to interact more directly with LambDynamicLights' API through Java interfaces.

There interfaces will allow you to:
- register new entity luminance providers for use in entity lighting JSON files;
- query lighting of an item or an entity;
- or bypass the JSON files and directly register item or entity lighting through registration events.

<h2>Table of Content</h2>

[[ToC]]

## Getting Started

If you haven't already followed the steps to set up your Gradle buildscript,
please head back to the section [For Mod Development Environments](./#for-mod-development-environments) of the main page to do so.

Once you have the [LambDynamicLights] API in your development environment we can start by setting up the basics.

This API's design uses Fabric's entrypoint philosophy which allows declaring that one part of your code will be initialized directly
by [LambDynamicLights]. This design allows mod-loaders to not depend on an initialization order.  
This design choice should be upheld by NeoForge ports as well, even if not the convention in that ecosystem.

For multi-loader modders: the API is multi-loader! This means you can directly add it to your common project, and it should work as-is.

Let's create our own [LambDynamicLights] initializer as follows:

```java
public class YourModDynamicLightsInitializer implements DynamicLightsInitializer {
	@Override
	void onInitializeDynamicLights(
		ItemLightSourceManager itemLightSourceManager,
		EntityLightSourceManager entityLightSourceManager
	) {
		// Code related to dynamic lighting here.
	}
}
```

On its own, this initializer won't do much.
The code to execute when [LambDynamicLights] is present will be in the `onInitializeDynamicLights` method, which gives two arguments:
the item light source manager, and the entity light source manager. Both of these objects will allow you to query values or add registration listeners.

But this Java code isn't enough for the initializer to be known by [LambDynamicLights], we also need to declare the initializer in your mod's manifest file.

On Fabric, this translates into adding in the `entrypoints` field of your `fabric.mod.json` file the following:

```json
	"entrypoints": {
		"dynamiclights": [
			"<package>.YourModDynamicLightsInitializer"
		]
	}
```

On NeoForge, this translates into adding in the `modproperties` table of your `neoforge.mods.toml` file the following:

```toml
[[mods]]
# Stuff

[modproperties.${mod_id}]
	"lambdynamiclights:initializer" = "<package>.YourModDynamicLightsInitializer"
```

<div class="ls_alert ls_alert__warning" style="margin-top: 1em; margin-bottom: 1em;">
	Keep in mind that [LambDynamicLights] is a client-side mod, this means you will **not** have access to the API on the server,
	and code in your dynamic lights initializer will not be executed either.
</div>

## Register an Entity Luminance Provider

Entity luminance providers are composed of a method to compute the luminance given an entity and of a Codec which allows the luminance provider to be used
in [entity lighting](./entity.html) JSON files.

To make our own, let's start by creating a new class:

```java
public record CustomEntityLuminance(boolean invert) implements EntityLuminance {
	// The Codec of this entity luminance provider,
	// this describes how to parse the JSON file.
	public static final MapCodec<CustomEntityLuminance> CODEC = RecordCodecBuilder.mapCodec(
			instance -> instance.group(
				Codec.BOOL.fieldOf("invert").forGetter(CustomEntityLuminance::invert)
			).apply(instance, CustomEntityLuminance::new)
	);

	@Override
	public Type type() {
		// This is the registered type of this entity luminance provider.
		// We will modify the initializer to reflect this.
		return YourModDynamicLightsInitializer.CUSTOM_ENTITY_LUMINANCE;
	}

	@Override
	public @Range(from = 0, to = 15) int getLuminance(
		ItemLightSourceManager itemLightSourceManager,
		Entity entity
	) {
		// Here we compute the luminance the given entity should emit.
		// We also have access to the item light source manager,
		// in case our luminance depends on the luminance of an item.
		boolean isNight = this.invert ? entity.level().isDay() : entity.level().isNight();

		return isNight ? 10 : 0;
	}
}
```

We have created the luminance provider implementation, now we have to register it in the initializer:

```java
public class YourModDynamicLightsInitializer implements DynamicLightsInitializer {

	public static final EntityLuminance.Type CUSTOM_ENTITY_LUMINANCE
		= EntityLuminance.Type.register(
			Identifier.of("<your namespace>", "custom"),
			CustomEntityLuminance.CODEC
		);

	// Initializer code
}
```

Now that it is registered we can use it in any JSON file with this snippet:

```json
{
	"type": "<your namespace>:custom",
	"invert": false
}
```

If your luminance provider doesn't take any arguments and only is a singleton, we can simplify the code and get rid of the Codec altogether:

```java
public final class ConstantEntityLuminance implements EntityLuminance {
	// The singleton instance.
	public static final ConstantEntityLuminance INSTANCE = new ConstantEntityLuminance();

	private ConstantEntityLuminance() {}

	@Override
	public Type type() {
		// This is the registered type of this entity luminance provider.
		return YourModDynamicLightsInitializer.CONSTANT;
	}

	@Override
	public @Range(from = 0, to = 15) int getLuminance(
		ItemLightSourceManager itemLightSourceManager,
		Entity entity
	) {
		return 5;
	}
}

// And in your initializer file:
public class YourModDynamicLightsInitializer implements DynamicLightsInitializer {

	public static final EntityLuminance.Type CONSTANT
		= EntityLuminance.Type.registerSimple(
			Identifier.of("<your namespace>", "custom"),
			ConstantEntityLuminance.INSTANCE
		);

	// Initializer code
}
```

## Query Dynamic Light Values

You might have noticed the `ItemLightSourceManager` and the `EntityLightSourceManager` objects earlier,
those allow to query the dynamic light value of a given item or a given entity:

```java
int lightOfTorch = itemLightSourceManager.getLuminance(
		new ItemStack(Items.TORCH), 
		/* submerged in water */ false
	);

Entity cow = /* get a cow */;
int lightOfCow = entityLightSourceManager.getLuminance(cow);
```

It is currently not possible to query the dynamic light value of a precise position in the world from the API.

## Listen for Item or Entity Lighting Registration

If for some reason the JSON way doesn't fit your use-case, it is possible to register the same data through Java code:

```java
itemLightSourceManager.onRegisterEvent().register(context -> {
	// You have registry access through context.registryAccess()
	
	// Register item lighting with any of the context.register() overloads.
	context.register(Items.ALLIUM, 5);
});

entityLightSourceManager.onRegisterEvent().register(context -> {
	// You have registry access through context.registryAccess()
	
	// Register entity lighting with any of the context.register() overloads.
	context.register(EntityType.ARMADILLO,
		new ItemDerivedEntityLuminance(
			new ItemStack(Items.TORCH),
			/* include rain? */ false,
			Optional.empty()
		)
	);
});
```

For those familiar with Fabric-style events, while this API is multi-loader,
it is using the [Yumi Commons Event](https://github.com/YumiProject/yumi-commons) framework,
which is based off the Fabric event framework.
This means it can be used similarly, and it will let you order your listeners if needed.

[LambDynamicLights]: ../..
