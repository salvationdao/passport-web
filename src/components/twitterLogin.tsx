import { useCallback, useEffect, useMemo, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../config"
import { getParamsFromObject } from "../helpers"

export interface ReactTwitterFailureResponse {
	status?: string
}

export interface ReactTwitterLoginResponse {
	token: string
	verifier: string
}

export interface ReactTwitterLoginState {
	isProcessing?: boolean
}

export interface TwitterLoginButtonRenderProps {
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	isProcessing: boolean
}

interface TwitterLoginProps {
	callback: (userInfo: ReactTwitterLoginResponse) => void
	onFailure?: (response: ReactTwitterFailureResponse) => void

	render?: (props: TwitterLoginButtonRenderProps) => JSX.Element
}

export const TwitterLogin: React.FC<TwitterLoginProps> = ({ callback, onFailure, render }) => {
	const [isProcessing, setIsProcessing] = useState(false)
	const [twitterOAuthPopup, setTwitterOAuthPopup] = useState<Window | null>(null)

	const click = useCallback(async () => {
		if (isProcessing) {
			return
		}

		setIsProcessing(true)

		const twitterParams = {
			oauth_callback: window.location.href.replace("/login", ""),
		}

		const href = `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/auth/twitter${getParamsFromObject(twitterParams)}`
		// Opens Twitter login page in a new window
		const width = 500
		const height = 600
		const top = window.screenY + (window.outerHeight - height) / 2.5
		const left = window.screenX + (window.outerWidth - width) / 2
		const popup = window.open(href, "Connect Twitter to XSYN Passport", `width=${width},height=${height},left=${left},top=${top},popup=1`)

		if (!popup) {
			if (onFailure) {
				onFailure({
					status: "Failed to open popup window",
				})
			}
			return
		}
		setTwitterOAuthPopup(popup)
	}, [isProcessing, onFailure])

	useEffect(() => {
		if (!twitterOAuthPopup) return

		const popupCheckTimer = setInterval(() => {
			if (!twitterOAuthPopup) {
				return
			}

			try {
				if (twitterOAuthPopup.closed) {
					throw new Error("Twitter window has been closed, aborting connection.")
				}

				// Get access token from Twitch
				const currentUrl = twitterOAuthPopup.location.href
				if (!currentUrl) return

				const params = new URL(currentUrl).searchParams
				if (params.has("denied")) {
					throw new Error("The operation was cancelled.")
				}

				const token = params.get("oauth_token")
				const verifier = params.get("oauth_verifier")

				// Return the access token to the callback function
				if (token && verifier) {
					twitterOAuthPopup.close()
					setTwitterOAuthPopup(null)
					popupCheckTimer && clearInterval(popupCheckTimer)

					callback({
						token,
						verifier,
					})
					setIsProcessing(false)
				}
			} catch (e) {
				if (onFailure && e instanceof Error && !(e instanceof DOMException)) {
					// Close popup window, clear timers etc.
					if (!twitterOAuthPopup.closed) {
						twitterOAuthPopup.close()
					}
					popupCheckTimer && clearInterval(popupCheckTimer)
					setIsProcessing(false)
					setTwitterOAuthPopup(null)
					// Call the onFailure callback
					onFailure({ status: e.message })
				}
			}
		}, 1000)

		return () => clearInterval(popupCheckTimer)
	}, [twitterOAuthPopup, callback, onFailure])

	const propsForRender = useMemo(
		() => ({
			onClick: click,
			isProcessing,
		}),
		[click, isProcessing],
	)

	if (!render) {
		throw new Error("TwitterLogin requires a render prop to render")
	}

	return render(propsForRender)
}
