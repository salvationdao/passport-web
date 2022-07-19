import { useCallback, useEffect, useMemo, useState } from "react"
import { Action, useMutation, useQuery } from "react-fetching-library"
import { useHistory } from "react-router-dom"
import { createContainer } from "unstated-next"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { metamaskErrorHandling } from "../../helpers/web3"
import { usePassportSubscriptionUser } from "../../hooks/usePassport"
import keys from "../../keys"
import {
	ChangePasswordRequest,
	FacebookLoginRequest,
	ForgotPasswordRequest,
	GoogleLoginRequest,
	LoginRequest,
	NewPasswordRequest,
	TwoFactorAuthLoginRequest,
	VerifyAccountResponse,
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
	Forgot = "forgot",
	Reset = "reset",
	ChangePassword = "change_password",
	NewPassword = "new_password",
	Google = "google",
	Facebook = "facebook",
	TFA = "tfa",
}

export enum VerificationType {
	EmailVerification,
	ForgotPassword,
}

const loginAction = (formValues: LoginRequest & { authType: string }): Action<User> => ({
	method: "POST",
	endpoint: `/auth/${formValues.authType}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const forgotPasswordAction = (formValues: ForgotPasswordRequest): Action => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.Forgot}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const resetPasswordAction = (formValues: ResetPasswordRequest): Action => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.Reset}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const changePasswordAction = (formValues: ChangePasswordRequest): Action => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.ChangePassword}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const newPasswordAction = (formValues: NewPasswordRequest): Action => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.NewPassword}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const googleLoginAction = (formValues: GoogleLoginRequest): Action => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.Google}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const facebookLoginAction = (formValues: FacebookLoginRequest): Action => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.Facebook}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})

const twoFactorAuthLoginAction = (formValues: TwoFactorAuthLoginRequest): Action => ({
	method: "POST",
	endpoint: `/auth/${AuthTypes.TFA}`,
	responseType: "json",
	credentials: "include",
	body: formValues,
})
/**
 * A Container that handles Authorisation
 */

export const AuthContainer = createContainer(() => {
	const history = useHistory()
	const { fingerprint } = useFingerprint()
	const { sign, signWalletConnect, account, connect, wcProvider, wcSignature } = useWeb3()
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
	const redirectURL = useMemo(() => {
		const queryString = window.location.search
		const urlParams = new URLSearchParams(queryString)
		return urlParams.get("redirectURL") || undefined
	}, [])

	const [sessionId, setSessionID] = useState("")
	const isLogoutPage = window.location.pathname.startsWith("/external/logout")

	const clear = useCallback(() => {
		console.info("clearing local storage")
		console.trace()
		setUser(undefined)
	}, [])

	// Mutated actions
	const { loading: loginLoading, mutate: login, error: loginError } = useMutation(loginAction)
	const { loading: forgotPasswordLoading, mutate: forgot } = useMutation(forgotPasswordAction)
	const { loading: resetPasswordLoading, mutate: reset } = useMutation(resetPasswordAction)
	const { loading: changePasswordLoading, mutate: change } = useMutation(changePasswordAction)
	const { loading: newPasswordLoading, mutate: newPass } = useMutation(newPasswordAction)
	const { loading: googleLoginLoading, mutate: google } = useMutation(googleLoginAction)
	const { loading: facebookLoginLoading, mutate: facebook } = useMutation(facebookLoginAction)
	const { loading: twoFactorLoginLoading, mutate: twoFactorAuth } = useMutation(twoFactorAuthLoginAction)

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
	const { query: authCheck } = useQuery<User>({
		method: "GET",
		endpoint: `/auth/check`,
		responseType: "json",
		credentials: "include",
	})
	const externalAuth = useMemo(
		() => (args: { [key: string]: string | null | undefined }) => {
			const cleanArgs: { [key: string]: string } = {}
			const host = args["host"]

			Object.keys(args).forEach((key) => {
				if (args[key] === "" || args[key] === "null" || !args[key]) {
					return
				}
				cleanArgs[key] = args[key] || ""
			})

			const form = document.createElement("form")
			form.method = "post"
			form.action = `https://${host || API_ENDPOINT_HOSTNAME}/api/auth/external`

			Object.keys(args).forEach((key) => {
				const hiddenField = document.createElement("input")
				hiddenField.type = "hidden"
				hiddenField.name = key
				hiddenField.value = args[key] || ""

				form.appendChild(hiddenField)
			})

			document.body.appendChild(form)
			form.requestSubmit()
		},
		[],
	)

	/////////////////
	//  Functions  //
	/////////////////

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

			if (isLogoutPage) {
				window.close()
			} else {
				window.location.reload()
			}

			return true
		} catch (error) {
			console.error()
		}
	}, [logoutQuery, clear, wcProvider, isLogoutPage])

	/**
	 * Logs a User in using their email and password.
	 */
	const loginPassword = useCallback(
		async (email: string, password: string, errorCallback?: (msg: string) => void) => {
			try {
				const args = {
					redirect_url: redirectURL,
					email,
					password,
					session_id: sessionId,
					fingerprint,
					authType: AuthTypes.Email,
				}
				if (redirectURL) {
					externalAuth({ ...args, fingerprint: undefined })
					return
				}
				const resp = await login(args)

				if (resp.error) {
					clear()
					throw resp.payload
				}

				// Check if payload contains user or jwt
				// Check if 2FA is set
				if (!resp.payload?.id) {
					history.push(`/tfa/check?token=${resp.payload}`)
					return
				}
				setUser(resp.payload)
				setAuthorised(true)
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
		[login, redirectURL, sessionId, fingerprint, clear, history, externalAuth],
	)

	/**
	 * Registers a User in using their email and password.
	 */
	const signupPassword = useCallback(
		async (username: string, email: string, password: string, errorCallback?: (msg: string) => void) => {
			try {
				const args = {
					redirect_url: redirectURL,
					username,
					email,
					password,
					session_id: sessionId,
					fingerprint,
					authType: AuthTypes.Email,
				}
				if (redirectURL) {
					externalAuth({ ...args, fingerprint: undefined })
					return
				}
				const resp = await login(args)
				if (resp.error) {
					clear()
					throw resp.payload
				}
				setUser(resp.payload)
				setAuthorised(true)
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
		[login, redirectURL, sessionId, fingerprint, clear, externalAuth],
	)

	/**
	 * Forgot Password sends email to the user with jwt token to reset password
	 */
	const forgotPassword = useCallback(
		async (email: string, errorCallback?: (msg: string) => void): Promise<string> => {
			try {
				const resp = await forgot({
					redirect_url: redirectURL,
					email,
					session_id: sessionId,
					fingerprint,
				})
				if (resp.error) {
					clear()
					throw resp.payload
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
		[forgot, redirectURL, sessionId, fingerprint, clear],
	)

	/**
	 * Reset Password sends email to the user with jwt token to reset password
	 */
	const resetPassword = useCallback(
		async (
			password: string,
			tokenGroup: {
				id: string
				token: string
			},
			errorCallback?: (msg: string) => void,
		) => {
			try {
				const resp = await reset({
					redirect_url: redirectURL,
					new_password: password,
					id: tokenGroup.id,
					token: tokenGroup.token,
					session_id: sessionId,
					fingerprint,
				})
				if (resp.error) {
					clear()
					throw resp.payload
				}
				setUser(resp.payload)
				setAuthorised(true)
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
		[reset, redirectURL, sessionId, fingerprint, clear],
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
					redirect_url: redirectURL,
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
		[change, redirectURL, sessionId, fingerprint, user],
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
					redirect_url: redirectURL,
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
		[newPass, redirectURL, sessionId, fingerprint, user],
	)

	/**
	 * Google login use oauth to give access to user
	 */
	const googleLogin = useCallback(
		async (id: string, username: string, email: string, errorCallback?: (msg: string) => void) => {
			try {
				const args = {
					redirect_url: redirectURL,
					username,
					email,
					google_id: id,
					session_id: sessionId,
					fingerprint: redirectURL ? undefined : fingerprint,
					authType: AuthTypes.Google,
				}
				if (redirectURL) {
					externalAuth({ ...args, fingerprint: undefined })
					return
				}
				const resp = await google({
					...args,
				})

				if (resp.error) {
					throw resp.payload
				}

				// Check if payload contains user or jwt
				// Check if 2FA is set
				if (!resp.payload?.id) {
					history.push(`/tfa/check?token=${resp.payload}`)
					return
				}

				setUser(resp.payload)
				setAuthorised(true)
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
		[google, redirectURL, sessionId, fingerprint, history, externalAuth],
	)
	/**
	 * Facebook login use oauth to give access to user
	 */
	const facebookLogin = useCallback(
		async (id: string, name: string, email: string, errorCallback?: (msg: string) => void) => {
			try {
				const args = {
					redirect_url: redirectURL,
					email,
					facebook_id: id,
					name,
					session_id: sessionId,
					fingerprint: redirectURL ? undefined : fingerprint,
					authType: AuthTypes.Facebook,
				}
				if (redirectURL) {
					externalAuth({ ...args, fingerprint: undefined })
					return
				}
				const resp = await facebook(args)
				if (resp.error) {
					throw resp.error
				}

				// Check if payload contains user or jwt
				// Check if 2FA is set
				if (!resp.payload?.id) {
					history.push(`/tfa/check?token=${resp.payload}`)
					return
				}

				setUser(resp.payload)
				setAuthorised(true)
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
		[facebook, redirectURL, sessionId, fingerprint, externalAuth, history],
	)

	/**
	 * Facebook login use oauth to give access to user
	 */
	const twoFactorAuthLogin = useCallback(
		async (
			token: string | undefined,
			code: string,
			isRecovery: boolean,
			rURL?: string,
			isVerified?: boolean,
			errorCallback?: (msg: string) => void,
		) => {
			try {
				const args = {
					redirect_url: rURL,
					token,
					user_id: isVerified ? user?.id : undefined,
					passcode: isRecovery ? undefined : code,
					recovery_code: isRecovery ? code : undefined,
					session_id: sessionId,
					fingerprint: redirectURL ? undefined : fingerprint,
					authType: AuthTypes.TFA,
				}
				if (redirectURL) {
					externalAuth({ ...args, fingerprint: undefined })
					return
				}

				const resp = await twoFactorAuth(args)

				if (resp.error) {
					throw resp.payload
				}

				setUser(resp.payload)
				setAuthorised(true)
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
		[twoFactorAuth, redirectURL, sessionId, fingerprint, externalAuth, user],
	)

	/**
	 * Logs a User in using their saved login token.
	 *
	 * @param token login token usually from local storage
	 */
	const loginToken = useCallback(
		async (token: string) => {
			const args = {
				redirect_url: redirectURL,
				token,
				session_id: sessionId,
				fingerprint: redirectURL ? undefined : fingerprint,
				authType: AuthTypes.Token,
			}

			setLoading(true)
			try {
				const resp = await login(args)

				if (resp.error) {
					clear()
					throw resp.payload
				}
				setUser(resp.payload)
				setAuthorised(true)
				setLoading(false)
			} catch (e) {
				clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			} finally {
				setLoading(false)
			}
		},
		[redirectURL, sessionId, fingerprint, login, clear],
	)

	/**
	 * Logs a User in using a Metamask public address
	 *
	 * @param token Metamask public address
	 */
	const loginMetamask = useCallback(
		async (host: string) => {
			try {
				const acc = await connect()
				const signature = await sign(user ? user.id : undefined)
				if (acc) {
					const args = {
						redirect_url: redirectURL,
						public_address: acc,
						signature: signature,
						session_id: sessionId,
						fingerprint: redirectURL ? undefined : fingerprint,
						authType: AuthTypes.Wallet,
					}

					if (redirectURL) {
						externalAuth({ ...args, host, fingerprint: undefined })
						return
					}
					const resp = await login(args)

					if (resp.error) {
						throw resp.payload
					}

					// Check if payload contains user or jwt
					// Check if 2FA is set
					if (!resp.payload?.id) {
						history.push(`/tfa/check?token=${resp.payload}`)
						return
					}

					setUser(resp.payload)
					setAuthorised(true)
					setLoading(false)

					return resp
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
		},
		[connect, sign, redirectURL, sessionId, fingerprint, login, user, externalAuth, history],
	)
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
				const resp = await login({
					redirect_url: redirectURL,
					public_address: account as string,
					signature: wcSignature || "",
					session_id: sessionId,
					fingerprint: redirectURL ? undefined : fingerprint,
					authType: AuthTypes.Wallet,
				})

				if (!resp || resp.error || !resp.payload) {
					clear()
					return
				}
				setUser(resp.payload)
				setAuthorised(true)
				setLoading(false)
				return resp
			}
		} catch (e) {
			clear()
			setUser(undefined)
			throw typeof e === "string" ? e : "Issue logging in with WalletConnect, try again or contact support."
		}
	}, [wcSignature, signWalletConnect, login, redirectURL, account, sessionId, fingerprint, clear])

	// Effect
	useEffect(() => {
		if (wcSignature) {
			;(async () => {
				await loginWalletConnect()
			})()
		}
	}, [wcSignature, loginWalletConnect])

	/**
	 * External login User with passport cookie
	 *
	 */
	const loginCookieExternal = useCallback(() => {
		const args = {
			redirect_url: redirectURL,
			authType: AuthTypes.Cookie,
		}
		if (redirectURL) {
			externalAuth({ ...args, fingerprint: undefined })
			return
		}
	}, [externalAuth, redirectURL])
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
			const resp = await authCheck()
			if (resp.error || !resp.payload) {
				clear()
				setLoading(false)
				return
			}

			if (isTwitter) {
				// Check if payload contains user or jwt
				// Check if 2FA is set
				if (!resp.payload?.id) {
					history.push(`/tfa/check?token=${resp.payload}`)
					return
				}
			}
			// else set up user
			setUser(resp.payload)
			setAuthorised(true)
			setLoading(false)
		},
		[authCheck, clear, history],
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
			console.log(error)
		}
	}, [handleAuthCheck])

	// close web page if it is a iframe login through gamebar
	useEffect(() => {
		if (authorised && sessionId && !isLogoutPage) {
			window.close()
		}
	}, [authorised, sessionId, isLogoutPage])

	/////////////////
	//  Container  //
	/////////////////
	return {
		loginCookieExternal,
		handleAuthCheck,
		loginToken,
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
		signupPassword: {
			action: signupPassword,
			loading: loginLoading,
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
