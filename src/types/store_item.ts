import { Attribute } from "./types"

export const StoreItemAttibutes = (storeItem: StoreItem): Attribute[] => {
	let result: Attribute[] = []
	result.push({ label: "Asset Type", value: "War Machine" })
	result.push({ label: "Model", value: storeItem.data.blueprint_chassis.model, identifier: "model" })
	result.push({ label: "SubModel", value: storeItem.data.blueprint_chassis.skin, identifier: "skin" })
	result.push({ label: "Rarity", value: storeItem.data.template.tier, identifier: "tier" })
	result.push({ label: "Name", value: storeItem.data.template.label, identifier: "label" })
	result.push({ display_type: "number", label: "Speed", value: storeItem.data.blueprint_chassis.speed, identifier: "speed" })
	result.push({
		display_type: "number",
		label: "Max Structure Hit Points",
		value: storeItem.data.blueprint_chassis.max_hitpoints,
		identifier: "max_hitpoints",
	})
	result.push({ display_type: "number", label: "Max Shield Hit Points", value: storeItem.data.blueprint_chassis.max_shield, identifier: "max_shield" })
	result.push({
		display_type: "number",
		label: "Weapon Hardpoints",
		value: storeItem.data.blueprint_chassis.weapon_hardpoints,
		identifier: "weapon_hardpoints",
	})
	result.push({
		display_type: "number",
		label: "Turret Hardpoints",
		value: storeItem.data.blueprint_chassis.turret_hardpoints,
		identifier: "turret_hardpoints",
	})
	result.push({ display_type: "number", label: "Utility Slots", value: storeItem.data.blueprint_chassis.utility_slots, identifier: "utility_slots" })
	result.push({
		display_type: "number",
		label: "Shield Recharge Rate",
		value: storeItem.data.blueprint_chassis.shield_recharge_rate,
		identifier: "shield_recharge_rate",
	})
	if (storeItem.data.blueprint_weapons["0"]) result.push({ label: "Weapon One", value: storeItem.data.blueprint_weapons["0"].label })
	if (storeItem.data.blueprint_weapons["1"]) result.push({ label: "Weapon Two", value: storeItem.data.blueprint_weapons["1"].label })
	if (storeItem.data.blueprint_turrets["0"]) result.push({ label: "Turret One", value: storeItem.data.blueprint_turrets["0"].label })
	if (storeItem.data.blueprint_turrets["1"]) result.push({ label: "Turret Two", value: storeItem.data.blueprint_turrets["1"].label })
	if (storeItem.data.blueprint_modules["0"]) result.push({ label: "Utility One", value: storeItem.data.blueprint_modules["0"].label })
	return result
}
export interface StoreItemResponse {
	item: StoreItem
	price_in_sups: string
}
export interface StoreItem {
	amount_available: number
	amount_sold: number
	collection_id: string
	created_at: string
	deleted_at: null
	faction_id: string
	id: string
	is_default: false
	refreshes_at: string
	restriction_group: string
	tier: string
	updated_at: string
	usd_cent_cost: number
	data: TemplateContainer
}

export interface TemplateContainer {
	template: Template
	blueprint_chassis: BlueprintChassis
	blueprint_weapons: { [key: string]: BlueprintWeapon }
	blueprint_turrets: { [key: string]: BlueprintWeapon }
	blueprint_modules: { [key: string]: BlueprintModule }
}
export interface Template {
	id: string
	blueprint_chassis_id: string
	faction_id: string
	tier: string
	label: string
	slug: string
	is_default: boolean
	image_url: string
	card_animation_url: string
	avatar_url: string
	deleted_at?: string
	asset_type: string
	updated_at: string
	created_at: string
}
export interface BlueprintChassis {
	id: string
	brand_id: string
	label: string
	slug: string
	model: string
	skin: string
	shield_recharge_rate: number
	weapon_hardpoints: number
	turret_hardpoints: number
	utility_slots: number
	speed: number
	max_hitpoints: number
	max_shield: number
	deleted_at?: string
	updated_at: string
	created_at: string
}
export interface BlueprintWeapon {
	id: string
	brand_id?: string
	label: string
	slug: string
	damage: number
	weapon_type: string
	deleted_at?: string
	updated_at: string
	created_at: string
}
export interface BlueprintModule {
	id: string
	brand_id?: string
	slug: string
	label: string
	hitpoint_modifier: number
	shield_modifier: number
	deleted_at?: string
	updated_at: string
	created_at: string
}
