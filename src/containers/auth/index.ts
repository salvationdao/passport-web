import { useCallback, useEffect, useState } from "react"
import { Action, QueryResponse, useMutation, useQuery } from "react-fetching-library"
import { useHistory } from "react-router-dom"
import { createContainer } from "unstated-next"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { metamaskErrorHandling } from "../../helpers/web3"
import { usePassportSubscriptionUser } from "../../hooks/usePassport"
import keys from "../../keys"
import {
	ChangePasswordRequest,
	EmailLoginRequest,
	EmailSignupVerifyRequest,
	FacebookLoginRequest,
	ForgotPasswordRequest,
	GoogleLoginRequest,
	LoginNewUserResponse,
	LoginOldUserResponse,
	NewPasswordRequest,
	PasswordLoginRequest,
	SignupNewUser,
	TwoFactorAuthLoginRequest,
	VerifyAccountResponse,
	WalletLoginRequest,
} from "../../types/auth"
import { Perm } from "../../types/enums"
import { User } from "../../types/types"
import { useFingerprint } from "../fingerprint"
import { useWeb3 } from "../web3"
import { useSubscription } from "../ws/useSubscription"
import { ResetPasswordRequest } from "./../../types/auth"

export enum AuthTypes {
	Wallet = "wallet",
	Email = "email",
	Hangar = "hangar",
	Website = "website",
	Cookie = "cookie",
	Token = "token",
	Signup = "signup",
	Forgot = "forgot",
	Reset = "reset",
	ChangePassword = "change_password",
	NewPassword = "new_password",
	Google = "google",
	Facebook = "facebook",
	Twitter = "twitter",
	TFA = "tfa",
	Null = "null",
}

export enum VerificationType {
	EmailVerification,
	ForgotPassword,
}

