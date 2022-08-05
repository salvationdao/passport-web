import { QueryResponse } from "react-fetching-library"
import { AuthTypes } from "../containers/auth"
import { User } from "./types"

export interface Fingerprint {
	visitor_id: string
	os_cpu?: string
	platform?: string
	timezone?: string
	confidence: number
	user_agent: string
}

export interface CheckUserExist {
	public_address?: string
	email?: string
	facebook_id?: string
	google_token?: string
	twitter_id?: string
}

export interface RegisterResponse {
	user: User
	token: string
}

export interface ExternalCookieRequest {
	redirect_url?: string
}
interface BasicLoginRequest {
	fingerprint?: Fingerprint
	redirect_url?: string
	tenant?: string
}

export interface PasswordLoginRequest extends BasicLoginRequest {
	email: string
	password: string
	admin?: boolean
	session_id?: string
	auth_type: AuthTypes.Email
}

export interface EmailSignupRequest extends BasicLoginRequest {
	email: string
	password?: string
	session_id?: string
	auth_type: AuthTypes.Email
}

export interface EmailSignupVerifyRequest extends BasicLoginRequest {
	email: string
	code: string
}

export interface ForgotPasswordRequest extends BasicLoginRequest {
	email: string
	session_id?: string
}

export interface ResetPasswordRequest extends BasicLoginRequest {
	id: string
	token: string
	new_password: string
	session_id?: string
}

export interface ChangePasswordRequest extends BasicLoginRequest {
	user_id: string
	new_password: string
	password: string
	session_id?: string
}

export interface NewPasswordRequest extends BasicLoginRequest {
	user_id: string
	new_password: string
	session_id?: string
}

export interface GoogleLoginRequest extends BasicLoginRequest {
	google_token: string
	email: string
	username?: string
	session_id?: string
	auth_type: AuthTypes.Google
}

export interface FacebookLoginRequest extends BasicLoginRequest {
	facebook_id: string
	email: string
	username?: string
	session_id?: string
	auth_type: AuthTypes.Facebook
}

export interface TwoFactorAuthLoginRequest extends BasicLoginRequest {
	token?: string
	passcode?: string
	user_id?: string
	recovery_code?: string
	session_id?: string
}

export interface BasicLoginResponse {
	user: User
	token: string
	is_new: boolean
	redirect_token?: string
}

export interface PasswordLoginResponse extends BasicLoginResponse {}

export interface TokenLoginRequest extends BasicLoginRequest {
	token: string
	admin?: boolean
	username?: string
	session_id?: string
	twitch_extension_jwt: string | null
}

export interface TokenLoginResponse extends BasicLoginResponse {}

export interface GetNonceResponse {
	nonce: string
}

export interface WalletSignUpRequest {
	public_address: string
	username: string
	session_id?: string
	fingerprint?: Fingerprint
}

export interface WalletLoginRequest extends BasicLoginRequest {
	public_address: string
	signature: string
	session_id?: string
	fingerprint?: Fingerprint
	username?: string
	auth_type: AuthTypes.Wallet
}

export interface GoogleSignUpRequest {
	token: string
	username: string
	session_id?: string
	fingerprint?: Fingerprint
}

export interface SocialLoginRequest extends BasicLoginRequest {
	token: string
	session_id?: string
	username?: string
	service?: string
	fingerprint?: Fingerprint
}

export interface FacebookSignUpRequest {
	token: string
	username: string
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

export interface TwitchLoginRequest extends BasicLoginRequest {
	token: string
	website: boolean
	session_id?: string
	fingerprint?: Fingerprint
}

export interface TwitterLoginRequest extends BasicLoginRequest {
	oauth_token: string
	oauth_verifier: string
	session_id?: string
	fingerprint?: Fingerprint
}

export interface TwitterSignUpRequest extends BasicLoginRequest {
	twitter_id: string
	session_id?: string
	fingerprint?: Fingerprint
	auth_type: AuthTypes.Twitter
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

export interface DiscordLoginRequest extends BasicLoginRequest {
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

export type LoginNewUserResponse = WalletLoginRequest | GoogleLoginRequest | FacebookLoginRequest | EmailSignupRequest | TwitterSignUpRequest

export enum SignupRequestTypes {
	Wallet = "wallet_request",
	Google = "google_request",
	Facebook = "facebook_request",
	Email = "email_request",
	Twitter = "twitter_request",
}
export interface SignupNewUser {
	[SignupRequestTypes.Wallet]?: WalletLoginRequest
	[SignupRequestTypes.Google]?: GoogleLoginRequest
	[SignupRequestTypes.Facebook]?: FacebookLoginRequest
	[SignupRequestTypes.Email]?: EmailSignupRequest
	[SignupRequestTypes.Twitter]?: TwitterSignUpRequest

	username: string
	auth_type: AuthTypes
	fingerprint?: Fingerprint
	redirect_url?: string
}

export type SignUpRequest =
	| WalletSignUpRequest
	| GoogleSignUpRequest
	| FacebookSignUpRequest
	| TwitchSignUpRequest
	| TwitterSignUpRequest
	| DiscordSignUpRequest
	| SocialSignupRequest

export type LoginFunc = (action: LoginRequest) => Promise<QueryResponse<PasswordLoginResponse>>

export type SignupFunc = (action: SignUpRequest) => Promise<QueryResponse<RegisterResponse>>
