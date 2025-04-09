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
		DynamicLightsContext context
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
		"lambdynlights:initializer": [
			"<package>.YourModDynamicLightsInitializer"
		]
	}
```

On NeoForge, this translates into adding in the `modproperties` table of your `neoforge.mods.toml` file the following:

```toml
[[mods]]
# Stuff

[modproperties.${mod_id}]
	"lambdynlights:initializer" = "<package>.YourModDynamicLightsInitializer"
```

<div class="ls_alert" ls_alert_type="warning" style="margin-top: 1em; margin-bottom: 1em;">
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

You might have noticed the `DynamicLightsContext` object earlier,
this gives access to the dynamic lighting context which allows to query the dynamic light value of a given item or a given entity:

```java
int lightOfTorch = context.itemLightSourceManager().getLuminance(
		new ItemStack(Items.TORCH), 
		/* submerged in water */ false
	);

Entity cow = /* get a cow */;
int lightOfCow = context.entityLightSourceManager().getLuminance(cow);
```

It is currently not possible to query the dynamic light value of a precise position in the world from the API.

## Listen for Item or Entity Lighting Registration

If for some reason the JSON way doesn't fit your use-case, it is possible to register the same data through Java code:

```java
context.itemLightSourceManager().onRegisterEvent().register(context -> {
	// You have registry access through context.registryAccess()
	
	// Register item lighting with any of the context.register() overloads.
	context.register(Items.ALLIUM, 5);
});

context.entityLightSourceManager().onRegisterEvent().register(context -> {
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

## Add Custom Dynamic Light Sources (Dynamic Light Behavior)

While for most setting a luminance to an entity or item will be enough,
there may be cases where you might want more control over how a light source lights up an area.

The mod allows you to easily add light sources that fit within a bounding box and in which light level calculations will be left entirely up to you.
Those are called Dynamic Light Behavior within the mod's API.

This is the API that allowed LambDynamicLights to add lighting to beacon beams, Guardian lasers, and it's also the API that lead to the mod [Illuminated](https://modrinth.com/mod/illuminated).

<div align="center" style="margin-top: 1em; margin-bottom: 1em;">
	<img class="ls_responsive_img" src="https://raw.githubusercontent.com/LambdAurora/Illuminated/1.21.5/assets/flashlight_demo.png" alt="Flashlight Demo" style="max-width: 40em" />
</div>

Before diving into the API itself, it is very important to know about the debug settings of LambDynamicLights which
may save you some precious time when debugging lighting code.
The debug settings are located within LambDynamicLights' settings screen under the "Debug" tab.

<div align="center" style="margin-top: 1em; margin-bottom: 1em;">
	<img class="ls_responsive_img" src="/assets/projects/lambdynamiclights/debug_settings.png" alt="Debug Settings Screenshot" style="max-width: 40em" />
</div>

The settings you might be the most interested in when developing dynamic light behaviors are the three last.

To create a new dynamic light behavior you need to create a class that implements the `DynamicLightBehavior` interface.
This interface contains some methods to implement:

- `double lightAtPos(BlockPos pos, double falloffRatio)`: this is the method where the magic happens,
  this is where the mod will query for the light level at a given position.
  This method will be called for all positions inside the bounding box.  
  While lights in Minecraft normally light up to 15 blocks of distance, LambDynamicLights has a cap on how far away
  a source may interact with the world. The argument `fallofRatio` is used to convert between the usual Minecraft
  distance scale to the one expected by the mod. Most commonly, you'll be multiplying your computed distance by this ratio.
- `BoundingBox getBoundingBox()`: returns the bounding box within the world of the dynamic light behavior, this may be dynamic.
- `boolean hasChanged()`: returns `true` whenever the dynamic light behavior needs to be updated (light level change, position change, etc.).
- `boolean isRemoved()` (defaults to `false`): returns `true` if the dynamic light behavior should be discarded by LambDynamicLights.

Then using the `DynamicLightsContext` given in the initializer you can get the `DynamicLightBehaviorManager` which offers two methods to add and remove dynamic light behaviors
within the current client world.

### Examples

#### A Short-Lived Single Point Dynamic Light Behavior

Let's say we want a Dynamic Light Behavior that lives for 600 ticks (~30s) with the light getting fainter:

```java
public class FadeOutDynamicLightBehavior implements DynamicLightBehavior {
	private final double x;
	private final double y;
	private final double z;
	private final BoundingBox box;
	private int remainingTicks = 600;
	private int lastLuminance = 15;
	private int luminance = 15;

	public FadeOutDynamicLightBehavior(BlockPos pos) {
		this.x = pos.getX() + 0.5;
		this.y = pos.getY() + 0.5;
		this.z = pos.getZ() + 0.5;

		this.box = new BoundingBox(
				pos.getX(), pos.getX() + 1,
				pos.getY(), pos.getY() + 1,
				pos.getZ(), pos.getZ() + 1
		);
	}

	@Override
	public @Range(from = 0, to = 15) double lightAtPos(BlockPos pos, double falloffRatio) {
		double dx = pos.getX() - this.x + 0.5;
		double dy = pos.getY() - this.y + 0.5;
		double dz = pos.getZ() - this.z + 0.5;

		double distanceSquared = dx * dx + dy * dy + dz * dz;
		return Math.max(
				this.luminance - Math.sqrt(distanceSquared) * falloffRatio,
				0.0
		);
	}

	@Override
	public @NotNull BoundingBox getBoundingBox() {
		return this.box;
	}

	@Override
	public boolean hasChanged() {
		if (this.luminance != this.lastLuminance) {
			this.lastLuminance = this.luminance;
			return true;
		} else {
			return false;
		}
	}

	public void tick() {
		// Function called every tick somewhere.
		this.luminance = (int) (remainingTicks / 600.f * 15.f);
		this.remainingTicks--;
	}

	@Override
	public boolean isRemoved() {
		return this.remainingTicks == 0;
	}
}
```

#### `LineLightBehavior` (Guardian Laser)

This dynamic light behavior is part of the API under the name `LineLightBehavior`.
[See on GitHub](https://github.com/LambdAurora/LambDynamicLights/blob/1.21.5/api/src/main/java/dev/lambdaurora/lambdynlights/api/behavior/LineLightBehavior.java).

And [here's the snippet](https://github.com/LambdAurora/LambDynamicLights/blob/a2e8e82998a424782a841116b90877c55c50ceae/src/main/java/dev/lambdaurora/lambdynlights/echo/GuardianEntityLightSource.java#L30)
where the dynamic light behavior is added and removed.

## Data Generation

The mod provides data generation utilities for item and entity light sources JSON files
through `ItemLightSourceDataProvider` and `EntityLightSourceDataProvider` respectively.

Simple extend the data provider and implement the `generate` method like you would with any data provider.
The `generate` method provides a generation context as an argument which provides various utilities.

[LambDynamicLights]: ../..
