import { Attribute } from "./types"

export const PurchasedItemAttributes = (purchasedItem: PurchasedItem): Attribute[] => {
	let result: Attribute[] = []
	result.push({ label: "Asset Type", value: "War Machine" })
	result.push({ label: "Model", value: purchasedItem.data.chassis.model, identifier: "model" })
	result.push({ label: "SubModel", value: purchasedItem.data.chassis.skin, identifier: "skin" })
	result.push({ label: "Rarity", value: purchasedItem.data.mech.tier, identifier: "tier" })
	result.push({ label: "Name", value: purchasedItem.data.mech.name, identifier: "name" })
	result.push({ display_type: "number", label: "Speed", value: purchasedItem.data.chassis.speed, identifier: "speed" })
	result.push({
		display_type: "number",
		label: "Max Structure Hit Points",
		value: purchasedItem.data.chassis.max_hitpoints,
		identifier: "max_hitpoints",
	})
	result.push({ display_type: "number", label: "Max Shield Hit Points", value: purchasedItem.data.chassis.max_shield, identifier: "max_shield" })
	result.push({
		display_type: "number",
		label: "Weapon Hardpoints",
		value: purchasedItem.data.chassis.weapon_hardpoints,
		identifier: "weapon_hardpoints",
	})
	result.push({
		display_type: "number",
		label: "Turret Hardpoints",
		value: purchasedItem.data.chassis.turret_hardpoints,
		identifier: "turret_hardpoints",
	})
	result.push({ display_type: "number", label: "Utility Slots", value: purchasedItem.data.chassis.utility_slots, identifier: "utility_slots" })
	result.push({
		display_type: "number",
		label: "Shield Recharge Rate",
		value: purchasedItem.data.chassis.shield_recharge_rate,
		identifier: "shield_recharge_rate",
	})
	if (purchasedItem.data.weapons && purchasedItem.data.weapons["0"])
		result.push({ label: "Weapon One", value: purchasedItem.data.weapons["0"].label })
	if (purchasedItem.data.weapons && purchasedItem.data.weapons["1"])
		result.push({ label: "Weapon Two", value: purchasedItem.data.weapons["1"].label })
	if (purchasedItem.data.turrets && purchasedItem.data.turrets["0"])
		result.push({ label: "Turret One", value: purchasedItem.data.turrets["0"].label })
	if (purchasedItem.data.turrets && purchasedItem.data.turrets["1"])
		result.push({ label: "Turret Two", value: purchasedItem.data.turrets["1"].label })
	if (purchasedItem.data.modules && purchasedItem.data.modules["0"])
		result.push({ label: "Utility One", value: purchasedItem.data.modules["0"].label })
	return result
}

export interface PurchasedItemResponse {
	collection_slug: string
	purchased_item: PurchasedItem
	owner_username: string
	host_url: string
}
export interface ItemOnchainTransaction {}
export interface PurchasedItem {
	id: string
	collection_id: string
	store_item_id: string
	external_token_id: number
	is_default: boolean
	tier: string
	hash: string
	owner_id: string
	data: MechContainer
	on_chain_status: OnChainStatus
	unlocked_at: Date
	minted_at: Date
	deleted_at: Date
	refreshes_at: Date
	updated_at: Date
	created_at: Date
}

export enum OnChainStatus {
	MINTABLE = "MINTABLE",
	STAKABLE = "STAKABLE",
	UNSTAKABLE = "UNSTAKABLE",
}

export interface MechContainer {
	mech: Mech
	chassis: Chassis
	weapons: { [key: string]: Weapon }
	turrets?: { [key: string]: Weapon }
	modules: { [key: string]: Module }
}

export interface Mech {
	id: string
	owner_id: string
	template_id: string
	chassis_id: string
	external_token_id: number
	tier: string
	is_default: boolean
	image_url: string
	card_animation_url: string
	avatar_url: string
	large_image_url: string
	animation_url: string
	hash: string
	name: string
	label: string
	slug: string
	asset_type: string
	deleted_at?: string
	updated_at: string
	created_at: string
}

export interface AssetStatPercentageResponse {
	total: number
	percentile: number
	percentage: number
}

export interface Chassis {
	id: string
	brand_id: string
	label: string
	model: string
	skin: string
	slug: string
	shield_recharge_rate: number
	health_remaining: number
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

export interface Weapon {
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
export interface Module {
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

export interface UserAsset {
	id: string
	collection_id: string
	token_id: number
	tier: string
	hash: string
	owner_id: string
	attributes: Attribute2
	name: string
	image_url?: string
	external_url?: string
	description?: string
	background_color?: string
	animation_url?: string
	youtube_url?: string
	card_animation_url?: string
	avatar_url?: string
	large_image_url?: string
	unlocked_at: Date
	minted_at?: Date
	on_chain_status: string
	xsyn_locked?: boolean
	deleted_at?: Date
	data_refreshed_at: Date
	updated_at: Date
	created_at: Date
}

interface Attribute2 {
	display_type?: "boost_number" | "boost_percentage" | "date"
	trait_type: string
	asset_hash?: string
	value: string | number
}
