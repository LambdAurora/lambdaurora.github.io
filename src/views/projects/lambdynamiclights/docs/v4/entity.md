By default, entity lighting is determined by some basics: is the entity on fire? Is the entity holding an item emitting light? Etc.
In addition to those basics, [LambDynamicLights] provide some default entity lighting files.

As good as this is, we might want to make more entities able to emit light under various conditions.

This is where entity lighting JSON come into play. Each file is named as such `assets/<namespace>/dynamiclights/entity/<file>.json`.
While the name doesn't have any constraint aside from the same constraints a resource-pack has (all lowercase, no spaces),
it is best practice to name it in a descriptive way or similar to the entities affected by it.

It is possible that multiple files affect the same entities, in which case the file providing the highest light value will win if the conditions are met.
You can override an existing file from a mod or another resource-pack through a higher-priority resource-pack.

[[ToC]]

## The Format

The format of each of the files is the following:

### `match`

This is where you will match the entities to affect.
This is very similar to how entity predicates work in advancements, but with a reduced-set of features since this has to work on the client.

This will be defined as a dynamic lighting entity predicate.

#### `type`

One or more [entity type(s)][entity_types] (an [ID], or a [tag] with `#`, or an array containing IDs) — Test this entity's type.

###### Examples

To match a single entity type:
```json
"type": "minecraft:blaze"
```

To match multiple entity types:
```json
"type": [
	"minecraft:blaze",
	"minecraft:magma_cube",
	"#minecraft:zombies"
]
```

To match an entity type tag:
```json
"type": "#minecraft:skeletons"
```

#### `located`

This is a location predicate.

