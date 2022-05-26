export enum OnChainStatus {
	MINTABLE = "MINTABLE",
	STAKABLE = "STAKABLE",
	UNSTAKABLE = "UNSTAKABLE",
}

export interface UserAsset {
	id: string
	collection_id: string
	token_id: number
	tier: string
	hash: string
	owner_id: string
	attributes: Attribute2[]
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

interface Attribute2 {
	display_type?: "boost_number" | "boost_percentage" | "date" | "number"
	trait_type: string
	asset_hash?: string
	value: string | number
}
