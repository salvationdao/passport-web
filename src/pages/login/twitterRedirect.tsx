import { Stack, Typography } from "@mui/material"
import { useEffect, useMemo } from "react"
import { useLocation } from "react-router-dom"
import { colors } from "../../theme"

const searchParams = new URLSearchParams(window.location.search)

export const TwitterRedirect = () => {
	const location = useLocation()
	const login = searchParams.get("login")
	const tfa = searchParams.get("tfa")

	// For login
	const loginToken = useMemo(() => {
		const group = location.search.split("&issue_token=")
		const token = group[1]
		return token
	}, [location.search])

	// For signup
	const signupToken = useMemo(() => {
		if (login && tfa) return
		const group = location.search.split("?signup_token=")
		const token = group[1]
		return token
	}, [location.search, login, tfa])

	// Receives token from the url param and passes it to the parent via postMessage
	useEffect(() => {
		// // Close the window
		setTimeout(() => {
			window.close()
		}, 1200)
		if (login) {
			window.opener.postMessage({ login, issue_token: loginToken })
			return
		}
		if (tfa) {
			window.opener.postMessage({ tfa })
			return
		}
		// For signup
		if (signupToken) {
			window.opener.postMessage({ twitter_token: decodeURI(signupToken) })
			return
		}
	}, [login, tfa, signupToken, loginToken])

	return (
		<Stack alignItems="center" justifyContent="center" sx={{ height: "100vh", p: "3.8rem", backgroundColor: colors.darkNavyBackground }}>
			<Typography sx={{ textAlign: "center", fontSize: "2rem" }}>Loading...</Typography>
		</Stack>
	)
}
