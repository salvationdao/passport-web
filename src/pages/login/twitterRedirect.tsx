import { Stack, Typography } from "@mui/material"
import { useEffect, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { colors } from "../../theme"

/**
 * This componeny will be rendered as a page.
 * Back end opens this page with a url param "token" in an iframe.
 * This page will pass this token to the parent window (play-web) via postMessage.
 */
const searchParams = new URLSearchParams(window.location.search)

export const LoginRedirect = () => {
	const location = useLocation()
	const token = searchParams.get("token")
	const verifier = searchParams.get("oauth_verifier") // only for initial login or adding connection
	const login = searchParams.get("login")
	const redirectURL = searchParams.get("redirectURL")
	const tfa = searchParams.get("tfa")

	// For signup
	const jwtToken = useMemo(() => {
		if (verifier && login && tfa) return
		const group = location.search.split("&redirectURL")
		const token = group[0].replace("?token=", "")
		return token
	}, [location.search, login, tfa, verifier])

	// Receives token from the url param and passes it to the parent via postMessage
	useEffect(() => {
		// // Close the window
		setTimeout(() => {
			window.close()
		}, 1200)
		if (login) {
			window.opener.postMessage({ login, token })
			return
		}
		if (tfa) {
			window.opener.postMessage({ tfa })
			return
		}
		if (token && verifier) {
			window.opener.postMessage({ twitter_token: token + `&oauth_verifier=${verifier}`, redirectURL })
			return
		} else if (jwtToken) {
			window.opener.postMessage({ twitter_token: decodeURI(jwtToken), redirectURL })
			return
		}
	}, [token, login, redirectURL, tfa, verifier, jwtToken])

	return (
		<Stack alignItems="center" justifyContent="center" sx={{ height: "100vh", p: "3.8rem", backgroundColor: colors.darkNavyBackground }}>
			<Typography sx={{ textAlign: "center", fontSize: "2rem" }}>Loading...</Typography>
		</Stack>
	)
}
