import { User } from "./types"
import { QueryResponse } from "react-fetching-library"

export interface Fingerprint {
	visitor_id: string
	os_cpu?: string
	platform?: string
	timezone?: string
	confidence: number
	user_agent: string
}

export interface RegisterResponse {
	user: User
	token: string
}

export interface PasswordLoginRequest {
	email: string
	password: string
	admin?: boolean
	session_id?: string
	fingerprint?: Fingerprint
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
	fingerprint?: Fingerprint
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
	fingerprint?: Fingerprint
}

export interface WalletLoginRequest {
	public_address: string
	signature: string
	session_id?: string
	fingerprint?: Fingerprint
}

export interface GoogleSignUpRequest {
	token: string
	username: string
	session_id?: string
	fingerprint?: Fingerprint
}

export interface SocialLoginRequest {
	token: string
	session_id?: string
	username?: string
	service: string
	fingerprint?: Fingerprint
}

export interface GoogleLoginRequest {
	token: string
	session_id?: string
	fingerprint?: Fingerprint
}

export interface FacebookSignUpRequest {
	token: string
	username: string
	session_id?: string
	fingerprint?: Fingerprint
}

export type LoginRequest =
	| PasswordLoginRequest
	| TokenLoginRequest
	| WalletLoginRequest
	| GoogleLoginRequest
	| FacebookLoginRequest
	| TwitchLoginRequest
	| TwitterLoginRequest
	| DiscordLoginRequest
	| SocialLoginRequest
export type SignUpRequest =
	| WalletSignUpRequest
	| GoogleSignUpRequest
	| FacebookSignUpRequest
	| TwitchSignUpRequest
	| TwitterSignUpRequest
	| DiscordSignUpRequest
	| SocialSignupRequest

export interface SocialProps {
	login: LoginFunc
	signup: SignupFunc
	fingerprint?: Fingerprint
	sessionId: string
	setUser: (user?: User) => void
	setToken: (token: string) => void
	clear: () => void
	setAuthorised: (authorized: boolean) => void
}

export type LoginFunc = (action: LoginRequest) => Promise<QueryResponse<PasswordLoginResponse>>
export type SignupFunc = (action: SignUpRequest) => Promise<QueryResponse<RegisterResponse>>

export interface FacebookLoginRequest {
	token: string
	session_id?: string
	fingerprint?: Fingerprint
}

export interface TwitchSignUpRequest {
	token: string
	username: string
	website: boolean
	session_id?: string
	fingerprint?: Fingerprint
}

export interface TwitchLoginRequest {
	token: string
	website: boolean
	session_id?: string
	fingerprint?: Fingerprint
}

export interface TwitterSignUpRequest {
	oauth_token: string
	oauth_verifier: string
	username: string
	session_id?: string
	fingerprint?: Fingerprint
}

export interface TwitterLoginRequest {
	oauth_token: string
	oauth_verifier: string
	session_id?: string
	fingerprint?: Fingerprint
}

export interface DiscordSignUpRequest {
	code: string
	username?: string
	session_id?: string
	redirect_uri: string
	fingerprint?: Fingerprint
}

export interface SocialSignupRequest {
	code: string
	username?: string
	session_id?: string
	redirect_uri: string
	fingerprint?: Fingerprint
	service: string
}

export interface DiscordLoginRequest {
	code: string
	session_id?: string
	redirect_uri: string
	fingerprint?: Fingerprint
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
