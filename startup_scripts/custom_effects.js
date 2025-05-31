onEvent('mob_effect.registry', event => {
	event.create('fragile') // Fragile effect, meant to be an anti-resistance
		.color(0x7d2e2f) // #7d2e2f
		.harmful()
	event.create('energized') // Pina colada effect, meant to give immunity to overburdened and exhausted
		.beneficial()
		.color(0x86dae3) // #86dae3
})
onEvent('item.registry', event => {
	event.create('fragile')		.displayName('Fragile (Effect)').texture('kubejs:mob_effect/fragile').tooltip('Increases incoming damage by 50% per level')
	event.create('energized')	.displayName('Energized (Effect)').texture('kubejs:mob_effect/energized').tooltip('Grants immunity to Exhausted and Overburdened')
})

// The following are forge event hooks to provide logic for some custom effects.
// These can be reloaded with '/kubejs reload startup_scripts' without having to restart the game!

onForgeEvent('net.minecraftforge.event.entity.living.LivingHurtEvent', event => { global.applyFragile(event) })
// Event docs: https://lexxie.dev/forge/1.18.2/net/minecraftforge/event/entity/living/LivingHurtEvent.html
global.applyFragile = event => {
	let entity = event.getEntityLiving().asKJS()
	if (entity.potionEffects.isActive('kubejs:fragile')) {
		let effectLevel = entity.potionEffects.getActive('kubejs:fragile').amplifier
		let scaledDamage = event.amount * (1 + (effectLevel + 1) / 2)

		// If the base damage is not lethal but the scaled damage is, leave the target at very low health
		if (entity.health - event.amount > 0 && entity.health - scaledDamage <= 0) {
			event.setAmount(Math.max(entity.health - 0.25, event.amount))
		} else event.setAmount(scaledDamage)
	}
}

onForgeEvent('net.minecraftforge.event.entity.living.PotionEvent$PotionApplicableEvent', event => { global.applyEnergized(event) })
// Event docs: https://lexxie.dev/forge/1.18.2/net/minecraftforge/event/entity/living/PotionEvent.PotionApplicableEvent.html
global.applyEnergized = event => {
	let entity = event.getEntityLiving().asKJS()
	let effectName = event.getPotionEffect().getDescriptionId()
	
	if (entity.potionEffects.isActive('kubejs:energized') &&
	(effectName == 'effect.tfc.exhausted' || effectName == 'effect.tfc.overburdened')) {
		event.setResult('deny')
	}
}