import { useCallback, useEffect, useState } from "react"
import { createContainer } from "unstated-next"
import HubKey from "../keys"
import {
	AddServiceRequest,
	AddServiceResponse, AddTwitchRequest, PasswordLoginRequest,
	PasswordLoginResponse,
	RemoveServiceRequest,
	RemoveServiceResponse,
	TokenLoginRequest,
	TokenLoginResponse, TwitchLoginRequest, VerifyAccountResponse,
	WalletLoginRequest,
	WalletLoginResponse
} from "../types/auth"
import { Perm } from "../types/enums"
import { User } from "../types/types"
import { API_ENDPOINT_HOSTNAME, useWebsocket } from "./socket"
import { MetaMaskState, useWeb3 } from "./web3"

export enum VerificationType {
	EmailVerification,
	ForgotPassword,
}

/**
 * A Container that handles Authorisation
 */
export const AuthContainer = createContainer(() => {
	const { metaMaskState, sign, account } = useWeb3()
	const admin = process.env.REACT_APP_BUILD_TARGET === "ADMIN"
	const [user, setUser] = useState<User | null>(null)
	const [authorised, setAuthorised] = useState(false)
	const [reconnecting, setReconnecting] = useState(false)
	const [loading, setLoading] = useState(true) // wait for loading current login state to complete first
	const [verifying, setVerifying] = useState(false)
	const [verifyCompleteType, setVerifyCompleteType] = useState<VerificationType>()
	const { state, send, subscribe } = useWebsocket()
	const [impersonatedUser, setImpersonatedUser] = useState<User>()

	/////////////////
	//  Functions  //
	/////////////////

	/**
	 * Logs user out by removing the stored login token and reloading the page.
	 */
	const logout = useCallback(() => {
		const token = localStorage.getItem("token")
		send(HubKey.AuthLogout, { token }).then(() => {
			localStorage.removeItem("token")
			window.location.reload()
		})
	}, [send])

	/**
	 * Logs a User in using their email and password.
	 */
	const loginPassword = useCallback(
		async (email: string, password: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			const resp = await send<PasswordLoginResponse, PasswordLoginRequest>(HubKey.AuthLogin, {
				email,
				password,
				admin,
			})
			if (!resp || !resp.user) {
				localStorage.clear()
				setUser(null)
				return
			}
			setUser(resp.user)
			localStorage.setItem("token", resp.token)
			setAuthorised(true)
		},
		[send, state, admin],
	)

	/**
	 * Logs a User in using their saved login token.
	 *
	 * @param token login token usually from local storage
	 */
	const loginToken = useCallback(
		async (token: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			setLoading(true)
			try {
				const resp = await send<TokenLoginResponse, TokenLoginRequest>(HubKey.AuthLoginToken, { token, admin })
				setUser(resp.user)
				setAuthorised(true)
			} catch {
				localStorage.clear()
				setUser(null)
			} finally {
				setLoading(false)
				setReconnecting(false)
			}
		},
		[send, state, admin],
	)

	/**
	 * Logs a User in using a Google oauth token
	 *
	 * @param token Google token id
	 */
	const loginGoogle = useCallback(
		async (token: string, username?: string) => {
			if (state !== WebSocket.OPEN) {
				return null
			}
			try {
				const resp = await send<PasswordLoginResponse, TokenLoginRequest>(HubKey.AuthLoginGoogle, {
					token,
					admin,
					username,
				})
				setUser(resp.user)
				if (!resp || !resp.user) {
					localStorage.clear()
					setUser(null)
					return null
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(null)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return null
		},
		[send, state, admin],
	)

	/**
	 * Logs a User in using a Facebook oauth token
	 *
	 * @param token Facebook token id
	 */
	const loginFacebook = useCallback(
		async (token: string, username?: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<PasswordLoginResponse, TokenLoginRequest>(HubKey.AuthLoginFacebook, {
					token,
					admin,
					username,
				})
				setUser(resp.user)
				if (!resp || !resp.user) {
					localStorage.clear()
					setUser(null)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(null)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state, admin],
	)

	/**
	 * Logs a User in using a Metamask public address
	 *
	 * @param token Metamask public address
	 */
	const loginMetamask = useCallback(
		async (username?: string): Promise<string | null> => {
			if (state !== WebSocket.OPEN || metaMaskState !== MetaMaskState.Active || !account) return null

			try {
				let signature = ""
				if (username === undefined || username === "") {
					signature = await sign()
				}
				const resp = await send<WalletLoginResponse, WalletLoginRequest>(HubKey.AuthLoginWallet, {
					publicAddress: account,
					signature,
					admin,
					username,
				})
				setUser(resp.user)
				if (!resp || !resp.user) {
					localStorage.clear()
					setUser(null)
					return null
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(null)
				return typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return null
		},
		[send, state, admin, account, metaMaskState, sign],
	)

	/**
	 * Logs a User in using a Twitch oauth code
	 *
	 * @param code Twitch oauth code
	 */
	const loginTwitch = useCallback(
		async (token: string, username?: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<PasswordLoginResponse, TwitchLoginRequest>(HubKey.AuthLoginTwitch, {
					token,
					username,
					website: true,
				})
				setUser(resp.user)
				if (!resp || !resp.user) {
					localStorage.clear()
					setUser(null)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(null)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state, admin],
	)

	/**
	 * Removes a User's Facebook account
	*/
	const removeFacebook = useCallback(
		async (id: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RemoveServiceResponse, RemoveServiceRequest>(HubKey.UserRemoveFacebook, {
					id, username
				})
				if (!resp || !resp.user) {
					return
				}
				setUser(resp.user)
			} catch (e) {
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state],
	)


	/**
	 * Connects a User's existing account to Facebook
	 *
	 * @param token Facebook token
	 */
	const addFacebook = useCallback(
		async (token: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<AddServiceResponse, AddServiceRequest>(HubKey.UserAddFacebook, {
					token,
				})
				if (!resp || !resp.user) {
					return
				}
				setUser(resp.user)
			} catch (e) {
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state],
	)

	/**
	 * Removes a User's Google account
	 */
	const removeGoogle = useCallback(
		async (id: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RemoveServiceResponse, RemoveServiceRequest>(HubKey.UserRemoveGoogle, {
					id, username
				})
				if (!resp || !resp.user) {
					return
				}
				setUser(resp.user)
			} catch (e) {
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state],
	)

	/**
	 * Connects a User's existing account to Google
	 *
	 * @param token Google token
	 */
	const addGoogle = useCallback(
		async (token: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<AddServiceResponse, AddServiceRequest>(HubKey.UserAddGoogle, {
					token,
				})
				if (!resp || !resp.user) {
					return
				}
				setUser(resp.user)
			} catch (e) {
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state],
	)

	/**
	 * Removes a User's Twitch account
	 */
	const removeTwitch = useCallback(
		async (id: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RemoveServiceResponse, RemoveServiceRequest>(HubKey.UserRemoveTwitch, {
					id, username
				})
				if (!resp || !resp.user) {
					return
				}
				setUser(resp.user)
			} catch (e) {
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state],
	)

	/**
	 * Connects a User's existing account to Twitch
	 *
	 * @param token Google token
	 */
	const addTwitch = useCallback(
		async (token: string, redirectURI: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<AddServiceResponse, AddTwitchRequest>(HubKey.UserAddTwitch, {
					token,
					redirectURI
				})
				if (!resp || !resp.user) {
					return
				}
				setUser(resp.user)
			} catch (e) {
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state],
	)

	/**
	 * Verifies a User and takes them to the next page.
	 */
	const verify = useCallback(
		async (token: string, forgotPassword?: boolean) => {
			if (state !== WebSocket.OPEN) {
				return
			}

			localStorage.clear()
			setUser(null)

			setVerifying(true)
			const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/verify?token=${token}${forgotPassword ? "&forgot=true" : ""}`)
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
			localStorage.setItem("token", respObj.token)
			setAuthorised(true)
			return respObj
		},
		[state],
	)

	/** Impersonate a User */
	const impersonateUser = async (user?: User) => {
		// if (user === undefined || impersonatedUser !== undefined) setImpersonatedUser(undefined)
		// if (!hasPermission(Perm.ImpersonateUser)) return
		//
		// if (!!user && !user.role?.permissions) {
		// 	// Fetch user with full details
		// 	const resp = await send<User>(HubKey.UserGet)
		// 	if (!!resp) {
		// 		setImpersonatedUser(resp)
		// 	}
		// 	return
		// }
		//
		// setImpersonatedUser(user)
	}

	/** Checks if current user has a permission */
	const hasPermission = (perm: Perm) => {
		if (impersonatedUser) return impersonatedUser.role.permissions.includes(perm)

		if (!user || !user.role || !user.role.permissions) return false
		return user.role.permissions.includes(perm)
	}

	///////////////////
	//  Use Effects  //
	///////////////////

	// Effect: Login with saved login token when websocket is ready
	useEffect(() => {
		if (user || state === WebSocket.CLOSED) return

		const token = localStorage.getItem("token")
		if (token && token !== "") {
			loginToken(token)
		} else if (loading) {
			setLoading(false)
		}
	}, [loading, user, loginToken, state])

	// Effect: Relogin as User after establishing connection again
	useEffect(() => {
		if (state !== WebSocket.OPEN) {
			setAuthorised(false)
		} else if (!authorised && !reconnecting && !loading) {
			setReconnecting(true)
			const token = localStorage.getItem("token")
			if (token && token !== "") {
				; (async () => {
					await loginToken(token)
				})()
			}
		}
	}, [state, reconnecting, authorised, loginToken, loading])

	// Effect: Setup User Subscription after login
	const id = user?.id
	useEffect(() => {
		if (!id || !subscribe || !authorised) return
		return subscribe<User>(
			HubKey.UserUpdated,
			(u) => {
				if (u.id !== id) return
				setUser(u)
			},
			{ id },
		)
	}, [id, subscribe, authorised])

	// Log out if an admin force disconnected you
	useEffect(() => {
		if (!id || !subscribe || !authorised) return
		return subscribe<any>(
			HubKey.UserForceDisconnected,
			() => {
				logout()
			},
			{ id },
		)
	}, [id, subscribe, logout, authorised])

	/////////////////
	//  Container  //
	/////////////////
	return {
		loginPassword,
		loginToken,
		loginGoogle,
		loginFacebook,
		loginTwitch,
		loginMetamask,
		addFacebook,
		addGoogle,
		addTwitch,
		removeFacebook,
		removeGoogle,
		removeTwitch,
		logout,
		verify,
		hideVerifyComplete: () => setVerifyCompleteType(undefined),
		hasPermission,
		user: impersonatedUser || user,
		setUser,
		impersonateUser,
		isImpersonatingUser: impersonatedUser !== undefined,
		loading,
		verifying,
		verifyCompleteType,
	}
})

export const AuthProvider = AuthContainer.Provider
export const useAuth = AuthContainer.useContainer