<tree_view>
	<tree_view_item>
		<tree_view>
			<tree_view_item>
				`position` - a status effect that must be present

				<tree_view>
					<tree_view_item>
						`x` - either an X value or bounds
					</tree_view_item>
					<tree_view_item>
						`y` - either a Y value or bounds
					</tree_view_item>
					<tree_view_item>
						`z` - either a Z value or bounds
					</tree_view_item>
				</tree_view>
			</tree_view_item>
			<tree_view_item>
				`biomes` - the biome at this location.
				Accepts biome [IDs][id] (see [Minecraft's Wiki Biome#Biome IDs](https://minecraft.wiki/w/Biome#Biome_IDs) for the ones used in vanilla)
				as a single entry or a list.
				Also accepts a hash-prefixed biome [tag].
			</tree_view_item>
			<tree_view_item>
				`dimension` - an [ID] for the dimension.
			</tree_view_item>
			<tree_view_item>
				`smokey` - `true` if this location must be smokey, or `false` if it must not.
			</tree_view_item>
			<tree_view_item>
				`light` - a light predicate, which is either

				<ul>
					<li>
						any light

						<tree_view>
							<tree_view_item>
								`any` - either a light value between `0` and `15`, or bounds.
							</tree_view_item>
						</tree_view>
					</li>
					<li>
						specific

						<tree_view>
							<tree_view_item>
								`block` - either a block light value between `0` and `15`, or bounds. 
							</tree_view_item>
							<tree_view_item>
								`sky` - either a sky light value between `0` and `15`, or bounds. 
							</tree_view_item>
						</tree_view>
					</li>
				</ul>
			</tree_view_item>
			<tree_view_item>
				`can_see_sky` - `true` if this location must be able to see the sky, or `false` if it must not.
			</tree_view_item>
		</tree_view>
	</tree_view_item>
</tree_view>

#### `effects`

For testing the active [status effects](https://minecraft.wiki/w/Effect) on the entity.

From the Minecraft's Wiki:
<tree_view>
<tree_view_item>
<tree_view>
	<tree_view_item>
		<code>&lt;minecraft:effect\_name></code> - a status effect that must be present

		<tree_view>
			<tree_view_item>
				`amplifier` - test the effect's amplifier. `Level I` is represented by 0. Use an object with  min and  max to test for a range of values (inclusive).
			</tree_view_item>
			<tree_view_item>
				`duration` - test if the effect's remaining time (in ticks). Test if the effect's remaining time (in ticks) is between two numbers, inclusive.
				Use an object with  min and  max to test for a range of values (inclusive).
			</tree_view_item>
			<tree_view_item>
				`ambient` - test whether the effect is from a beacon.
			</tree_view_item>
			<tree_view_item>
				`visible` - test if the effect has visible particles.
			</tree_view_item>
		</tree_view>
	</tree_view_item>
</tree_view>
</tree_view_item>
</tree_view>

#### `flags`

To test flags of the entity. 

From the Minecraft's Wiki:

<tree_view>
<tree_view_item>
<tree_view>
	<tree_view_item>`is_baby` - test whether the entity is or is not a baby variant.</tree_view_item>
	<tree_view_item>`is_on_fire` - test whether the entity is or is not on fire.</tree_view_item>
	<tree_view_item>`is_sneaking` - test whether the entity is or is not sneaking.</tree_view_item>
	<tree_view_item>`is_sprinting` - test whether the entity is or is not sprinting.</tree_view_item>
	<tree_view_item>`is_swimming` - test whether the entity is or is not swimming.</tree_view_item>
	<tree_view_item>`is_on_ground` - test whether the entity is or is on the ground.</tree_view_item>
	<tree_view_item>`is_flying` - test whether the entity is or is not flying (with elytra or in creative mode).</tree_view_item>
</tree_view>
</tree_view_item>
</tree_view>

#### `equipment`

For testing the items that this entity holds in its equipment slots.

<tree_view>
<tree_view_item>
<tree_view>
	<tree_view_item>
		<code>&lt;equipment slot></code> - test the item in the entity's equipment slot.
		Valid keys are `mainhand`, `offhand`, `head`, `chest`, `legs`, `feet` or `body`.

		<tree_view>
			<tree_view_item>
				The [item predicate] to match for this equipment slot.
			</tree_view_item>
		</tree_view>
	</tree_view_item>
</tree_view>
</tree_view_item>
</tree_view>

#### `vehicle`

A dynamic lighting entity predicate to match the vehicle of this entity.

#### `passenger`

A dynamic lighting entity predicate to match any of the passengers of this entity.

#### `slots`

Test for items in specific inventory [slots][slot].

<tree_view>
<tree_view_item>
<tree_view>
	<tree_view_item>
		<code>&lt;slot range></code> - [slot] to test.

		<tree_view>
			<tree_view_item>
				The [item predicate] to match for any of the specified [slots][slot].
			</tree_view_item>
		</tree_view>
	</tree_view_item>
</tree_view>
</tree_view_item>
</tree_view>

### `luminance`

The luminance can either be:
- a number between `0` and `15` (inclusive), which corresponds to the luminance of the entity;
- an object with a type and arguments, this means the luminance value will be provided by the specified [luminance provider](#luminance-providers);
- an array of the previous possibilities.

### `silence_error` <icon:warning ls_size="text" aria-hidden="true" />

*(Default: `false`)*

A boolean value: `true` to silence any kind of runtime error from this file,
this is heavily discouraged unless you know what you're doing as you will not be made aware of errors!

Errors will still be logged if in a development environment or if the `lambdynamiclights.resource.force_log_errors` property is set to `true`.

## Luminance Providers

### `lambdynlights:value`

Provides a given static luminance value.
This luminance provider is implicitely used when a number is provided instead of an object.

<tree_view>
<tree_view_item>
<tree_view>
	<tree_view_item>
		`type`: `lambdynlights:value`
	</tree_view_item>
	<tree_view_item>
		`value` - the value of the luminance between `0` and `15` (inclusive)
	</tree_view_item>
</tree_view>
</tree_view_item>
</tree_view>

### `lambdynlights:item`

Provides the luminance value of the given item.

<tree_view>
<tree_view_item>
<tree_view>
	<tree_view_item>
		`type`: `lambdynlights:item`
	</tree_view_item>
	<tree_view_item>
		`item` - an item, see [the Minecraft Wiki][item_format] for the format
	</tree_view_item>
	<tree_view_item>
		`include_rain` *(Default: `false`)* - `true` if the wetness check should include rain, or `false` otherwise
	</tree_view_item>
	<tree_view_item>
		`always` *(Optional)* - let the item be always considered dry (`dry`) or wet (`wet`) if present
	</tree_view_item>
</tree_view>
</tree_view_item>
</tree_view>

### `lambdynlights:water_sensitive`

Provides a luminance value depending on whether the entity is out of water or underwater.

<tree_view>
<tree_view_item>
<tree_view>
	<tree_view_item>
		`type`: `lambdynlights:water_sensitive`
	</tree_view_item>
	<tree_view_item>
		`out_of_water` *(Optional)* - a [luminance](#luminance) value or values if the entity is out of water
	</tree_view_item>
	<tree_view_item>
		`in_water` *(Optional)* - a [luminance](#luminance) value or values if the entity is underwater
	</tree_view_item>
</tree_view>
</tree_view_item>
</tree_view>

### `lambdynlights:wet_sensitive`

Provides the luminance value depending on whether the entity is wet or dry.

<tree_view>
<tree_view_item>
<tree_view>
	<tree_view_item>
		`type`: `lambdynlights:wet_sensitive`
	</tree_view_item>
	<tree_view_item>
		`dry` *(Optional)* - a [luminance](#luminance) value or values if the entity is dry
	</tree_view_item>
	<tree_view_item>
		`wet` *(Optional)* - a [luminance](#luminance) value or values if the entity is wet
	</tree_view_item>
</tree_view>
</tree_view_item>
</tree_view>

### Entity-specific Luminance Providers

Entity-specific luminance providers only work with the entity they're designed for, if the entity isn't expected they will return `0`.
Each entity-specific luminance providers have its own behavior with the entity they're targeting for.

Most of them doesn't have any arguments, which results in the following structure:

<tree_view>
<tree_view_item>
<tree_view>
	<tree_view_item>
		`type`: <code>lambdynlights:&lt;type name></code>
	</tree_view_item>
</tree_view>
</tree_view_item>
</tree_view>

Here's a list of the various entity-specific providers and for which entities they're for:

| Type                                   | Targeted Entities                             | Description                                                                |
|:---------------------------------------|:----------------------------------------------|:---------------------------------------------------------------------------|
| `lambdynlights:arrow/item_derived`     | Arrow-like entities (`minecraft:arrow`, etc.) | Uses the luminance of the provided by the item which represents the arrow. |
| `lambdynlights:creeper`                | `minecraft:creeper`                           | Provides a luminance for a creeper about to explode, this is influenced by [LambDynamicLights]' creeper lighting setting. |
| `lambdynlights:display/block`          | `minecraft:block_display`                     | Uses the luminance of the displayed block.                                 |
| `lambdynlights:display/item`           | `minecraft:item_display`                      | Uses the luminance of the displayed item.                                  |
| `lambdynlights:enderman`               | `minecraft:enderman`                          | Uses the luminance of the carried block if present.                        |
| `lambdynlights:falling_block`          | `minecraft:falling_block`                     | Uses the luminance of the block used to display the falling block.         |
| `lambdynlights:glow_squid`             | `minecraft:glow_squid`                        | Provides a luminance for glow squids depending on their darkness ticks.    |
| `lambdynlights:item_entity`            | `minecraft:item`                              | Uses the luminance of the item representing the entity.                    |
| `lambdynlights:item_frame`             | `minecraft:item_frame`                        | Uses the luminance of the item held the entity.                            |
| `lambdynlights:magma_cube`             | `minecraft:magma_cube`                        | Provides a luminance for magma cubes depending on their squish state.      |
| `lambdynlights:minecart/display_block` | Minecart-like entities (`minecraft:minecart`, etc.) | Uses the luminance of the display block in the minecart.             |

#### `lambdynlights:display`

This is a luminance providers specific to [display entities](https://minecraft.wiki/w/Display).
Its goal is to provide a nested luminance only if the display entity doesn't have an overriden brightness.

<tree_view>
<tree_view_item>
<tree_view>
	<tree_view_item>
		`type`: `lambdynlights:display`
	</tree_view_item>
	<tree_view_item>
		`luminance` - a [luminance](#luminance) value or values if the display entity doesn't have an overridden brightness
	</tree_view_item>
</tree_view>
</tree_view_item>
</tree_view>

## Examples

Here are some built-in examples which can be found in the mod:

### `lambdynlights:dynamiclights/entity/allay.json`

```json
{
	"match": {
		"type": "minecraft:allay"
	},
	"luminance": 8
}
```

### `lambdynlights:dynamiclights/entity/blaze.json`

```json
{
	"match": {
		"type": "minecraft:blaze"
	},
	"luminance": {
		"type": "lambdynlights:wet_sensitive",
		"dry": 10,
		"wet": 4
	}
}
```

### Item Frames

#### `lambdynlights:dynamiclights/entity/item_frame.json`

```json
{
	"match": {
		"type": [
			"minecraft:item_frame",
			"minecraft:glow_item_frame"
		]
	},
	"luminance": {
		"type": "lambdynlights:item_frame"
	}
}
```

#### `lambdynlights:dynamiclights/entity/glow_item_frame.json`

```json
{
	"match": {
		"type": "minecraft:glow_item_frame"
	},
	"luminance": 12
}
```

[LambDynamicLights]: ../..
[id]: https://minecraft.wiki/w/Resource_location "Identifier (Minecraft Wiki)"
[tag]: https://minecraft.wiki/w/Tag "Tag (Minecraft Wiki)"
[entity_types]: https://minecraft.wiki/w/Java_Edition_data_values#Entities "Entity types (Minecraft Wiki)"
[item predicate]: https://minecraft.wiki/w/Template:Nbt_inherit/conditions/item/template "Item Predicate (Minecraft Wiki)"
[slot]: https://minecraft.wiki/w/Slot "Slot (Minecraft Wiki)"
[item_format]: https://minecraft.wiki/w/Template:Nbt_inherit/itemnoslot/template "Item data format (Minecraft Wiki)"
