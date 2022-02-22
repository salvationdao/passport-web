import { useSnackbar } from "./snackbar"
import { useCallback, useEffect, useState } from "react"
import { createContainer } from "unstated-next"
import { API_ENDPOINT_HOSTNAME } from "../config"
import HubKey from "../keys"
import {
	AddDiscordRequest,
	AddServiceRequest,
	AddServiceResponse,
	AddTwitchRequest,
	AddTwitterRequest,
	DiscordLoginRequest,
	DiscordSignUpRequest,
	FacebookLoginRequest,
	FacebookSignUpRequest,
	GoogleLoginRequest,
	GoogleSignUpRequest,
	PasswordLoginRequest,
	PasswordLoginResponse,
	RegisterResponse,
	RemoveServiceRequest,
	RemoveServiceResponse,
	TokenLoginRequest,
	TokenLoginResponse,
	TwitchLoginRequest,
	TwitchSignUpRequest,
	TwitterLoginRequest,
	TwitterSignUpRequest,
	VerifyAccountResponse,
	WalletLoginRequest,
	WalletSignUpRequest,
} from "../types/auth"
import { Perm } from "../types/enums"
import { User } from "../types/types"
import { useWebsocket } from "./socket"
import { MetaMaskState, useWeb3 } from "./web3"

export enum VerificationType {
	EmailVerification,
	ForgotPassword,
}

/**
 * A Container that handles Authorisation
 */
