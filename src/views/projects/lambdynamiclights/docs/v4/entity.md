By default, entity lighting is determined by some basics: is the entity on fire? Is the entity holding an item emitting light? Etc.
In addition to those basics, [LambDynamicLights] provide some default entity lighting files.

As good as this is, we might want to make more entities able to emit light under various conditions.

This is where entity lighting JSON come into play. Each file is named as such `assets/<namespace>/dynamiclights/entity/<file>.json`.
While the name doesn't have any constraint aside from the same constraints a resource-pack has (all lowercase, no spaces),
it is best practice to name it in a descriptive way or similar to the entities affected by it.

It is possible that multiple files affect the same entities, in which case the file providing the highest light value will win if the conditions are met.
You can override an existing file from a mod or another resource-pack through a higher-priority resource-pack.

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
- an object with a type and arguments, this means the luminance value will be provided by the specified luminance provider;
- an array of the previous possibilities.

### `silence_error` <icon:warning aria-hidden="true" />

*(Default: `false`)*

A boolean value: `true` to silence any kind of runtime error from this file,
this is heavily discouraged unless you know what you're doing as you will not be made aware of errors!

Errors will still be logged if in a development environment or if the `lambdynamiclights.resource.force_log_errors` property is set to `true`.

## Examples

Here are some built-in examples which can be found in the mod:

##### `lambdynlights:dynamiclights/entity/allay.json`

```json
{
	"match": {
		"type": "minecraft:allay"
	},
	"luminance": 8
}
```

##### `lambdynlights:dynamiclights/entity/blaze.json`

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

##### Item Frames

###### `lambdynlights:dynamiclights/entity/item_frame.json`

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

###### `lambdynlights:dynamiclights/entity/glow_item_frame.json`

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
