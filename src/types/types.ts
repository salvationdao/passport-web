import { ObjectType, Perm } from "./enums"

export interface User {
	id: string
	email: string
	username: string
	firstName: string
	lastName: string
	roleID: string
	avatarID: string
	factionID: string
	faction: Faction | undefined
	verified: boolean
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	role: Role
	organisation?: Organisation
	online: boolean
	twoFactorAuthenticationActivated: boolean
	twoFactorAuthenticationIsSet: boolean
	hasRecoveryCode: boolean
	pass2FA: boolean
	publicAddress?: string
	facebookID?: string
	googleID?: string
	twitchID?: string
	twitterID?: string
	discordID?: string
}

export interface UserFaction {
	recruitID: string
	supsEarned: number
	rank: string
	spectatedCount: number

	// Faction specific
	factionID: string
	theme: FactionTheme
	logoUrl: string
	backgroundUrl: string
}

export interface FactionTheme {
	primary: string
	secondary: string
	background: string
}

export interface Faction {
	id: string
	label: string
	logoBlobID: string
	backgroundUrl: string
	theme: FactionTheme
	description: string
}

export interface DetailedFaction {
	description: string
	velocity?: number
	sharePercent: number
	recruitNumber: number
	winCount: number
	lossCount: number
	killCount: number
	deathCount: number
	mvp: User
}

export interface UserActivity {
	id: string
	user: User
	action: string
	objectID: string
	objectSlug: string
	objectName: string
	objectType: ObjectType
	createdAt: Date
	oldData?: Object
	newData?: Object
}

export interface Role {
	id: string
	name: string
	permissions: Perm[]
	tier: number
	reserved: boolean
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export interface Organisation {
	id: string
	slug: string
	name: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export interface Product {
	id: string
	slug: string
	name: string
	description: string
	imageID: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
}

export interface Collection {
	id: string
	name: string
	slug: string
	image: string
	mintContract: string
	stakeContract: string
	createdAt: Date
	updatedAt: Date
	frozenAt?: Date
	deletedAt?: Date
}

// export interface NFTOwner {
// 	token_address: string
// 	token_id: string
// 	contract_type: string
// 	owner_of: string
// 	block_number: string
// 	block_number_minted: string
// 	token_uri: string
// 	metadata: string
// 	synced_at: string
// 	amount: string
// 	name: string
// 	symbol: string
// }

export interface Asset {
	hash: string
	// mintContract: string
	// stakeContract: string
	externalTokenID: number
	userID: string
	username: string
	name: string
	collection: Collection
	game_object?: any
	description: string
	externalURL: string
	image: string
	animation_url: string
	attributes: Attribute[]
	additional_metadata?: any
	createdAt: Date
	updatedAt: Date
	frozenAt?: Date
	lockedByID?: string
	deletedAt?: Date
	mintingSignature?: string
	txHistory: any[]
	minted: boolean
}

export interface Attribute {
	display_type?: "number"
	trait_type: string
	assetHash?: string
	value: string | number
}

export interface StoreItem {
	ID: string
	name: string
	factionID: string
	faction?: Faction
	collectionID: string
	collection: Collection
	description: string
	image: string
	animation_url: string
	attributes: Attribute[]
	usdCentCost: number
	amountSold: number
	supCost: string
	amountAvailable: number
	soldAfter: Date
	soldBefore: Date
	deletedAt: Date
	createdAt: Date
	updatedAt: Date
}

export interface Transaction {
	id: string
	credit: string
	debit: string
	amount: string
	status: "failed" | "success"
	transactionReference: string
	description: string
	reason?: string
	created_at: Date
	groupID?: string
	to: User
	from: User
}

export interface QueuedWarMachine {
	position: number
	warMachineMetadata: WarMachineMetadata
}

export interface WarMachineMetadata {
	assetHash: string
	isInsured: boolean
	contractReward: string
}

export enum Rarity {
	Common,
	Uncommon,
	Rare,
	Epic,
	Legendary,
}

export interface ExchangeRates {
	ETHtoUSD: number
	BNBtoUSD: number
	SUPtoUSD: number
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
