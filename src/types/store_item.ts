import { Attribute } from "./types"

export const StoreItemAttibutes = (storeItem: StoreItem): Attribute[] => {
	let result: Attribute[] = []
	result.push({ trait_type: "Model", value: storeItem.data.blueprint_chassis.model })
	result.push({ trait_type: "SubModel", value: storeItem.data.blueprint_chassis.skin })
	result.push({ trait_type: "Rarity", value: storeItem.data.template.tier })
	result.push({ trait_type: "Asset Type", value: "War Machine" })
	result.push({ trait_type: "Name", value: storeItem.data.template.label })
	result.push({ display_type: "number", trait_type: "Speed", value: storeItem.data.blueprint_chassis.speed })
	result.push({ display_type: "number", trait_type: "Max Structure Hit Points", value: storeItem.data.blueprint_chassis.max_hitpoints })
	result.push({ display_type: "number", trait_type: "Max Shield Hit Points", value: storeItem.data.blueprint_chassis.max_shield })
	result.push({ display_type: "number", trait_type: "Weapon Hardpoints", value: storeItem.data.blueprint_chassis.weapon_hardpoints })
	result.push({ display_type: "number", trait_type: "Turret Hardpoints", value: storeItem.data.blueprint_chassis.turret_hardpoints })
	result.push({ display_type: "number", trait_type: "Utility Slots", value: storeItem.data.blueprint_chassis.utility_slots })
	result.push({ display_type: "number", trait_type: "Shield Recharge Rate", value: storeItem.data.blueprint_chassis.shield_recharge_rate })
	if (storeItem.data.blueprint_weapons["0"]) result.push({ trait_type: "Weapon One", value: storeItem.data.blueprint_weapons["0"].label })
	if (storeItem.data.blueprint_weapons["1"]) result.push({ trait_type: "Weapon Two", value: storeItem.data.blueprint_weapons["1"].label })
	if (storeItem.data.blueprint_turrets["0"]) result.push({ trait_type: "Turret One", value: storeItem.data.blueprint_turrets["0"].label })
	if (storeItem.data.blueprint_turrets["1"]) result.push({ trait_type: "Turret Two", value: storeItem.data.blueprint_turrets["1"].label })
	if (storeItem.data.blueprint_modules["0"]) result.push({ trait_type: "Utility One", value: storeItem.data.blueprint_modules["0"].label })
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
	animation_url: string
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
