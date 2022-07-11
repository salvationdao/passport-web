import { Stack, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { colors } from "../../theme"

/**
 * This componeny will be rendered as a page.
 * Back end opens this page with a url param "token" in an iframe.
 * This page will pass this token to the parent window (play-web) via postMessage.
 */
export const LoginRedirect = () => {
	const searchParams = new URLSearchParams(window.location.search)
	const token = searchParams.get("token")
	const bypass = searchParams.get("bypass")
	const [message, setMessage] = useState(bypass ? "Closing..." : "Logging in...")

	const failed = useCallback(() => {
		setMessage("Failed to authenticate, please close this window and try again.")
		return
	}, [])

	// Receives token from the url param and passes it to the parent via postMessage
	useEffect(() => {
		if (!token && !bypass) {
			failed()
		}
		if (token) {
			try {
				// Send the auth token to the parent
				window.opener.postMessage({ token })
			} catch {
				failed()
			}
		}

		const currentUrl = window.location.href

		const params = new URL(currentUrl).searchParams
		if (params.has("denied")) {
			failed()
		}

		// Close the window
		setTimeout(() => {
			window.close()
		}, 1200)
	}, [failed, token, bypass])

	return (
		<Stack alignItems="center" justifyContent="center" sx={{ height: "100vh", p: "3.8rem", backgroundColor: colors.darkNavyBackground }}>
			<Typography variant="h5" sx={{ textAlign: "center" }}>
				{message}
			</Typography>
		</Stack>
	)
}
