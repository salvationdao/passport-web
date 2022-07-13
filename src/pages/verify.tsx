import { Alert, Stack, Typography } from "@mui/material"
import React, { useEffect, useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { XSYNLogo } from "../assets"
import { FancyButton } from "../components/fancyButton"
import { API_ENDPOINT_HOSTNAME } from "../config"
import { colors } from "../theme"

const VerifyEmail: React.FC = () => {
	const location = useLocation()
	const tokenGroup = useMemo(() => {
		const group = location.search.split("&token=")
		const tokenId = group[0].replace("?id=", "")
		const token = group[1]
		return { id: tokenId, token }
	}, [location.search])

	const [success, setSuccess] = useState<boolean | null>(null)
	const [response, setResponse] = useState<string | null>(null)

	useEffect(() => {
		;(async () => {
			try {
				const res = await fetch(
					`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/auth/verify?id=${tokenGroup.id}&token=${encodeURIComponent(
						tokenGroup.token,
					)}`,
				)
				if (res.status !== 200) {
					throw await res.clone().json()
				}
				setSuccess(true)
				setResponse("Success! Your email's been verified!")
			} catch (err: any) {
				console.error(err)
				setResponse(err.message)
				setSuccess(false)
			}
		})()
	}, [tokenGroup])

	return (
		<Stack sx={{ background: colors.black2Background, height: "100%", justifyContent: "center", alignItems: "center" }}>
			<XSYNLogo />
			<Typography variant="h1" sx={{ mt: "2rem" }}>
				Verify Email
			</Typography>
			<Stack sx={{ mt: "2rem", borderTop: 1, borderColor: "divider", p: "2em" }}>
				<Stack
					sx={{
						width: "100%",
						minWidth: "25rem",
						gap: "2rem",
						"& > *": {
							textDecoration: "unset",
						},
					}}
				>
					{response && <Alert severity={success ? "success" : "error"}>{response}</Alert>}
					<Link to="/">
						<FancyButton
							sx={{
								width: "100%",
								color: colors.white,
								background: colors.darkNavyBackground,
							}}
						>
							Go to passport homepage
						</FancyButton>
					</Link>
				</Stack>
			</Stack>
		</Stack>
	)
}

export default VerifyEmail
