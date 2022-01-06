import { User } from "./types"

export interface RegisterRequest {
	username: string
	email: string
	password: string
}

export interface RegisterResponse {
	id: string
	account_book_id: string
	username: string
	email: string
	verified: boolean
}

export interface PasswordLoginRequest {
	email: string
	password: string
	admin?: boolean
}

export interface PasswordLoginResponse {
	user: User
	token: string
}

export interface TokenLoginRequest {
	token: string
	admin?: boolean
	username?: string
}

export interface TokenLoginResponse {
	user: User
}

export interface GetNonceResponse {
	nonce: string
}

export interface WalletLoginRequest {
	publicAddress: string
	signature: string
	admin?: boolean
	username?: string
}

export interface WalletLoginResponse {
	user: User
	token: string
}

export interface SendVerifyEmailRequest {
	email: string
	forgotPassword?: boolean
	newAccount?: boolean
}

export interface SendVerifyEmailResponse {
	success: boolean
}

export interface VerifyAccountRequest {
	token: string
	forgotPassword?: boolean
}

export interface VerifyAccountResponse {
	token: string
	user: User
}
