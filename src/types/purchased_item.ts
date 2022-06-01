export enum OnChainStatus {
	MINTABLE = "MINTABLE",
	STAKABLE = "STAKABLE",
	UNSTAKABLE = "UNSTAKABLE",
	UNSTAKABLE_OLD = "UNSTAKABLE_OLD",
}

export interface UserAsset {
	id: string
	collection_id: string
	token_id: number
	tier: string
	hash: string
	owner_id: string
	attributes: Attribute721[]
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
	locked_to_service_name?: string
	deleted_at?: Date
	data_refreshed_at: Date
	updated_at: Date
	created_at: Date
}

export interface User1155Asset {
	id: string
	owner_id: string
	collection_id: string
	collection_slug: string
	external_token_id: number
	mint_contract: string | undefined
	count: number
	label: string
	description: string
	image_url: string
	animation_url: string
	keycard_group: string
	attributes: Attribute1155[]
	service_id: string | undefined
	created_at: Date
}

export interface User1155AssetView {
	id: string
	owner_id: string
	external_token_id: number
	count: number
	label: string
	description: string
	image_url: string
	animation_url: string | undefined
	attributes: Attribute1155
	service_name_locked_in: string | undefined
}

interface Attribute721 {
	display_type?: "boost_number" | "boost_percentage" | "date" | "number"
	trait_type: string
	asset_hash?: string
	value: string | number
}

interface Attribute1155 {
	trait_type: string
	syndicate: string
}
