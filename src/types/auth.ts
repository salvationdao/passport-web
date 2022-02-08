import { User } from "./types"

export interface RegisterResponse {
	user: User
	token: string
}

export interface PasswordLoginRequest {
	email: string
	password: string
	admin?: boolean
	sessionID?: string
}

export interface PasswordLoginResponse {
	user: User
	token: string
	isNew: boolean
}

export interface TokenLoginRequest {
	token: string
	admin?: boolean
	username?: string
	sessionID?: string
	twitchExtensionJWT: string | null
}

export interface TokenLoginResponse {
	user: User
}

export interface GetNonceResponse {
	nonce: string
}

export interface WalletSignUpRequest {
	publicAddress: string
	username: string
	sessionID?: string
}

export interface WalletLoginRequest {
	publicAddress: string
	signature: string
	sessionID?: string
}

export interface GoogleSignUpRequest {
	token: string
	username: string
	sessionID?: string
}

export interface GoogleLoginRequest {
	token: string
	sessionID?: string
}

export interface FacebookSignUpRequest {
	token: string
	username: string
	sessionID?: string
}

export interface FacebookLoginRequest {
	token: string
	sessionID?: string
}

export interface TwitchSignUpRequest {
	token: string
	username: string
	website: boolean
	sessionID?: string
}

export interface TwitchLoginRequest {
	token: string
	website: boolean
	sessionID?: string
}

export interface TwitterSignUpRequest {
	oauthToken: string
	oauthVerifier: string
	username: string
	sessionID?: string
}

export interface TwitterLoginRequest {
	oauthToken: string
	oauthVerifier: string
	sessionID?: string
}

export interface DiscordSignUpRequest {
	code: string
	username?: string
	sessionID?: string
	redirectURI: string
}

export interface DiscordLoginRequest {
	code: string
	sessionID?: string
	redirectURI: string
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
	website: boolean
}

export interface AddDiscordRequest {
	code: string
	redirectURI: string
}

export interface AddTwitterRequest {
	oauthToken: string
	oauthVerifier: string
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
