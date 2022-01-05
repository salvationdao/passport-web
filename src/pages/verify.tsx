import { useEffect, useState } from "react"
import { AuthContainer } from "../containers"
import { Redirect, useLocation } from "react-router"
import { Logo } from "../components/logo"
import { Alert, Box, CircularProgress } from "@mui/material"


/**
 * Verify Email Page
 */
export const Verify = () => {
	const location = useLocation()
	const searchArgs = new URLSearchParams(location.search)
	const token = searchArgs.get("token")
	const forgotPassword = searchArgs.get("forgot") === "true"

	const { loading, user: me, verify } = AuthContainer.useContainer()
	const [errorMessage, setErrorMessage] = useState<string>()

	// Automatically verify if link included code
	useEffect(() => {
		if (token === null || "") {
			setErrorMessage("Missing token")
			return
		}
		;(async () => {
			try {
				await verify(token, forgotPassword)
			} catch (e) {
				setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again or contact support.")
			}
		})()
	}, [token, forgotPassword, verify])


	// Render
	if (me) return <Redirect to="/" />

	return (
		<Box
			sx={{
				minHeight: "100vh",
				width: "100%",
				backgroundColor: "primary.main",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
			}}
		>
			<Logo />
			{loading && <CircularProgress />}
			{errorMessage && <Alert severity="error">{errorMessage}</Alert>}

		</Box>
	)
}
