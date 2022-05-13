import { ObjectType, Perm } from "./enums"

export interface User {
	id: string
	email: string
	username: string
	first_name: string
	last_name: string
	role_id: string
	avatar_id: string
	faction_id: string
	faction: Faction | undefined
	verified: boolean
	mobile_number: string
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
	role: Role
	organisation?: Organisation
	online: boolean
	two_factor_authentication_activated: boolean
	two_factor_authentication_is_set: boolean
	has_recovery_code: boolean
	pass_2_fa: boolean
	public_address?: string
	facebook_id?: string
	google_id?: string
	twitch_id?: string
	twitter_id?: string
	discord_id?: string
	withdraw_lock: boolean
	mint_lock: boolean
	total_lock: boolean
}

export interface UserFaction {
	recruit_id: string
	sups_earned: number
	rank: string
	spectated_count: number

	// Faction specific
	faction_id: string
	theme: FactionTheme
	logo_url: string
	background_url: string
}

export interface FactionTheme {
	primary: string
	secondary: string
	background: string
}

export interface Faction {
	id: string
	label: string
	logo_blob_id: string
	background_url: string
	theme: FactionTheme
	description: string
}

export interface DetailedFaction {
	description: string
	velocity?: number
	share_percent: number
	recruit_number: number
	win_count: number
	loss_count: number
	kill_count: number
	death_count: number
	mvp: User
}

export interface UserActivity {
	id: string
	user: User
	action: string
	object_id: string
	object_slug: string
	object_name: string
	object_type: ObjectType
	created_at: Date
	old_data?: Object
	new_data?: Object
}

export interface Role {
	id: string
	name: string
	permissions: Perm[]
	tier: number
	reserved: boolean
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
}

export interface Organisation {
	id: string
	slug: string
	name: string
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
}

export interface Product {
	id: string
	slug: string
	name: string
	description: string
	image_id: string
	created_at: Date
	updated_at: Date
	deleted_at: Date | null
}

export interface Collection {
	id: string
	name: string
	slug: string
	image: string
	mint_contract: string
	stake_contract: string
	created_at: Date
	updated_at: Date
	frozen_at?: Date
	deleted_at?: Date
}

export interface Attribute {
	label: string
	value: string | number
	identifier?: string // indicates column name in the chassis table in gameserver db
	display_type?: string
	asset_hash?: string
	host_url?: string
}

export interface DepositTransaction {
	id: string
	user_id: string
	tx_hash: string
	amount: string
	status: "pending" | "confirmed"
	deleted_at?: Date
	updated_at: Date
	created_at: Date
}

export interface Transaction {
	id: string
	credit: string
	debit: string
	amount: string
	status: "failed" | "success"
	transaction_reference: string
	description: string
	reason?: string
	created_at: Date
	group_id?: string
	to: User
	from: User
}

export interface QueuedWarMachine {
	position: number
	war_machine_metadata: WarMachineMetadata
}

export interface WarMachineMetadata {
	asset_hash: string
	is_insured: boolean
	contract_reward: string
}

export interface ExchangeRates {
	eth_to_usd: number
	bnb_to_usd: number
	sup_to_usd: number
}

export type tokenName = "eth" | "usdc" | "bnb" | "busd"

export interface tokenSelect {
	name: tokenName
	networkName: string
	chainId: number
	tokenSrc: string
	chainSrc: string
	isNative: boolean
	contractAddr: string
	scanSite: string
	gasFee: number
}

export interface metamaskError {
	code: number
	message: string
	stack?: unknown
}

export type transferStateType = "waiting" | "error" | "confirm" | "none" | "unavailable"
