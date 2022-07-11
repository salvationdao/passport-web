import { useCallback, useMemo } from "react"
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
}

interface TwitterLoginProps {
	onClick?: () => Promise<void>
	onFailure?: (response: ReactTwitterFailureResponse) => void
	add?: string
	render?: (props: TwitterLoginButtonRenderProps) => JSX.Element
}

export const TwitterLogin: React.FC<TwitterLoginProps> = ({ onClick, onFailure, render, add }) => {
	const click = useCallback(async () => {
		if (onClick) {
			await onClick()
			return
		}
		const twitterParams = {
			oauth_callback: `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/auth/twitter?${add ? `add=${add}&` : ""}redirect=${
				window.location.origin
			}/redirect`,
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
		}
	}, [onFailure, onClick, add])

	const propsForRender = useMemo(
		() => ({
			onClick: click,
		}),
		[click],
	)

	if (!render) {
		throw new Error("TwitterLogin requires a render prop to render")
	}

	return render(propsForRender)
}
