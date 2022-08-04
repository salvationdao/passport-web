import { Stack, Typography } from "@mui/material"
import { useEffect } from "react"
import { colors } from "../../theme"

/**
 * This componeny will be rendered as a page.
 * Back end opens this page with a url param "token" in an iframe.
 * This page will pass this token to the parent window (play-web) via postMessage.
 */
const searchParams = new URLSearchParams(window.location.search)

export const LoginRedirect = () => {
	const id = searchParams.get("id")
	const login = searchParams.get("login")
	const redirectURL = searchParams.get("redirectURL")
	// Receives token from the url param and passes it to the parent via postMessage
	useEffect(() => {
		if (id) {
			window.opener.postMessage({ twitter_id: id, redirectURL })
		}

		if (login) {
			window.opener.postMessage({ login })
		}
		// Close the window
		setTimeout(() => {
			window.close()
		}, 1200)
	}, [id, login, redirectURL])

	return (
		<Stack alignItems="center" justifyContent="center" sx={{ height: "100vh", p: "3.8rem", backgroundColor: colors.darkNavyBackground }}>
			<Typography sx={{ textAlign: "center", fontSize: "2rem" }}>Loading...</Typography>
		</Stack>
	)
}
