import { useCallback, useEffect, useMemo, useState } from "react"
import { createContainer } from "unstated-next"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { metamaskErrorHandling } from "../../helpers/web3"
import { LoginRequest, VerifyAccountResponse } from "../../types/auth"
import { Perm } from "../../types/enums"
import { User } from "../../types/types"
import { useFingerprint } from "../fingerprint"
import { useWeb3 } from "../web3"
import { Action, useMutation, useQuery } from "react-fetching-library"
import useSignup from "./signup"
import { useSubscription } from "../ws/useSubscription"
import keys from "../../keys"

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

/**
 * A Container that handles Authorisation
 */
export const AuthContainer = createContainer(() => {
	const { fingerprint } = useFingerprint()
	const { sign, signWalletConnect, account, connect, wcProvider, wcSignature } = useWeb3()
	const [user, _setUser] = useState<User>()

	const setUser = (user?: User) => {
		_setUser(user)
	}

	const [authType, setAuthType] = useState<string>("wallet")

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

	const { signUpMetamask, setSignupType, signupType } = useSignup()

	const [sessionId, setSessionID] = useState("")

	const isLogoutPage = window.location.pathname.startsWith("/external/logout")

	const clear = useCallback(() => {
		console.info("clearing local storage")
		console.trace()
		setUser(undefined)
	}, [])

	const { loading: loginLoading, mutate: login, error: loginError } = useMutation(loginAction)
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
			Object.keys(args).forEach((key) => {
				if (args[key] === "" || args[key] === "null" || !args[key]) {
					return
				}
				cleanArgs[key] = args[key] || ""
			})

			const form = document.createElement("form")
			form.method = "post"
			form.action = `https://${API_ENDPOINT_HOSTNAME}/api/auth/external`

			Object.keys(args).forEach((key) => {
				const hiddenField = document.createElement("input")
				hiddenField.type = "hidden"
				hiddenField.name = key
				hiddenField.value = args[key] || ""

				form.appendChild(hiddenField)
			})

			document.body.appendChild(form)
			form.submit()
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
		async (email: string, password: string) => {
			try {
				const resp = await login({
					redirectURL,
					email,
					password,
					session_id: sessionId,
					fingerprint,
					authType,
				})

				if (!resp || resp.error || !resp.payload) {
					clear()
					return
				}
				setUser(resp.payload)
				setAuthorised(true)
				setLoading(false)
			} catch (e) {
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
		},
		[login, redirectURL, sessionId, fingerprint, authType, clear],
	)

	/**
	 * Logs a User in using their saved login token.
	 *
	 * @param token login token usually from local storage
	 */
	const loginToken = useCallback(
		async (token: string) => {
			const args = {
				redirectURL,
				token,
				session_id: sessionId,
				fingerprint,
				authType: "token",
			}
			if (redirectURL) {
				externalAuth({ ...args, fingerprint: undefined })
				return
			}

			setLoading(true)
			try {
				const resp = await login(args)

				if (!resp || resp.error || !resp.payload) {
					console.log(resp)
					clear()
					return
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
		[redirectURL, sessionId, fingerprint, externalAuth, login, clear],
	)

	/**
	 * External login User with passport cookie
	 *
	 */
	const loginCookieExternal = useCallback(() => {
		const args = {
			redirectURL,
			authType: "cookie",
		}
		if (redirectURL) {
			externalAuth({ ...args, fingerprint: undefined })
			return
		}
	}, [externalAuth, redirectURL])

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
				const args = {
					redirectURL,
					public_address: acc,
					signature: signature,
					session_id: sessionId,
					fingerprint,
					authType: "wallet",
				}
				if (redirectURL) {
					externalAuth({ ...args, fingerprint: undefined })
					return
				}

				const resp = await login({
					redirectURL,
					public_address: acc,
					signature: signature,
					session_id: sessionId,
					fingerprint,
					authType: "wallet",
				})

				console.log(resp.payload)

				if (!resp || resp.error || !resp.payload) {
					clear()
					return
				}
				setUser(resp.payload)
				setAuthorised(true)
				setLoading(false)

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
	}, [connect, sign, redirectURL, sessionId, fingerprint, login, externalAuth, clear])
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
					redirectURL,
					public_address: account as string,
					signature: wcSignature || "",
					session_id: sessionId,
					fingerprint,
					authType,
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
	}, [wcSignature, signWalletConnect, login, redirectURL, account, sessionId, fingerprint, authType, clear])

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

	///////////////////
	//  Use Effects  //
	///////////////////

	// Effect: Login with saved login token when websocket is ready
	useEffect(() => {
		try {
			;(async () => {
				const resp = await authCheck()
				if (resp.error || !resp.payload) {
					clear()
					setLoading(false)
					return
				}
				// else set up user
				setUser(resp.payload)
				setAuthorised(true)
				setLoading(false)
			})()
		} catch (error) {
			console.log(error)
		}
	}, [authCheck, clear])

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
		loginCookieExternal,
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

	return null
}
