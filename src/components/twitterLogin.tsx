import { useCallback, useEffect, useMemo, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../config"
import { useAuth } from "../containers/auth"
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
}

interface TwitterLoginProps {
	onClick?: () => Promise<void>
	onFailure?: (response: ReactTwitterFailureResponse) => void
	add?: string
	render?: (props: TwitterLoginButtonRenderProps) => JSX.Element
}
const searchParams = new URLSearchParams(window.location.search)
const tenant = searchParams.get("tenant")

export const TwitterLogin: React.FC<TwitterLoginProps> = ({ onClick, onFailure, render, add }) => {
	const [twitterPopup, setTwitterPopup] = useState<Window | undefined>()
	const { handleAuthCheck } = useAuth()

	const click = useCallback(async () => {
		if (onClick) {
			await onClick()
			return
		}
		const twitterParams = {
			oauth_callback: `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/auth/twitter?${add ? `add=${add}&` : ""}redirect=${
				window.location.origin
			}/twitter-redirect${tenant ? `&tenant=${tenant}` : ""}`,
		}

		const href = `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/auth/twitter${getParamsFromObject(twitterParams)}`
		// Opens Twitter login page in a new window
		const width = 500
		const height = 600
		const top = window.screenY + (window.outerHeight - height) / 2.5
		const left = window.screenX + (window.outerWidth - width) / 2
		const popup = window.open(
			href,
			"Connect Twitter to XSYN Passport",
			`width=${width},height=${height},left=${left},top=${top},popup=1`,
		) as Window

		if (!popup) {
			if (onFailure) {
				onFailure({
					status: "Failed to open popup window",
				})
			}
			return
		} else {
			setTwitterPopup(popup)
		}
	}, [onFailure, onClick, add])

	const propsForRender = useMemo(
		() => ({
			onClick: click,
		}),
		[click],
	)

	useEffect(() => {
		if (!twitterPopup) return
		const timer = setInterval(async () => {
			if (twitterPopup.closed) {
				await handleAuthCheck(true)
				clearInterval(timer)
			}
		}, 1000)

		return () => {
			clearInterval(timer)
		}
	}, [twitterPopup, handleAuthCheck])

	if (!render) {
		throw new Error("TwitterLogin requires a render prop to render")
	}

	return render(propsForRender)
}
