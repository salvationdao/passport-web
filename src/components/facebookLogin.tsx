import { useCallback, useEffect, useMemo, useState } from "react"
import { getIsMobile, getParamsFromObject } from "../helpers"
import { API_ENDPOINT_HOSTNAME } from "./../config"

const decodeParamForKey = (paramString: string, key: string) =>
	window.decodeURIComponent(
		paramString.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[.+*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"),
	)
export interface ReactFacebookFailureResponse {
	status: string
}

export interface ReactFacebookLoginInfo {
	id: string
	accessToken: string
	first_name: string
	email: string
	picture?: {
		data: {
			height?: number
			is_silhouette?: boolean
			url?: string
			width?: number
		}
	}
}

export interface ReactFacebookLoginState {
	isSdkLoaded?: boolean
	isProcessing?: boolean
}

export interface FacebookLoginButtonRenderProps {
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	isProcessing: boolean
	isSdkLoaded: boolean
}

interface FacebookLoginProps {
	callback(userInfo: ReactFacebookLoginInfo | ReactFacebookFailureResponse): void
	onFailure?: (err: string) => void
	render?: (props: FacebookLoginButtonRenderProps) => JSX.Element
}

export const FacebookLogin: React.FC<FacebookLoginProps> = ({ callback, onFailure, render }) => {
	const [isSdkLoaded, setIsSdkLoaded] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)
	const appId = "628321385187603"
	const language = "en_US"
	const fields = "email,first_name,last_name"
	const version = "3.1"
	const xfbml = false
	const cookie = false
	const scope = "public_profile,email"
	const returnScopes = false
	const authType = undefined
	const disableMobileRedirect = true
	const isMobile = getIsMobile()
	const state = "facebookdirect"
	const responseType = "code"
	const autoLoad = false

	const isRedirectedFromFb = useCallback(() => {
		const params = window.location.search
		return (
			decodeParamForKey(params, "state") === "facebookdirect" &&
			(decodeParamForKey(params, "code") || decodeParamForKey(params, "granted_scopes"))
		)
	}, [])

	const loadSdkAsynchronously = useCallback(() => {
		;((d, s, id) => {
			const element: any = d.getElementsByTagName(s)[0]
			const fjs = element
			let js = element
			if (d.getElementById(id)) {
				return
			}
			js = d.createElement(s)
			js.id = id
			js.src = `https://connect.facebook.net/${language}/sdk.js`
			fjs.parentNode.insertBefore(js, fjs)
		})(document, "script", "facebook-jssdk")
	}, [])

	const responseApi = useCallback(
		(authResponse) => {
			window.FB.api("/me", { locale: language, fields }, (me: ReactFacebookLoginInfo) => {
				Object.assign(me, authResponse)
				callback(me)
			})
		},
		[language, fields, callback],
	)

	const checkLoginState = useCallback(
		(response) => {
			setIsProcessing(false)
			if (response.authResponse) {
				responseApi(response.authResponse)
			} else {
				if (onFailure) {
					const errMsg = "Failed to login through Facebook"
					onFailure(errMsg)
				} else {
					callback(response.status)
				}
			}
		},
		[responseApi, onFailure, callback],
	)

	const checkLoginAfterRefresh = useCallback(
		(response) => {
			if (response.status === "connected") {
				checkLoginState(response)
			} else {
				window.FB.login((loginResponse) => checkLoginState(loginResponse))
			}
		},
		[checkLoginState],
	)

	const setFbAsyncInit = useCallback(() => {
		;(window as any).fbAsyncInit = () => {
			window.FB.init({
				version: `v${version}`,
				appId,
				xfbml,
				cookie,
			})
			setIsSdkLoaded(true)
			if (autoLoad || isRedirectedFromFb()) {
				window.FB.getLoginStatus(checkLoginAfterRefresh)
			}
		}
	}, [appId, xfbml, cookie, version, autoLoad, isRedirectedFromFb, checkLoginAfterRefresh])

	const click = useCallback(
		async (e) => {
			if (!isSdkLoaded || isProcessing) {
				return
			}
			setIsProcessing(true)
			const params = {
				client_id: appId,
				redirect_uri: `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}`,
				state,
				return_scopes: returnScopes,
				scope,
				response_type: responseType,
				auth_type: authType,
			}
			if (isMobile && !disableMobileRedirect) {
				window.location.href = `https://www.facebook.com/dialog/oauth${getParamsFromObject(params)}`
			} else {
				if (!window.FB) {
					if (onFailure) {
						onFailure("facebookNotLoaded")
					}
					return
				}

				window.FB.getLoginStatus((response) => {
					if (response.status === "connected") {
						checkLoginState(response)
					} else {
						try {
							window.FB.login(checkLoginState, {
								scope,
								return_scopes: returnScopes,
								auth_type: params.auth_type,
							})
						} catch (e) {
							if (onFailure) {
								onFailure("Failed to get login status")
							}
							return
						}
					}
				})
			}
		},
		[isSdkLoaded, isProcessing, checkLoginState, onFailure, authType, disableMobileRedirect, isMobile, returnScopes],
	)

	const propsForRender = useMemo(
		() => ({
			onClick: click,
			isProcessing,
			isSdkLoaded,
		}),
		[click, isProcessing, isSdkLoaded],
	)

	useEffect(() => {
		if (document.getElementById("facebook-jssdk")) {
			setIsSdkLoaded(true)
			return
		}
		setFbAsyncInit()
		loadSdkAsynchronously()
		let fbRoot = document.getElementById("fb-root")
		if (!fbRoot) {
			fbRoot = document.createElement("div")
			fbRoot.id = "fb-root"
			document.body.appendChild(fbRoot)
		}
	}, [setFbAsyncInit, loadSdkAsynchronously])

	useEffect(() => {
		if (isSdkLoaded && autoLoad) {
			window.FB.getLoginStatus(checkLoginAfterRefresh)
		}
	}, [isSdkLoaded, autoLoad, checkLoginAfterRefresh])

	if (!render) {
		throw new Error("FacebookLogin requires a render prop to render")
	}

	return render(propsForRender)
}
