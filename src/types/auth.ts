import { User } from "./types"

export interface RegisterResponse {
	user: User
	token: string
}

export interface PasswordLoginRequest {
	email: string
	password: string
	admin?: boolean
	session_id?: string
}

export interface PasswordLoginResponse {
	user: User
	token: string
	is_new: boolean
}

export interface TokenLoginRequest {
	token: string
	admin?: boolean
	username?: string
	session_id?: string
	twitch_extension_jwt: string | null
}

export interface TokenLoginResponse {
	user: User
}

export interface GetNonceResponse {
	nonce: string
}

export interface WalletSignUpRequest {
	public_address: string
	username: string
	session_id?: string
}

export interface WalletLoginRequest {
	public_address: string
	signature: string
	session_id?: string
}

export interface GoogleSignUpRequest {
	token: string
	username: string
	session_id?: string
}

export interface GoogleLoginRequest {
	token: string
	session_id?: string
}

export interface FacebookSignUpRequest {
	token: string
	username: string
	session_id?: string
}

export interface FacebookLoginRequest {
	token: string
	session_id?: string
}

export interface TwitchSignUpRequest {
	token: string
	username: string
	website: boolean
	session_id?: string
}

export interface TwitchLoginRequest {
	token: string
	website: boolean
	session_id?: string
}

export interface TwitterSignUpRequest {
	oauth_token: string
	oauth_verifier: string
	username: string
	session_id?: string
}

export interface TwitterLoginRequest {
	oauth_token: string
	oauth_verifier: string
	session_id?: string
}

export interface DiscordSignUpRequest {
	code: string
	username?: string
	session_id?: string
	redirect_uri: string
}

export interface DiscordLoginRequest {
	code: string
	session_id?: string
	redirect_uri: string
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
	redirect_uri: string
}

export interface AddTwitterRequest {
	oauth_token: string
	oauth_verifier: string
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

export const NilUUID = "00000000-0000-0000-0000-000000000000"
