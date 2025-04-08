onEvent('block.right_click', event => {
    // special chopping block recipe
    if (event.block.hasTag('forge:stripped_logs') && event.player.mainHandItem.hasTag('forge:axes') && event.player.offHandItem.hasTag('tfc:hammers')) {
        event.block.set('choppingblock:chopping_block')

        let pos = event.block.pos
        event.server.runCommandSilent(`playsound minecraft:item.axe.strip block @a ${pos.x} ${pos.y} ${pos.z} 1 1`)
        event.server.runCommandSilent(`particle minecraft:block ${event.block.id} ${pos.x + 0.5} ${pos.y + 1} ${pos.z + 0.5} 0.2 0.2 0.2 0 20`)
    }
    // mechanical belt dupe involving this specific wrench
    if (event.item.id == 'refinedstorage:wrench' && event.block.id == 'create:belt') event.cancel()
    // tanner exploit that lets you turn raw hide directly into leather
    if (event.item.id == 'minecraft:shears' && /^butchersdelight:rack/.test(event.block.id)) event.cancel()
    // heat frame + depot qol
    if (event.item.id == 'pneumaticcraft:heat_frame' && event.block.id == 'create:depot' && !event.player.crouching) {
        event.player.server.runCommandSilent(`title ${event.player} actionbar [["Drop item onto depot, or "], {"keybind":"key.sneak"}, [" + "], {"keybind":"key.use"}, [" to attach it"]]`)
        event.cancel()
    }
    if (['tfc_ie_addon:metal/sheet/uranium', 'firmalife:metal/sheet/chromium'].includes(event.item.id) && event.block.id == 'tfc:fire_bricks') event.cancel()
})

// These blocks will by default void all of their contents when broken, likely due to a coding oversight.
// This is obviously not supposed to happen :p
const dropInventoryWhenBroken = [
    'sewingkit:storing_sewing_station',
    'tfcchannelcasting:mold_table'
]

onEvent('block.break', event => {
    if (dropInventoryWhenBroken.includes(event.block.id)) {
        let storage = event.block.entityData?.Items?.Items
            || event.block.entityData?.inventory?.Items

        storage.forEach(stack => {
            if (!stack.ForgeCaps) event.block.popItem(Item.of(stack.id, stack.Count, stack.Tag))
            else {   // Manual pop that lets us assign ForgeCaps data
                let itemEntity = event.level.createEntity('item')
                itemEntity.fullNBT = `{Item:${stack}}`
                itemEntity.x = event.block.x + 0.5
                itemEntity.y = event.block.y + 0.5
                itemEntity.z = event.block.z + 0.5
                itemEntity.motionX = (Math.random() * 0.1) - 0.05
                itemEntity.motionY = 0.2
                itemEntity.motionZ = (Math.random() * 0.1) - 0.05
                itemEntity.spawn()
            }
        })
    }

    // Prevent ice from spawning water when broken with a saw
    if (event.block.id == 'minecraft:ice' && !event.player.isCreativeMode()) {
        if (event.player.mainHandItem.hasTag('forge:tools/saws')) {
            event.block.set('minecraft:air')        // Usual loot table drops seem to stop working
            event.block.popItem('minecraft:ice')    // when replacing the block with air
        }
    }
    // TFC's Ice Piles seem to not drop any items even if their loot table is modified
    if (event.block.id == 'tfc:ice_pile' && !event.player.isCreativeMode()) {
        if (event.player.mainHandItem.hasTag('forge:tools/saws')) {
            event.block.set('minecraft:air')
            event.block.popItem('minecraft:ice')
            return
        } else if (
            event.player.mainHandItem.hasTag('forge:tools/hammers')
            || event.player.mainHandItem.hasTag('exnihilosequentia:hammer')
        ) {
            event.block.popItem('firmalife:ice_shavings')
            if (Math.random() > 0.5) event.block.popItem('firmalife:ice_shavings')
        }
    }
})