const signupAction = (formValues: SignupNewUser): Action => ({
	method: "POST",
	endpoint: "/auth/signup",
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const loginAction = (formValues: WalletLoginRequest | PasswordLoginRequest): Action<LoginOldUserResponse | LoginNewUserResponse> => ({
	method: "POST",
	endpoint: `/auth/${formValues.auth_type}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const forgotPasswordAction = (formValues: ForgotPasswordRequest): Action<string> => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.Forgot}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const resetPasswordAction = (formValues: ResetPasswordRequest): Action<LoginOldUserResponse | EmailLoginRequest> => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.Reset}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const changePasswordAction = (formValues: ChangePasswordRequest): Action<LoginOldUserResponse> => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.ChangePassword}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const newPasswordAction = (formValues: NewPasswordRequest): Action<LoginOldUserResponse> => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.NewPassword}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const googleLoginAction = (formValues: GoogleLoginRequest): Action<LoginOldUserResponse | LoginNewUserResponse> => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.Google}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const facebookLoginAction = (formValues: FacebookLoginRequest): Action<LoginOldUserResponse | LoginNewUserResponse> => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.Facebook}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const twoFactorAuthLoginAction = (formValues: TwoFactorAuthLoginRequest): Action<LoginOldUserResponse> => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.TFA}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const verifyCodeAction = (formValues: { token: string; code: string }): Action<{ success: boolean }> => ({
	method: "POST",
	endpoint: "/auth/verify_code",
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const emailSignupVerifyAction = (formValues: EmailSignupVerifyRequest): Action<{ token: string }> => ({
	method: "POST",
	endpoint: "/auth/email_signup",
	responseType: "json",
	credentials: "include",
	body: formValues,
})

/**
 * A Container that handles Authorisation
 */
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)

export const AuthContainer = createContainer(() => {
	const history = useHistory()
	const urlParams = new URLSearchParams(history.location.search)

	const { fingerprint } = useFingerprint()
	const { sign, signWalletConnect, account, connect, wcProvider, wcSignature, wcNonce, setUserForWeb3 } = useWeb3()
	const [user, _setUser] = useState<User>()

	const setUser = (user?: User) => {
		_setUser(user)
	}

	const [recheckAuth, setRecheckAuth] = useState(false)
	const [authorised, setAuthorised] = useState(false)
	const [loading, setLoading] = useState(true) // wait for loading current login state to complete first
	const [verifying, setVerifying] = useState(false)
	const [verifyCompleteType, setVerifyCompleteType] = useState<VerificationType>()
	const [showSimulation, setShowSimulation] = useState(false)

	// Signup
	const [signupRequest, setSignupRequest] = useState<LoginNewUserResponse | undefined>()
	const [emailCode, setEmailCode] = useState<{ token?: string; email: string } | undefined>()
	const [captchaToken, setCaptchaToken] = useState<string>()

	const externalOrigin = urlParams.get("origin")
	const redirectURL = urlParams.get("redirectURL")

	const [sessionId, setSessionID] = useState("")

	const clear = useCallback(() => {
		console.info("clearing local storage")
		console.trace()
		setUser(undefined)
	}, [])
	const { loading: emailSignupLoading, mutate: emailSignup } = useMutation(emailSignupVerifyAction)
	const { loading: loginLoading, mutate: login, error: loginError } = useMutation(loginAction)
	const { loading: signupLoading, mutate: signup } = useMutation(signupAction)
	const { loading: forgotPasswordLoading, mutate: forgot } = useMutation(forgotPasswordAction)
	const { loading: resetPasswordLoading, mutate: reset } = useMutation(resetPasswordAction)
	const { loading: changePasswordLoading, mutate: change } = useMutation(changePasswordAction)
	const { loading: newPasswordLoading, mutate: newPass } = useMutation(newPasswordAction)
	const { loading: googleLoginLoading, mutate: google } = useMutation(googleLoginAction)
	const { loading: facebookLoginLoading, mutate: facebook } = useMutation(facebookLoginAction)
	const { loading: twoFactorLoginLoading, mutate: twoFactorAuth } = useMutation(twoFactorAuthLoginAction)
	const { loading: verifyCodeLoading, mutate: verifyCode } = useMutation(verifyCodeAction)

	// useQueries
	const { query: logoutQuery } = useQuery(
		{
			method: "GET",
			endpoint: `/auth/logout`,
			responseType: "json",
			credentials: "include",
		},
		false,
	)

	const { query: authCheck } = useQuery<LoginOldUserResponse>({
		method: "GET",
		endpoint: `/auth/check`,
		responseType: "json",
		credentials: "include",
	})

	/////////////////
	//  Functions  //
	/////////////////
	/**
	 *
	 * @param issueToken
	 * This triggers when log in from external and sends issue token
	 * to the external website
	 */
	const postTokenToExternal = useCallback(
		(issueToken?: string) => {
			if (!externalOrigin) return
			window.opener.postMessage({ issue_token: issueToken }, externalOrigin)
			// Delay window close just in case postmessage is delayed
			setTimeout(() => {
				window.close()
			}, 500)
		},
		[externalOrigin],
	)

	const loginUserCallback = useCallback(
		(resp: QueryResponse<LoginOldUserResponse | LoginNewUserResponse>, twitterCallback?: () => void) => {
			if (resp.error) {
				throw resp.payload
			}
			if (!resp.payload) {
				throw new Error("No response was received")
			}
			// Handle new user
			if (
				(resp.payload.auth_type === AuthTypes.Google ||
					resp.payload.auth_type === AuthTypes.Facebook ||
					resp.payload.auth_type === AuthTypes.Wallet) &&
				resp.payload.new_user
			) {
				let uri = "/signup"
				if (resp.payload.captcha_required) uri += "?captcha=true"
				setSignupRequest(resp.payload)
				history.push(uri)
				return resp
			}

			if (resp.payload.tfa_token) {
				history.push(`/tfa/check?token=${resp.payload.tfa_token}`)
				return
			}
			if (!resp.payload.auth_type) {
				if (twitterCallback) {
					twitterCallback()
					return
				}
				if (redirectURL) {
					window.location.assign(redirectURL)
					return
				}
				if (!externalOrigin) {
					setUser(resp.payload.user)
					setAuthorised(true)
					setLoading(false)
				} else {
					postTokenToExternal(resp.payload.issue_token)
				}
			}
		},
		[externalOrigin, history, postTokenToExternal, redirectURL],
	)

	/**
	 * Signup a User  after setting up username and maybe password if email signup
	 *
	 * @param token Metamask public address
	 */
	const signupUser = useCallback(
		async (args: SignupNewUser, errorCallback?: (msg: string) => void) => {
			try {
				const resp = await signup({ ...args, is_external: !!externalOrigin, fingerprint })
				loginUserCallback(resp)
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e?.message) {
					errMsg = e.message
				}
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
				throw typeof e === "string" ? e : errMsg
			}
		},
		[signup, externalOrigin, fingerprint, loginUserCallback],
	)

	/**
	 * Logs user out by removing the stored login token and reloading the page.
	 */
	const logout = useCallback(async () => {
		try {
			await logoutQuery()
			setRecheckAuth(false)
			clear()

			// Wallet connect
			if (wcProvider) wcProvider.disconnect()

			setLoading(true)
			window.location.reload()

			return true
		} catch (error) {
			console.error()
		}
	}, [logoutQuery, clear, wcProvider])

	/**
	 * Logs a User in using their email and password.
	 */
	const loginPassword = useCallback(
		async (email: string, password: string, errorCallback?: (msg: string) => void) => {
			try {
				const args = {
					is_external: !!externalOrigin,
					email,
					password,
					session_id: sessionId,
					fingerprint,
					auth_type: AuthTypes.Email,
				}

				const resp = await login({ ...args, auth_type: AuthTypes.Email })
				loginUserCallback(resp)
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e.message) {
					errMsg = e.message
				}
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
				throw typeof e === "string" ? e : errMsg
			}
		},
		[externalOrigin, sessionId, fingerprint, login, loginUserCallback],
	)

	/**
	 * Sends an email to User to start signup process.
	 */
	const emailSignupVerify = useCallback(
		async (email: string, captcha_token: string | undefined, errorCallback?: (msg: string) => void) => {
			try {
				const resp = await emailSignup({ email, captcha_token })
				if (resp.error) {
					clear()
					throw resp.payload
				}
				setEmailCode({
					email,
					token: resp.payload?.token,
				})
				history.push("/email-verify")
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e.message) {
					errMsg = e.message
				}
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
				throw typeof e === "string" ? e : errMsg
			}
		},
		[emailSignup, history, clear],
	)

	/**
	 * verifyTokenCode verify jwt
	 */
	const verifyTokenCode = useCallback(
		async (token: string, code: string, errorCallback?: (msg: string) => void) => {
			try {
				const resp = await verifyCode({ token, code })

				if (resp.error) {
					throw resp.payload
				}

				return resp.payload?.success
			} catch (e: any) {
				const errMsg = "Something went wrong, please try again."
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
			}
		},
		[verifyCode],
	)

	/**
	 * Forgot Password sends email to the user with jwt token to reset password
	 */
	const forgotPassword = useCallback(
		async (email: string, errorCallback?: (msg: string) => void): Promise<string> => {
			try {
				const resp = await forgot({
					is_external: !!externalOrigin,
					email,
					session_id: sessionId,
					fingerprint,
				})
				if (resp.error) {
					clear()
					throw resp.payload
				}
				if (!resp.payload) {
					throw new Error("No response was received")
				}
				return resp.payload
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e.message) {
					errMsg = e.message
				}
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
				throw typeof e === "string" ? e : errMsg
			}
		},
		[forgot, externalOrigin, sessionId, fingerprint, clear],
	)

	/**
	 * Reset Password sends email to the user with jwt token to reset password
	 */
	const resetPassword = useCallback(
		async (password: string, token: string, errorCallback?: (msg: string) => void) => {
			try {
				const resp = await reset({
					is_external: !!externalOrigin,
					new_password: password,
					token,
					session_id: sessionId,
					fingerprint,
				})
				loginUserCallback(resp)
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e.message) {
					errMsg = e.message
				}
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
				throw typeof e === "string" ? e : errMsg
			}
		},
		[reset, externalOrigin, sessionId, fingerprint, loginUserCallback],
	)

	/**
	 * Change Password resets a users password
	 */
	const changePassword = useCallback(
		async (password: string, newPassword: string, errorCallback?: (msg: string) => void) => {
			if (user && !user.id && errorCallback) {
				errorCallback("User not authenticated.")
				return
			}

			if (!user) return
			if (!user.id) return

			try {
				const resp = await change({
					is_external: !!externalOrigin,
					user_id: user?.id,
					password,
					new_password: newPassword,
					session_id: sessionId,
					fingerprint,
				})

				if (resp.error) {
					throw resp.payload
				}
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e.message) {
					errMsg = e.message
				}
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
				throw typeof e === "string" ? e : errMsg
			}
		},
		[user, change, externalOrigin, sessionId, fingerprint],
	)

	/**
	 * New Password sets a new password if user never set it before
	 */
	const newPassword = useCallback(
		async (password: string, errorCallback?: (msg: string) => void) => {
			if (user && !user.id && errorCallback) {
				errorCallback("User not authenticated.")
				return
			}

			if (!user) return
			if (!user.id) return

			try {
				const resp = await newPass({
					user_id: user?.id,
					new_password: password,
					session_id: sessionId,
					fingerprint,
				})

				if (resp.error) {
					throw resp.payload
				}
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e.message) {
					errMsg = e.message
				}
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
				throw typeof e === "string" ? e : errMsg
			}
		},
		[newPass, sessionId, fingerprint, user],
	)

	/**
	 * Google login use oauth to give access to user
	 */
	const googleLogin = useCallback(
		async (accessToken: string, email: string, errorCallback?: (msg: string) => void) => {
			try {
				const args = {
					is_external: !!externalOrigin,
					email,
					google_token: accessToken,
					session_id: sessionId,
					fingerprint,
					auth_type: AuthTypes.Google,
					captcha_token: captchaToken,
				}

				const resp = await google({ ...args, auth_type: AuthTypes.Google })
				loginUserCallback(resp)
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e.message) {
					errMsg = e.message
				}
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
				throw typeof e === "string" ? e : errMsg
			}
		},
		[externalOrigin, sessionId, fingerprint, captchaToken, google, loginUserCallback],
	)
	/**
	 * Facebook login use oauth to give access to user
	 */
	const facebookLogin = useCallback(
		async (token: string, email: string, errorCallback?: (msg: string) => void) => {
			try {
				const args = {
					is_external: !!externalOrigin,
					email,
					facebook_token: token,
					session_id: sessionId,
					fingerprint,
					captcha_token: captchaToken,
				}

				const resp = await facebook({ ...args, auth_type: AuthTypes.Facebook })
				loginUserCallback(resp)
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e.message) {
					errMsg = e.message
				}
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
				throw typeof e === "string" ? e : errMsg
			}
		},
		[externalOrigin, sessionId, fingerprint, captchaToken, facebook, loginUserCallback],
	)
	/**
	/**
	 * TwoFactor login after confirming auth to give access to user
	 */
	const twoFactorAuthLogin = useCallback(
		async (code: string, isRecovery: boolean, token?: string, rURL?: string, isVerified?: boolean, errorCallback?: (msg: string) => void) => {
			try {
				const args = {
					is_external: !!externalOrigin,
					token,
					passcode: isRecovery ? undefined : code,
					recovery_code: isRecovery ? code : undefined,
					session_id: sessionId,
					fingerprint,
					auth_type: AuthTypes.TFA,
				}

				const resp = await twoFactorAuth({ ...args, is_verified: isVerified })

				if (isVerified) {
					return
				}
				let isTwitter
				if (rURL) {
					isTwitter = () => {
						history.push(rURL)
					}
				}
				loginUserCallback(resp, isTwitter)
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e.message) {
					errMsg = e.message
				}
				if (errorCallback) {
					errorCallback(errMsg)
				}
				console.error(e)
				throw typeof e === "string" ? e : errMsg
			}
		},
		[externalOrigin, sessionId, fingerprint, twoFactorAuth, loginUserCallback, history],
	)
	/**
	 * Logs a User in using a Metamask public address
	 *
	 * @param token Metamask public address
	 */
	const loginMetamask = useCallback(async () => {
		try {
			const acc = await connect()
			const resp = await sign(user ? user.id : undefined)
			const signature = resp?.signature
			const nonce = resp?.nonce
			if (acc) {
				const args = {
					is_external: !!externalOrigin,
					public_address: acc,
					signature,
					nonce,
					session_id: sessionId,
					fingerprint,
					auth_type: AuthTypes.Wallet,
					captcha_token: captchaToken,
				}

				const resp = await login({ ...args, auth_type: AuthTypes.Wallet })
				return loginUserCallback(resp)
			}
		} catch (e: any) {
			console.error(e)
			//checking metamask error signature and throwing error to be caught and handled at a higher level... tried setting displayMessage here and did not work:/
			const err = metamaskErrorHandling(e)
			if (err) {
				throw err
			}
			throw e
		}
	}, [connect, sign, user, externalOrigin, sessionId, fingerprint, captchaToken, login, loginUserCallback])
	/**
	 * Logs a User in using a Wallet Connect public address
	 *
	 * @param token Wallet Connect public address
	 */
	const loginWalletConnect = useCallback(async () => {
		try {
			if (!wcSignature) {
				await signWalletConnect()
			} else {
				const args = {
					is_external: !!externalOrigin,
					public_address: account as string,
					signature: wcSignature || "",
					nonce: wcNonce || "",
					session_id: sessionId,
					fingerprint,
					auth_type: AuthTypes.Wallet,
					captcha_token: captchaToken,
				}

				const resp = await login({ ...args, auth_type: AuthTypes.Wallet })
				return loginUserCallback(resp)
			}
		} catch (e) {
			clear()
			setUser(undefined)
			throw typeof e === "string" ? e : "Issue logging in with WalletConnect, try again or contact support."
		}
	}, [wcSignature, signWalletConnect, externalOrigin, account, wcNonce, sessionId, fingerprint, captchaToken, login, loginUserCallback, clear])

	// Effect
	useEffect(() => {
		if (wcSignature && !user) {
			;(async () => {
				await loginWalletConnect()
			})()
		}
	}, [wcSignature, loginWalletConnect, user])

	/**
	 * Verifies a User and takes them to the next page.
	 */
	const verify = useCallback(
		async (token: string, forgotPassword?: boolean) => {
			clear()

			setVerifying(true)
			const resp = await fetch(
				`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/verify?token=${token}${forgotPassword ? "&forgot=true" : ""}`,
			)
			const respObj: VerifyAccountResponse = await resp.json()
			if (resp.status !== 200) {
				// TODO: get the actual error
				throw new Error()
			}
			if (!respObj || !respObj.user) {
				setVerifying(false)
				return resp
			}

			setUser(respObj.user)
			setVerifying(false)
			setVerifyCompleteType(forgotPassword ? VerificationType.ForgotPassword : VerificationType.EmailVerification)
			setAuthorised(true)
			setLoading(false)
			return respObj
		},
		[clear],
	)

	/** Checks if current user has a permission */
	const hasPermission = (perm: Perm) => {
		// if (impersonatedUser) return impersonatedUser.role.permissions.includes(perm)

		if (!user || !user.role || !user.role.permissions) return false
		return user.role.permissions.includes(perm)
	}

	// Auth check handler
	const handleAuthCheck = useCallback(
		async (isTwitter?: boolean) => {
			try {
				const resp = await authCheck()
				// If external then post issue token
				if (resp.error || !resp.payload) {
					clear()
					// throw resp.payload
					return
				}

				if (isTwitter) {
					// Check if payload contains user or jwt
					// Check if 2FA is set
					if (!resp.payload?.user.id) {
						history.push(`/tfa/check?token=${resp.payload.tfa_token}`)
						return
					}
				}
				if (redirectURL) {
					window.location.assign(redirectURL)
					return
				}
				postTokenToExternal(resp.payload.issue_token)
				if (externalOrigin && resp.payload.user) return
				// else set up user
				setUser(resp.payload.user)
				setAuthorised(true)
			} catch (e) {
				console.log(e)
			} finally {
				setLoading(false)
			}
		},
		[authCheck, clear, externalOrigin, history, postTokenToExternal, redirectURL],
	)

	///////////////////
	//  Use Effects  //
	///////////////////

	// Effect: Login with saved login token when websocket is ready
	useEffect(() => {
		try {
			;(async () => {
				await handleAuthCheck()
			})()
		} catch (error) {
			console.error(error)
		}
	}, [handleAuthCheck])

	// close web page if it is a iframe login through gamebar
	useEffect(() => {
		if (authorised && sessionId) {
			window.close()
		}
	}, [authorised, sessionId])

	useEffect(() => {
		if (!user) return
		setUserForWeb3(user)
	}, [setUserForWeb3, user])

	/////////////////
	//  Container  //
	/////////////////
	return {
		handleAuthCheck,
		loginMetamask,
		loginWalletConnect,
		logout,
		verify,
		login: {
			loading: loginLoading,
			error: loginError,
		},

		hasPermission,
		recheckAuth,
		user: user,
		userID: user?.id,
		factionID: user?.faction_id,
		setUser,
		isImpersonatingUser: false,
		loading,
		verifying,
		verifyCompleteType,
		setSessionID,
		sessionId,
		showSimulation,
		setShowSimulation,
		emailSignup: {
			action: emailSignupVerify,
			loading: emailSignupLoading,
		},
		loginPassword: {
			action: loginPassword,
			loading: loginLoading,
		},
		forgotPassword: {
			action: forgotPassword,
			loading: forgotPasswordLoading,
		},
		resetPassword: {
			action: resetPassword,
			loading: resetPasswordLoading,
		},
		changePassword: {
			action: changePassword,
			loading: changePasswordLoading,
		},
		newPassword: {
			action: newPassword,
			loading: newPasswordLoading,
		},
		googleLogin: {
			action: googleLogin,
			loading: googleLoginLoading,
		},
		facebookLogin: {
			action: facebookLogin,
			loading: facebookLoginLoading,
		},
		twoFactorAuthLogin: {
			action: twoFactorAuthLogin,
			loading: twoFactorLoginLoading,
		},
		signupUser: {
			action: signupUser,
			loading: signupLoading,
		},
		verifyCode: {
			action: verifyTokenCode,
			loading: verifyCodeLoading,
		},
		signupRequest,
		setSignupRequest,
		emailCode,
		setEmailCode,
		captchaToken,
		setCaptchaToken,
		externalOrigin,
		postTokenToExternal,
	}
})

export const AuthProvider = AuthContainer.Provider
export const useAuth = AuthContainer.useContainer

export const UserUpdater = () => {
	const { userID, setUser } = useAuth()

	// Subscribe on the user
	useSubscription<User>(
		{
			URI: `/user/${userID}`,
			key: keys.User,
			ready: !!userID,
		},
		(payload) => {
			if (!payload) return
			setUser(payload)
		},
	)

	usePassportSubscriptionUser({ URI: "", key: keys.UserInit }, (payload) => {
		if (!payload) {
			window.location.reload()
		}
	})

	return null
}
