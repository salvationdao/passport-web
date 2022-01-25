import { ObjectType, Perm } from "./enums"

export interface User {
	id: string
	email: string
	username: string
	firstName: string
	lastName: string
	roleID: string
	avatarID: string
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

export interface Asset {
	tokenID: number
	userID: string
	name: string
	collection: string
	description: string
	externalURL: string
	image: string
	attributes: Attribute[]
	createdAt: Date
	updatedAt: Date
	frozenAt?: Date
	deletedAt?: Date
}

export interface Attribute {
	trait_type: string
	token_id: number
	value: string | number
}
