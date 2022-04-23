import { useCallback, useEffect, useState } from "react"
import { createContainer } from "unstated-next"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { metamaskErrorHandling } from "../../helpers/web3"
import { LoginRequest, PasswordLoginResponse, TokenLoginResponse, VerifyAccountResponse } from "../../types/auth"
import { Perm } from "../../types/enums"
import { User } from "../../types/types"
import { useFingerprint } from "../fingerprint"
import { useWeb3 } from "../web3"
import { Action, QueryResponse, useMutation } from "react-fetching-library"
import useSignup from "./signup"

export enum VerificationType {
	EmailVerification,
	ForgotPassword,
}

const logoutAction = (formValues: { token: string; session_id: string }): Action => ({
	method: "POST",
	endpoint: `/auth/logout`,
	responseType: "json",
	body: formValues,
})

const loginAction = (formValues: LoginRequest & { authType: string }): Action<PasswordLoginResponse> => ({
	method: "POST",
	endpoint: `/auth/${formValues.authType}`,
	responseType: "json",
	body: formValues,
})

/**
 * A Container that handles Authorisation
 */
export const AuthContainer = createContainer(() => {
	const { fingerprint } = useFingerprint()
	const { sign, signWalletConnect, account, connect, wcProvider, wcSignature } = useWeb3()

	const [user, _setUser] = useState<User>()
	const [userId, setUserId] = useState<string>("")

	const setUser = (user?: User) => {
		console.log(user, user && user.faction)
		setUserId(user ? user.id : "")
		_setUser(user)
	}

	const [authType, setAuthType] = useState<string>("wallet")

	const [recheckAuth, setRecheckAuth] = useState(!!localStorage.getItem("auth-token"))
	const [authorised, setAuthorised] = useState(false)
	const [loading, setLoading] = useState(true) // wait for loading current login state to complete first
	const [verifying, setVerifying] = useState(false)
	const [verifyCompleteType, setVerifyCompleteType] = useState<VerificationType>()
	const [showSimulation, setShowSimulation] = useState(false)

	const [token, _setToken] = useState<string>(localStorage.getItem("token") || "")

	const setToken = useCallback(
		(token: string) => {
			localStorage.setItem("token", token)
			_setToken(token)
		},
		[_setToken],
	)

	const { signUpMetamask, setSignupType, signupType } = useSignup()

	// const [impersonatedUser, setImpersonatedUser] = useState<User>()

	const [sessionId, setSessionID] = useState("")

	const isLogoutPage = window.location.pathname.startsWith("/nosidebar/logout")

	const clear = () => {
		console.info("clearing local storage")
		console.trace()
		setUser(undefined)
	}

	const { loading: loginLoading, payload: loginPayload, mutate: login, error: loginError } = useMutation(loginAction)
	const { mutate: logoutMutation } = useMutation(logoutAction)

	/////////////////
	//  Functions  //
	/////////////////

	/**
	 * Logs user out by removing the stored login token and reloading the page.
	 */
	const logout = useCallback(async () => {
		try {
			const token = localStorage.getItem("auth-token")
			if (!token) return
			await logoutMutation({ token: token, session_id: sessionId })
			alert("logout")
			localStorage.removeItem("auth-token")
			setRecheckAuth(false)

			clear()

			// Wallet connect
			if (wcProvider) wcProvider.disconnect()

			if (isLogoutPage) {
				window.close()
			} else if (!isLogoutPage) {
				window.location.reload()
			}

			return true
		} catch (error) {
			console.error()
		}
	}, [loginAction, isLogoutPage, sessionId, wcProvider])

	/**
	 * Logs a User in using their email and password.
	 */
	const loginPassword = useCallback(
		async (email: string, password: string) => {
			try {
				const resp: QueryResponse<PasswordLoginResponse> = await login({
					email,
					password,
					session_id: sessionId,
					fingerprint,
					authType,
				})
				if (!resp || !resp.payload || !resp.payload.user || !resp.payload.token) {
					clear()
					return
				}
				setUser(resp.payload.user)
				setToken(resp.payload.token)
				localStorage.setItem("auth-token", resp.payload.token)
				setAuthorised(true)
			} catch (e) {
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
		},
		[login, sessionId, fingerprint],
	)

	/**
	 * Logs a User in using their saved login token.
	 *
	 * @param token login token usually from local storage
	 */
	const loginToken = useCallback(
		async (token: string) => {
			const searchParams = new URLSearchParams(window.location.search)
			setLoading(true)
			try {
				const resp: QueryResponse<TokenLoginResponse> = await login({
					token,
					session_id: sessionId,
					twitch_extension_jwt: searchParams.get("twitchExtensionJWT"),
					fingerprint,
					authType: "token",
				})
				if (!resp || !resp.payload || !resp.payload.user) {
					console.log(resp)
					clear()
					return
				}
				setUser(resp.payload.user)
				setAuthorised(true)
			} catch (e) {
				clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			} finally {
				setLoading(false)
			}
		},
		[login, sessionId, fingerprint],
	)

	/**
	 * Logs a User in using a Metamask public address
	 *
	 * @param token Metamask public address
	 */
	const loginMetamask = useCallback(async () => {
		try {
			const acc = await connect()
			const signature = await sign()
			if (acc) {
				console.log("account", acc, "ACCOUNT")
				const resp: QueryResponse<PasswordLoginResponse> = await login({
					public_address: acc,
					signature: signature,
					session_id: sessionId,
					fingerprint,
					authType,
				})

				if (!resp || !resp.payload || !resp.payload.user || !resp.payload.token) {
					clear()
					return
				}
				setUser(resp.payload.user)
				setToken(resp.payload.token)
				localStorage.setItem("auth-token", resp.payload.token)
				setAuthorised(true)

				return resp
			}
		} catch (e: any) {
			console.error(e)
			clear()
			setUser(undefined)
			//checking metamask error signature and throwing error to be caught and handled at a higher level... tried setting displayMessage here and did not work:/
			const err = metamaskErrorHandling(e)
			if (err) {
				throw err
			}
			throw e
		}
	}, [login, sign, sessionId, connect, fingerprint])
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
				const resp: QueryResponse<PasswordLoginResponse> = await login({
					public_address: account as string,
					signature: wcSignature || "",
					session_id: sessionId,
					fingerprint,
					authType,
				})
				if (!resp || !resp.payload || !resp.payload.user || !resp.payload.token) {
					clear()
					return
				}
				setUser(resp.payload.user)
				setToken(resp.payload.token)
				localStorage.setItem("auth-token", resp.payload.token)
				setAuthorised(true)
				return resp
			}
		} catch (e) {
			clear()
			setUser(undefined)
			throw typeof e === "string" ? e : "Issue logging in with WalletConnect, try again or contact support."
		}
	}, [login, account, sessionId, signWalletConnect, wcSignature, fingerprint])

	// Effect
	useEffect(() => {
		if (wcSignature) {
			;(async () => {
				await loginWalletConnect()
			})()
		}
	}, [wcSignature, loginWalletConnect])

	/**
	 * Verifies a User and takes them to the next page.
	 */
	const verify = useCallback(async (token: string, forgotPassword?: boolean) => {
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
		setToken(respObj.token)
		setVerifying(false)
		setVerifyCompleteType(forgotPassword ? VerificationType.ForgotPassword : VerificationType.EmailVerification)
		setAuthorised(true)
		return respObj
	}, [])

	/** Checks if current user has a permission */
	const hasPermission = (perm: Perm) => {
		// if (impersonatedUser) return impersonatedUser.role.permissions.includes(perm)

		if (!user || !user.role || !user.role.permissions) return false
		return user.role.permissions.includes(perm)
	}

	///////////////////
	//  Use Effects  //
	///////////////////

	// Effect: Login with saved login token when websocket is ready
	useEffect(() => {
		const token = localStorage.getItem("auth-token")
		if (token && token !== "" && !user) {
			loginToken(token)
		}
	}, [loginToken])

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
		loginPassword,
		loginToken,
		loginMetamask,
		loginWalletConnect,
		logout,
		verify,
		login: {
			loading: loginLoading,
			error: loginError,
		},
		signup: {
			signUpMetamask,
			setSignupType,
			signupType,
		},
		hasPermission,
		recheckAuth,
		user: user,
		userID: user?.id,
		userId,
		factionID: user?.faction_id,
		setUser,
		isImpersonatingUser: false,
		loading,
		verifying,
		verifyCompleteType,
		setSessionID,
		signUpMetamask,
		sessionId,
		showSimulation,
		setShowSimulation,
		authType,
		setAuthType,
	}
})

export const AuthProvider = AuthContainer.Provider
export const useAuth = AuthContainer.useContainer
