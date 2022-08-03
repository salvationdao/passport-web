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
	// Receives token from the url param and passes it to the parent via postMessage
	useEffect(() => {
		window.opener.postMessage({ twitter_id: id })
		// Close the window
		setTimeout(() => {
			window.close()
		}, 1200)
	}, [id])

	return (
		<Stack alignItems="center" justifyContent="center" sx={{ height: "100vh", p: "3.8rem", backgroundColor: colors.darkNavyBackground }}>
			<Typography sx={{ textAlign: "center", fontSize: "2rem" }}>Loading...</Typography>
		</Stack>
	)
}
