import { useState, useEffect, useCallback, useMemo } from "react"

const getParamsFromObject = (params: any) =>
	"?" +
	Object.keys(params)
		.map((param) => `${param}=${window.encodeURIComponent(params[param])}`)
		.join("&")

const decodeParamForKey = (paramString: string, key: string) =>
	window.decodeURIComponent(
		paramString.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[.+*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"),
	)

const getIsMobile = () => {
	let isMobile = false

	try {
		isMobile = !!(
			(window.navigator && (window.navigator as any).standalone === true) ||
			window.matchMedia("(display-mode: standalone)").matches ||
			navigator.userAgent.match("CriOS") ||
			navigator.userAgent.match(/mobile/i)
		)
	} catch (ex) {
		// continue regardless of error
	}

	return isMobile
}

export interface ReactFacebookFailureResponse {
	status?: string
}

export interface ReactFacebookLoginInfo {
	id: string
	accessToken: string
	name?: string
	email?: string
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

interface FacebookLoginButtonRenderProps {
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	isDisabled: boolean
	isProcessing: boolean
	isSdkLoaded: boolean
}

interface FacebookLoginProps {
	appId: string
	callback(userInfo: ReactFacebookLoginInfo | ReactFacebookFailureResponse): void
	onFailure?(response: ReactFacebookFailureResponse): void

	autoLoad?: boolean
	buttonStyle?: React.CSSProperties
	containerStyle?: React.CSSProperties
	cookie?: boolean
	cssClass?: string
	disableMobileRedirect?: boolean
	fields?: string
	icon?: React.ReactNode
	isDisabled?: boolean
	language?: string
	onClick?(event: React.MouseEvent<HTMLDivElement>): void
	reAuthenticate?: boolean
	redirectUri?: string
	scope?: string
	size?: "small" | "medium" | "metro"
	textButton?: string
	typeButton?: string
	version?: string
	xfbml?: boolean
	isMobile?: boolean
	tag?: Node | React.Component<any>
	returnScopes?: boolean
	state?: string
	authType?: "reauthenticate" | "reauthorize" | "rerequest" | undefined
	responseType?: string

	render?: (props: FacebookLoginButtonRenderProps) => JSX.Element
}

export const FacebookLogin = (props: FacebookLoginProps) => {
	const {
		appId,
		xfbml,
		cookie,
		version,
		autoLoad,
		language,
		fields,
		callback,
		onFailure,
		isDisabled,
		scope,
		onClick,
		returnScopes,
		responseType,
		redirectUri,
		disableMobileRedirect,
		authType,
		state,
		isMobile,
		render,
	} = props
	const [isSdkLoaded, setIsSdkLoaded] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)

	const isRedirectedFromFb = useCallback(() => {
		const params = window.location.search
		return decodeParamForKey(params, "state") === "facebookdirect" && (decodeParamForKey(params, "code") || decodeParamForKey(params, "granted_scopes"))
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
	}, [language])

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
					onFailure({ status: response.status })
				} else {
					callback({ status: response.status })
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
		(e) => {
			if (!isSdkLoaded || isProcessing || isDisabled) {
				return
			}
			setIsProcessing(true)
			if (typeof onClick === "function") {
				onClick(e)
				if (e.defaultPrevented) {
					setIsProcessing(false)
					return
				}
			}
			const params = {
				client_id: appId,
				redirect_uri: redirectUri,
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
						onFailure({ status: "facebookNotLoaded" })
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
								onFailure({ status: "Failed to get login status" })
							}
							return
						}
					}
				})
			}
		},
		[
			isSdkLoaded,
			isProcessing,
			isDisabled,
			scope,
			onClick,
			returnScopes,
			responseType,
			redirectUri,
			disableMobileRedirect,
			authType,
			state,
			isMobile,
			appId,
			checkLoginState,
			onFailure,
		],
	)

	const propsForRender = useMemo(
		() => ({
			onClick: click,
			isDisabled: !!isDisabled,
			isProcessing,
			isSdkLoaded,
		}),
		[click, isDisabled, isProcessing, isSdkLoaded],
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

FacebookLogin.defaultProps = {
	redirectUri: typeof window !== "undefined" ? window.location.href : "/",
	scope: "public_profile,email",
	returnScopes: false,
	xfbml: false,
	cookie: false,
	authType: "",
	fields: "name",
	version: "3.1",
	language: "en_US",
	disableMobileRedirect: true,
	isMobile: getIsMobile(),
	onFailure: null,
	state: "facebookdirect",
	responseType: "code",
}
