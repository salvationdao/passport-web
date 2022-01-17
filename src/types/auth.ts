import { User } from "./types";

export interface RegisterResponse {
	user: User
	token: string
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

export interface TwitchLoginRequest {
	token: string
	username?: string
	website?: boolean
}

export interface AddServiceRequest {
	token: string
}

export interface AddServiceResponse {
	user: User
}

export interface RemoveServiceRequest {
	id: string
	username: string
}

export interface RemoveServiceResponse {
	user: User
}

export interface AddTwitchRequest {
	token: string
	redirectURI: string
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
