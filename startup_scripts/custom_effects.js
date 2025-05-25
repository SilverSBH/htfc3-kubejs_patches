// priority: 0

console.info('Registering KJS Effects...')

onEvent('mob_effect.registry', event => {
	event.create('fragile') // Creates effect called Fragile, meant to reduce max health as a kind of "anti health boost"
		.color(0x3b2a38) //sets color to sickly purple-green
		.harmful()
		.modifyAttribute('minecraft:generic.max_health', //happens only while effect is in place
		'f9272b4b-f820-4d63-9e24-0bbe4531044e',
		-0.2, // format for multiply_base is (1+[value])*base
		"multiply_base"
		)
	event.create('vulnerable') // Creates effect called Vulnerable, meant to be an Anti-Resistance
		.color(0x7d2e2f) //sets color to washed-out red
		.harmful()
})
onEvent('item.registry', event => {
	event.create('fragile')		.displayName('Fragile (Effect)').texture('kubejs:mob_effect/fragile').tooltip('Decreases maximum health by 20% per level')
	event.create('vulnerable')	.displayName('Vulnerable (Effect)').texture('kubejs:mob_effect/vulnerable').tooltip('Increases incoming damage by 50% per level')
})

onForgeEvent('net.minecraftforge.event.entity.living.LivingHurtEvent', event => { global.applyVulnerable(event) })
global.applyVulnerable = event => {
// This can be reloaded with '/kubejs reload startup_scripts' without having to restart the game!
// Event docs: https://lexxie.dev/forge/1.18.2/net/minecraftforge/event/entity/living/LivingHurtEvent.html
	let entity = event.getEntityLiving().asKJS()
	if (entity.potionEffects.isActive('kubejs:vulnerable')) {
		let effectLevel = entity.potionEffects.getActive('kubejs:vulnerable').amplifier
		let scaledDamage = event.amount * (1 + (effectLevel + 1) / 2)

		// If the base damage is not lethal but the scaled damage is, leave the target at very low health
		if (entity.health - event.amount > 0 && entity.health - scaledDamage <= 0) {
			event.setAmount(Math.max(entity.health - 0.25, event.amount))
		} else event.setAmount(scaledDamage)
	}
}