import { Perm } from "./enums"
import { User1155Asset } from "./purchased_item"

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
	has_password: boolean
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
	auth_type: undefined
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

export interface Collection {
	id: string
	name: string
	slug: string
	// image: string
	mint_contract: string
	stake_contract: string
	staking_contract_old: string
	created_at: Date
	updated_at: Date
	// frozen_at?: Date
	deleted_at?: Date
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

export type transferStateType = "waiting" | "error" | "confirm" | "none" | "unavailable"

export interface Collections1155 {
	collections: Collection1155[]
}

export interface Collection1155 {
	name: string
	description: string
	slug: string
	mint_contract: string | undefined
	logo_url: string | undefined
	background_url: string | undefined
	token_ids: number[]
	transfer_address: string | undefined
}

export interface AvantUserBalance {
	owner_address: string
	balances: AvantBalances[]
}

export interface AvantBalances {
	token_id: number
	value: string
	value_int: string
	value_decimals: string
}

export interface Asset1155Json {
	name: string
	description: string
	image: string
	animation_url: string | undefined
	attributes: User1155Asset[]
}

export interface AssetDepositTransaction {
	username: string
	tx_hash: string
	amount: number
	token_id: number
	collection_name: string
	status: "pending" | "confirmed"
	deleted_at?: Date
	created_at: Date
}
