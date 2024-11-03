By default, if a given item has an assigned block, then the mod will try to make the item emit the same amount of light as the block.

As good as it is, this is very limiting, and we might want to make more items able to emit light.

This is where item lighting JSON come into play. Each file is named as such `assets/<namespace>/dynamiclights/item/<file>.json`.
While the name doesn't have any constraint aside from the same constraints a resource-pack has (all lowercase, no spaces),
it is best practice to name it in a descriptive way or similar to the items affected by it.

It is possible that multiple files affect the same item, in which case the file providing the highest light value will win if the conditions are met.
You can override an existing file from a mod or another resource-pack through a higher-priority resource-pack.

## The Format

The format of each of the files is the following:

<tree_view>
	<tree_view_item>
		<tree_view>
			<tree_view_item>
				`match` - This is an [item predicate](https://minecraft.wiki/w/Template:Nbt_inherit/conditions/item/template) to match the items to affect.
			</tree_view_item>
			<tree_view_item>
				`luminance` - Can either be:

				<ul>
					<li>a number between `0` and `15` (inclusive), which corresponds to the luminance of the item.</li>
					<li>an object to copy the luminance of the specified block:

						<tree_view>
							<tree_view_item>
								`type`: `block`
							</tree_view_item>
							<tree_view_item>
								`block`: the specified block identifier
							</tree_view_item>
						</tree_view>
					</li>
					<li>an object to copy the luminance of the block associated with the matched item.

						<tree_view>
							<tree_view_item>
								`type`: `block_self`
							</tree_view_item>
						</tree_view>
					</li>
				</ul>
			</tree_view_item>
			<tree_view_item>
				`water_sensitive` *(Default: `false`)* - `true` if the item should not emit light when underwater, or `false` otherwise.
			</tree_view_item>
			<tree_view_item>
				`silence_error` *(Default: `false`)* - `true` to silence any kind of runtime error from this file,
				this is heavily discouraged unless you know what you're doing as you will not be made aware of errors!  

				Errors will still be logged if in a development environment or if the `lambdynamiclights.resource.force_log_errors` property is set to `true`.
			</tree_view_item>
		</tree_view>
	</tree_view_item>
</tree_view>

## Examples

Here are some built-in examples which can be found in the mod:

##### `lambdynlights:dynamiclights/item/fire_charge.json`

```json
{
	"match": {
		"items": "minecraft:fire_charge"
	},
	"luminance": 10,
	"water_sensitive": true
}
```

##### `lambdynlights:dynamiclights/item/lava_bucket.json`

```json
{
	"match": {
		"items": "minecraft:lava_bucket"
	},
	"luminance": {
		"type": "block",
		"block": "minecraft:lava"
	},
	"water_sensitive": true
}
```

##### `lambdynlights:dynamiclights/item/nether_star.json`

```json
{
	"match": {
		"items": "minecraft:nether_star"
	},
	"luminance": 8
}
```

##### `lambdynlights:dynamiclights/item/torch.json`

```json
{
	"match": {
		"items": [
			"minecraft:torch",
			"minecraft:redstone_torch",
			"minecraft:soul_torch"
		]
	},
	"luminance": {
		"type": "block_self"
	},
	"water_sensitive": true
}
```
