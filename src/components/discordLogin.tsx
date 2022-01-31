import { nanoid } from "nanoid"
import { useCallback, useEffect, useMemo, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../containers/socket"

const getParamsFromObject = (params: any) =>
	"?" +
	Object.keys(params)
		.map((param) => `${param}=${window.encodeURIComponent(params[param])}`)
		.join("&")

export interface ReactDiscordFailureResponse {
	status?: string
}

export interface ReactDiscordLoginResponse {
	code: string
}

export interface ReactDiscordLoginState {
	isProcessing?: boolean
}

interface DiscordLoginButtonRenderProps {
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	isProcessing: boolean
}

interface DiscordLoginProps {
	callback(userInfo: ReactDiscordLoginResponse): void
	onFailure?(response: ReactDiscordFailureResponse): void

	render?: (props: DiscordLoginButtonRenderProps) => JSX.Element
}

export const DiscordLogin: React.FC<DiscordLoginProps> = ({ callback, onFailure, render }) => {
	const [isProcessing, setIsProcessing] = useState(false)
	const [discordOAuthPopup, setDiscordOAuthPopup] = useState<Window | null>(null)
	const [state, setState] = useState<string>()

	const click = useCallback(async () => {
		if (isProcessing) {
			return
		}

		setIsProcessing(true)

		const currState = nanoid()
		setState(currState)
		const discordParams = {
			client_id: "935036501983645816",
			redirect_uri: `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}`,
			response_type: "code",
			state: currState,
			scope: "identify",
			prompt: "consent",
		}
		const href = `https://discord.com/api/oauth2/authorize${getParamsFromObject(discordParams)}`
		// Opens Discord login page in a new window
		const width = 500
		const height = 600
		const top = window.screenY + (window.outerHeight - height) / 2.5
		const left = window.screenX + (window.outerWidth - width) / 2
		const popup = window.open(href, "Connect Discord to XSYN Passport", `width=${width},height=${height},popup=1`)
		if (!popup) {
			if (onFailure) {
				onFailure({
					status: "Failed to open popup window",
				})
			}
			return
		}
		setDiscordOAuthPopup(popup)
	}, [isProcessing, onFailure])

	const propsForRender = useMemo(
		() => ({
			onClick: click,
			isProcessing,
		}),
		[click, isProcessing],
	)

	useEffect(() => {
		if (!discordOAuthPopup) return

		const popupCheckTimer = setInterval(() => {
			if (!discordOAuthPopup) {
				return
			}

			try {
				if (discordOAuthPopup.closed) {
					throw new Error("Discord window has been closed, aborting connection.")
				}

				// Get access token from Discord
				const currentUrl = discordOAuthPopup.location.href
				if (!currentUrl) return

				const params = new URL(currentUrl).searchParams
				if (params.has("error")) {
					throw new Error("The operation was cancelled.")
				}

				const code = params.get("code")
				const incomingState = params.get("state")
				// Protect against XSRF attacks
				if (incomingState !== state) {
					console.log(true)
					throw new Error("Something went wrong. Please try again.")
				}

				// Return the code to the callback function
				if (code) {
					discordOAuthPopup.close()
					setDiscordOAuthPopup(null)
					popupCheckTimer && clearInterval(popupCheckTimer)

					callback({
						code,
					})
					setIsProcessing(false)
				}
			} catch (e) {
				if (onFailure && e instanceof Error && !(e instanceof DOMException)) {
					// Close popup window, clear timers etc.
					if (!discordOAuthPopup.closed) {
						discordOAuthPopup.close()
					}
					popupCheckTimer && clearInterval(popupCheckTimer)
					setIsProcessing(false)
					setDiscordOAuthPopup(null)
					// Call the onFailure callback
					onFailure({ status: e.message })
				}
			}
		}, 1000)

		return () => clearInterval(popupCheckTimer)
	}, [discordOAuthPopup, callback, onFailure, state])

	if (!render) {
		throw new Error("DiscordLogin requires a render prop to render")
	}

	return render(propsForRender)
}
