import { nanoid } from "nanoid"
import { useCallback, useEffect, useMemo, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../config"

const getParamsFromObject = (params: any) =>
	"?" +
	Object.keys(params)
		.map((param) => `${param}=${window.encodeURIComponent(params[param])}`)
		.join("&")

export interface ReactTwitchFailureResponse {
	status?: string
}

export interface ReactTwitchLoginResponse {
	token: string
}

export interface ReactTwitchLoginState {
	isProcessing?: boolean
}

interface TwitchLoginButtonRenderProps {
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	isProcessing: boolean
}

interface TwitchLoginProps {
	callback(userInfo: ReactTwitchLoginResponse): void
	onFailure?(response: ReactTwitchFailureResponse): void

	render?: (props: TwitchLoginButtonRenderProps) => JSX.Element
}

export const TwitchLogin: React.FC<TwitchLoginProps> = ({ callback, onFailure, render }) => {
	const [isProcessing, setIsProcessing] = useState(false)
	const [twitchOAuthPopup, setTwitchOAuthPopup] = useState<Window | null>(null)
	const [state, setState] = useState<string>()

	const click = useCallback(async () => {
		if (isProcessing) {
			return
		}

		setIsProcessing(true)

		const currState = nanoid()
		setState(currState)
		const twitchParams = {
			client_id: "1l3xc5yczselbc4yiwdieaw0hr1oap",
			redirect_uri: `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}`,
			response_type: "id_token",
			state: currState,
			scope: "openid",
		}
		const href = `https://id.twitch.tv/oauth2/authorize${getParamsFromObject(twitchParams)}`
		// Opens Twitch login page in a new window
		const width = 500
		const height = 600
		const top = window.screenY + (window.outerHeight - height) / 2.5
		const left = window.screenX + (window.outerWidth - width) / 2
		const popup = window.open(href, "Connect Twitch to XSYN Passport", `width=${width},height=${height},left=${left},top=${top},popup=1`)
		if (!popup) {
			if (onFailure) {
				onFailure({
					status: "Failed to open popup window",
				})
			}
			return
		}
		setTwitchOAuthPopup(popup)
	}, [isProcessing, onFailure])

	const propsForRender = useMemo(
		() => ({
			onClick: click,
			isProcessing,
		}),
		[click, isProcessing],
	)

	useEffect(() => {
		if (!twitchOAuthPopup) return

		const popupCheckTimer = setInterval(() => {
			if (!twitchOAuthPopup) {
				return
			}

			try {
				if (twitchOAuthPopup.closed) {
					throw new Error("Twitch window has been closed, aborting connection.")
				}

				// Get access token from Twitch
				const currentUrl = twitchOAuthPopup.location.href
				if (!currentUrl) return

				const errorParams = new URL(currentUrl).searchParams
				if (errorParams.has("error")) {
					throw new Error("The operation was cancelled.")
				}

				const fragment = window.location.origin + "?" + twitchOAuthPopup.location.hash.split("#")[1]
				const searchParams = new URL(fragment).searchParams
				const token = searchParams.get("id_token")
				const incomingState = searchParams.get("state")
				// Protect against XSRF attacks
				if (incomingState !== state) {
					throw new Error("Something went wrong. Please try again.")
				}

				// Return the access token to the callback function
				if (token) {
					twitchOAuthPopup.close()
					setTwitchOAuthPopup(null)
					popupCheckTimer && clearInterval(popupCheckTimer)

					callback({
						token,
					})
					setIsProcessing(false)
				}
			} catch (e) {
				if (onFailure && e instanceof Error && !(e instanceof DOMException)) {
					// Close popup window, clear timers etc.
					if (!twitchOAuthPopup.closed) {
						twitchOAuthPopup.close()
					}
					popupCheckTimer && clearInterval(popupCheckTimer)
					setIsProcessing(false)
					setTwitchOAuthPopup(null)
					// Call the onFailure callback
					onFailure({ status: e.message })
				}
			}
		}, 1000)

		return () => clearInterval(popupCheckTimer)
	}, [twitchOAuthPopup, callback, onFailure, state])

	if (!render) {
		throw new Error("TwitchLogin requires a render prop to render")
	}

	return render(propsForRender)
}
