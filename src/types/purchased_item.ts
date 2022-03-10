import { Attribute } from "./types"

export const PurchasedItemAttributes = (purchasedItem: PurchasedItem): Attribute[] => {
	let result: Attribute[] = []
	result.push({ trait_type: "Model", value: purchasedItem.data.chassis.model })
	result.push({ trait_type: "SubModel", value: purchasedItem.data.chassis.skin })
	result.push({ trait_type: "Rarity", value: purchasedItem.data.mech.tier })
	result.push({ trait_type: "Asset Type", value: "War Machine" })
	result.push({ trait_type: "Name", value: purchasedItem.data.mech.name })
	result.push({ display_type: "number", trait_type: "Speed", value: purchasedItem.data.chassis.speed })
	result.push({ display_type: "number", trait_type: "Max Structure Hit Points", value: purchasedItem.data.chassis.max_hitpoints })
	result.push({ display_type: "number", trait_type: "Max Shield Hit Points", value: purchasedItem.data.chassis.max_shield })
	result.push({ display_type: "number", trait_type: "Weapon Hardpoints", value: purchasedItem.data.chassis.weapon_hardpoints })
	result.push({ display_type: "number", trait_type: "Turret Hardpoints", value: purchasedItem.data.chassis.turret_hardpoints })
	result.push({ display_type: "number", trait_type: "Utility Slots", value: purchasedItem.data.chassis.utility_slots })
	result.push({ display_type: "number", trait_type: "Shield Recharge Rate", value: purchasedItem.data.chassis.shield_recharge_rate })
	if (purchasedItem.data.weapons["0"]) result.push({ trait_type: "Weapon One", value: purchasedItem.data.weapons["0"].label })
	if (purchasedItem.data.weapons["1"]) result.push({ trait_type: "Weapon Two", value: purchasedItem.data.weapons["1"].label })
	if (purchasedItem.data.turrets && purchasedItem.data.turrets["0"]) result.push({ trait_type: "Turret One", value: purchasedItem.data.turrets["0"].label })
	if (purchasedItem.data.turrets && purchasedItem.data.turrets["1"]) result.push({ trait_type: "Turret Two", value: purchasedItem.data.turrets["1"].label })
	if (purchasedItem.data.modules["0"]) result.push({ trait_type: "Utility One", value: purchasedItem.data.modules["0"].label })
	return result
}

export interface PurchasedItemResponse {
	collection_slug: string
	purchased_item: PurchasedItem
	owner_username: string
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
	animation_url: string
	avatar_url: string
	hash: string
	name: string
	label: string
	slug: string
	asset_type: string
	deleted_at?: string
	updated_at: string
	created_at: string
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

const exampleAttributes = [
	{
		value: "Zaibatsu",
		trait_type: "Brand",
	},
	{
		value: "Tenshi Mk1",
		trait_type: "Model",
	},
	{
		value: "Gumdan",
		trait_type: "SubModel",
	},
	{
		value: "Ultra Rare",
		trait_type: "Rarity",
	},
	{
		value: "War Machine",
		trait_type: "Asset Type",
	},
	{
		value: 1000,
		trait_type: "Max Structure Hit Points",
		display_type: "number",
	},
	{
		value: 1000,
		trait_type: "Max Shield Hit Points",
		display_type: "number",
	},
	{
		value: "",
		trait_type: "Name",
	},
	{
		value: 2500,
		trait_type: "Speed",
		display_type: "number",
	},
	{
		value: 2,
		trait_type: "Weapon Hardpoints",
		display_type: "number",
	},
	{
		value: 2,
		trait_type: "Turret Hardpoints",
		display_type: "number",
	},
	{
		value: 1,
		trait_type: "Utility Slots",
		display_type: "number",
	},
	{
		value: "Sniper Rifle",
		trait_type: "Weapon One",
	},
	{
		value: "Laser Sword",
		trait_type: "Weapon Two",
	},
	{
		value: "Rocket Pod",
		trait_type: "Turret One",
	},
	{
		value: "Rocket Pod",
		trait_type: "Turret Two",
	},
	{
		value: "Shield",
		trait_type: "Utility One",
	},
	{
		value: 110,
		trait_type: "Shield Recharge Rate",
		display_type: "number",
	},
]