export const AuthContainer = createContainer(() => {
	const { metaMaskState, sign, signWalletConnect, account, connect } = useWeb3()
	const [user, setUser] = useState<User>()
	const [authorised, setAuthorised] = useState(false)
	const [reconnecting, setReconnecting] = useState(false)
	const [loading, setLoading] = useState(true) // wait for loading current login state to complete first
	const [verifying, setVerifying] = useState(false)
	const [verifyCompleteType, setVerifyCompleteType] = useState<VerificationType>()
	const { state, send, subscribe } = useWebsocket()
	const { displayMessage } = useSnackbar()
	const [showSimulation, setShowSimulation] = useState(false)

	// const [impersonatedUser, setImpersonatedUser] = useState<User>()

	const [sessionID, setSessionID] = useState("")

	const isLogoutPage = window.location.pathname.startsWith("/nosidebar/logout")

	/////////////////
	//  Functions  //
	/////////////////

	/**
	 * Logs user out by removing the stored login token and reloading the page.
	 */
	const logout = useCallback(() => {
		const token = localStorage.getItem("token")
		return send(HubKey.AuthLogout, { token, sessionID }).then(() => {
			localStorage.removeItem("token")
			if (!isLogoutPage) {
				window.location.reload()
			}
			return true
		})
	}, [send, isLogoutPage, sessionID])

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
				sessionID,
			})
			if (!resp || !resp.user || !resp.token) {
				localStorage.clear()
				setUser(undefined)
				return
			}
			setUser(resp.user)
			localStorage.setItem("token", resp.token)
			setAuthorised(true)
		},
		[send, state, sessionID],
	)

	/**
	 * Logs a User in using their saved login token.
	 *
	 * @param token login token usually from local storage
	 */
	const loginToken = useCallback(
		async (token: string) => {
			const searchParams = new URLSearchParams(window.location.search)

			if (state !== WebSocket.OPEN) {
				return
			}
			setLoading(true)
			try {
				const resp = await send<TokenLoginResponse, TokenLoginRequest>(HubKey.AuthLoginToken, {
					token,
					sessionID,
					twitchExtensionJWT: searchParams.get("twitchExtensionJWT"),
				})
				setUser(resp.user)
				setAuthorised(true)
			} catch {
				localStorage.clear()
				setUser(undefined)
			} finally {
				setLoading(false)
				setReconnecting(false)
			}
		},
		[send, state, sessionID],
	)

	/**
	 * Signs a user up using a Metamask public address
	 */
	const signUpMetamask = useCallback(
		async (username: string): Promise<string | undefined> => {
			if (state !== WebSocket.OPEN || metaMaskState !== MetaMaskState.Active || !account) return undefined

			try {
				const resp = await send<RegisterResponse, WalletSignUpRequest>(HubKey.AuthSignUpWallet, {
					publicAddress: account,
					username,
					sessionID,
				})
				setUser(resp.user)
				if (!resp || !resp.user) {
					localStorage.clear()
					setUser(undefined)
					return undefined
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				return typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return undefined
		},
		[send, state, account, metaMaskState, sessionID],
	)

	/**
	 * Logs a User in using a Metamask public address
	 *
	 * @param token Metamask public address
	 */
	const loginMetamask = useCallback(async () => {
		if (state !== WebSocket.OPEN) return undefined

		try {
			await connect()
			const signature = await sign()
			if (account) {
				const resp: PasswordLoginResponse = await send<PasswordLoginResponse, WalletLoginRequest>(HubKey.AuthLoginWallet, {
					publicAddress: account,
					signature,
					sessionID,
				})
				if (!resp || !resp.user || !resp.token) {
					localStorage.clear()
					setUser(undefined)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)

				return resp
			}
		} catch (e) {
			localStorage.clear()
			setUser(undefined)
			console.error(e)
			typeof e === "string" && displayMessage(e, "error")
		}
	}, [send, state, account, sign, sessionID, connect])

	/**
	 * Logs a User in using a Wallet Connect public address
	 *
	 * @param token Wallet Connect public address
	 */
	const loginWalletConnect = useCallback(async () => {
		if (state !== WebSocket.OPEN) return undefined
		try {
			const signature = await signWalletConnect()
			const resp = await send<PasswordLoginResponse, WalletLoginRequest>(HubKey.AuthLoginWallet, {
				publicAddress: account as string,
				signature,
				sessionID,
			})
			if (!resp || !resp.user || !resp.token) {
				localStorage.clear()
				setUser(undefined)
				return
			}
			setUser(resp.user)
			localStorage.setItem("token", resp.token)
			setAuthorised(true)
			return resp
		} catch (e) {
			localStorage.clear()
			setUser(undefined)
			console.error(e)
			typeof e === "string" && displayMessage(e, "error")
		}
	}, [send, state, account, sessionID, signWalletConnect])

	/**
	 * Signs a user up using a Google oauth token
	 */
	const signUpGoogle = useCallback(
		async (token: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return undefined
			}
			try {
				const resp = await send<RegisterResponse, GoogleSignUpRequest>(HubKey.AuthSignUpGoogle, {
					token,
					username,
					sessionID,
				})
				setUser(resp.user)
				if (!resp || !resp.user) {
					localStorage.clear()
					setUser(undefined)
					return undefined
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return undefined
		},
		[send, state, sessionID],
	)

	/**
	 * Logs a User in using a Google oauth token
	 */
	const loginGoogle = useCallback(
		async (token: string) => {
			if (state !== WebSocket.OPEN) {
				return undefined
			}
			try {
				const resp = await send<PasswordLoginResponse, GoogleLoginRequest>(HubKey.AuthLoginGoogle, {
					token,
					sessionID,
				})
				if (!resp || !resp.user || !resp.token) {
					localStorage.clear()
					setUser(undefined)
					return undefined
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)

				return resp
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
		},
		[send, state, sessionID],
	)

	/**
	 * Signs a user up using a Facebook oauth token
	 */
	const signUpFacebook = useCallback(
		async (token: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RegisterResponse, FacebookSignUpRequest>(HubKey.AuthSignUpFacebook, {
					token,
					username,
					sessionID,
				})
				setUser(resp.user)
				if (!resp || !resp.user) {
					localStorage.clear()
					setUser(undefined)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state, sessionID],
	)

	/**
	 * Logs a User in using a Facebook oauth token
	 *
	 * @param token Facebook token id
	 */
	const loginFacebook = useCallback(
		async (token: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<PasswordLoginResponse, FacebookLoginRequest>(HubKey.AuthLoginFacebook, {
					token,
					sessionID,
				})
				if (!resp || !resp.user || !resp.token) {
					localStorage.clear()
					setUser(undefined)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)

				return resp
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
		},
		[send, state, sessionID],
	)

	/**
	 * Signs a user up using a Twitch JWT
	 */
	const signUpTwitch = useCallback(
		async (token: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RegisterResponse, TwitchSignUpRequest>(HubKey.AuthSignUpTwitch, {
					token,
					username,
					sessionID,
					website: true,
				})
				setUser(resp.user)
				if (!resp || !resp.user) {
					localStorage.clear()
					setUser(undefined)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state, sessionID],
	)

	/**
	 * Logs a User in using a Twitch JWT
	 */
	const loginTwitch = useCallback(
		async (token: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<PasswordLoginResponse, TwitchLoginRequest>(HubKey.AuthLoginTwitch, {
					token,
					sessionID,
					website: true,
				})
				if (!resp || !resp.user || !resp.token) {
					localStorage.clear()
					setUser(undefined)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)

				return resp
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
		},
		[send, state, sessionID],
	)

	/**
	 * Signs a user up using a Twitter OAuth token and verifier
	 */
	const signUpTwitter = useCallback(
		async (oauthToken: string, oauthVerifier: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RegisterResponse, TwitterSignUpRequest>(HubKey.AuthSignUpTwitter, {
					oauthToken,
					oauthVerifier,
					username,
					sessionID,
				})
				setUser(resp.user)
				if (!resp || !resp.user) {
					localStorage.clear()
					setUser(undefined)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state, sessionID],
	)

	/**
	 * Logs a User in using a Twitter OAuth code
	 */
	const loginTwitter = useCallback(
		async (oauthToken: string, oauthVerifier: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<PasswordLoginResponse, TwitterLoginRequest>(HubKey.AuthLoginTwitter, {
					oauthToken,
					oauthVerifier,
					sessionID,
				})
				if (!resp || !resp.user || !resp.token) {
					localStorage.clear()
					setUser(undefined)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)

				return resp
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
		},
		[send, state, sessionID],
	)

	/**
	 * Signs a new user up using a Discord OAuth code
	 */
	const signUpDiscord = useCallback(
		async (code: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RegisterResponse, DiscordSignUpRequest>(HubKey.AuthSignUpDiscord, {
					code,
					username,
					sessionID,
					redirectURI: `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}`,
				})
				setUser(resp.user)
				if (!resp || !resp.user) {
					localStorage.clear()
					setUser(undefined)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, state, sessionID],
	)

	/**
	 * Logs a user in using a Discord OAuth code
	 */
	const loginDiscord = useCallback(
		async (code: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<PasswordLoginResponse, DiscordLoginRequest>(HubKey.AuthLoginDiscord, {
					code,
					sessionID,
					redirectURI: `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}`,
				})
				if (!resp || !resp.user || !resp.token) {
					localStorage.clear()
					setUser(undefined)
					return
				}
				setUser(resp.user)
				localStorage.setItem("token", resp.token)
				setAuthorised(true)

				return resp
			} catch (e) {
				localStorage.clear()
				setUser(undefined)
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
		},
		[send, state, sessionID],
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
					id,
					username,
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
	 * Removes a User's Facebook account
	 */
	const removeFacebook = useCallback(
		async (id: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RemoveServiceResponse, RemoveServiceRequest>(HubKey.UserRemoveFacebook, {
					id,
					username,
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
	 * Removes a User's Twitch account
	 */
	const removeTwitch = useCallback(
		async (id: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RemoveServiceResponse, RemoveServiceRequest>(HubKey.UserRemoveTwitch, {
					id,
					username,
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
	 */
	const addTwitch = useCallback(
		async (token: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<AddServiceResponse, AddTwitchRequest>(HubKey.UserAddTwitch, {
					token,
					website: true,
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
	 * Removes a User's Twitter account
	 */
	const removeTwitter = useCallback(
		async (id: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RemoveServiceResponse, RemoveServiceRequest>(HubKey.UserRemoveTwitter, {
					id,
					username,
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
	 * Connects a User's existing account to Twitter
	 */
	const addTwitter = useCallback(
		async (oauthToken: string, oauthVerifier: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<AddServiceResponse, AddTwitterRequest>(HubKey.UserAddTwitter, {
					oauthToken,
					oauthVerifier,
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
	 * Removes a User's Discord account
	 */
	const removeDiscord = useCallback(
		async (id: string, username: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<RemoveServiceResponse, RemoveServiceRequest>(HubKey.UserRemoveDiscord, {
					id,
					username,
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
	 * Connects a User's existing account to Discord
	 *
	 * @param token Google token
	 */
	const addDiscord = useCallback(
		async (code: string) => {
			if (state !== WebSocket.OPEN) {
				return
			}
			try {
				const resp = await send<AddServiceResponse, AddDiscordRequest>(HubKey.UserAddDiscord, {
					code,
					redirectURI: `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}`,
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
			setUser(undefined)

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
		if (user || isLogoutPage || state === WebSocket.CLOSED) return

		const token = localStorage.getItem("token")
		if (!isLogoutPage && token && token !== "") {
			loginToken(token)
		} else if (loading) {
			setLoading(false)
		}
	}, [loading, user, loginToken, state, isLogoutPage])

	// Effect: Relogin as User after establishing connection again
	useEffect(() => {
		if (state !== WebSocket.OPEN) {
			setAuthorised(false)
		} else if (!authorised && !reconnecting && !loading) {
			setReconnecting(true)
			const token = localStorage.getItem("token")
			if (token && token !== "") {
				;(async () => {
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

	// close web page if it is a iframe login through gamebar
	useEffect(() => {
		if (authorised && sessionID && !isLogoutPage) {
			window.close()
		}
	}, [authorised, sessionID, isLogoutPage])

	/////////////////
	//  Container  //
	/////////////////
	return {
		loginPassword,
		loginToken,
		signUpMetamask,
		signUpGoogle,
		signUpFacebook,
		signUpTwitch,
		signUpTwitter,
		signUpDiscord,
		loginMetamask,
		loginWalletConnect,
		loginGoogle,
		loginFacebook,
		loginTwitch,
		loginTwitter,
		loginDiscord,
		addFacebook,
		addGoogle,
		addTwitch,
		addTwitter,
		addDiscord,
		removeFacebook,
		removeGoogle,
		removeTwitch,
		removeTwitter,
		removeDiscord,
		logout,
		verify,
		hideVerifyComplete: () => setVerifyCompleteType(undefined),
		hasPermission,
		user: user,
		userID: user?.id,
		factionID: user?.factionID,
		setUser,
		isImpersonatingUser: false,
		loading,
		verifying,
		verifyCompleteType,
		setSessionID,
		sessionID,
	}
})

export const AuthProvider = AuthContainer.Provider
export const useAuth = AuthContainer.useContainer
