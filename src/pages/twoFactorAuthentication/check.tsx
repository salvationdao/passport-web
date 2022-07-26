import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { LoadingButton } from "@mui/lab"
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { useAuth } from "../../containers/auth"
import { colors } from "../../theme"

interface ITwoFactorAuthenticationCheckProps {
	setVerified?: React.Dispatch<React.SetStateAction<boolean>>
}

const searchParams = new URLSearchParams(window.location.search)
export const TwoFactorAuthenticationCheck: React.FC<ITwoFactorAuthenticationCheckProps> = ({ setVerified }) => {
	const location = useLocation()
	const history = useHistory()
	const { twoFactorAuthLogin } = useAuth()
	const [code, setCode] = useState("")
	const [isRecovery, setIsRecovery] = useState(false)
	const [error, setError] = useState(searchParams.get("err"))

	const tokenGroup = useMemo(() => {
		let token = location.search.replace("?", "").split("&redirectURL")[0].replace("token=", "")
		const redirectURL = searchParams.get("redirectURL") || undefined

		if (token) {
			token = decodeURI(token)
		}
		return { redirectURL, token }
	}, [location])

	useEffect(() => {
		if (!tokenGroup.token || tokenGroup.token.length === 0) {
			!setVerified && window.location.replace("/")
		}
	}, [tokenGroup.token, setVerified])

	const errorCallback = useCallback((msg: string) => {
		setError(msg)
	}, [])

	const handleSubmit = useCallback(
		async (e: FormEvent) => {
			e.preventDefault()
			if (code.length === 0) {
				return
			}
			try {
				const token = !!setVerified ? undefined : tokenGroup.token
				const redirectURL = !tokenGroup.redirectURL ? undefined : tokenGroup.redirectURL
				await twoFactorAuthLogin.action(code, isRecovery, token, redirectURL, !!setVerified, errorCallback)
				if (setVerified) {
					setVerified(true)
				}
			} catch (err: any) {
				console.error(err)
				setError(err)
				if (setVerified) {
					setVerified(false)
				}
			}
		},
		[tokenGroup, errorCallback, twoFactorAuthLogin, code, isRecovery, setVerified],
	)

	// get 2fa secret
	return (
		<Box
			sx={{
				minHeight: "100%",
				width: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
				gap: "2rem",
				p: "10%",
				"@media (max-width:600px)": {
					p: "1em",
				},
			}}
		>
			<Button
				onClick={() => history.goBack()}
				sx={{
					"&>*": {
						textDecoration: "unset",
						color: colors.skyBlue,
					},
					mr: "auto",
					display: "flex",
					gap: "1rem",
				}}
			>
				<ArrowBackIcon fontSize="medium" />
				Go Back
			</Button>
			<Paper
				sx={{
					padding: "1.5rem",
					height: "100%",
					width: "calc(100% - 10%)",
					minHeight: "60vh",
					boxShadow: 2,
					display: "flex",
					flexDirection: "column",
					gap: "1rem",
					justifyContent: "center",
					alignItems: "center",
					position: "relative",
				}}
			>
				<Typography variant="h1">Two Factor Authentication</Typography>

				<Typography sx={{ maxWidth: "600px" }}>
					To proceed, please enter the passcode from your authenticator app.
					<br />
					<br />
					If you have lost access to you authenticator app, use one of the recovery codes provided to you or contact support.
				</Typography>
				<Box
					onSubmit={handleSubmit}
					component="form"
					// onSubmit={onSubmit}
					display="flex"
					width="90%"
					maxWidth="400px"
					marginTop="20px"
					justifyContent="space-between"
					gap="1rem"
				>
					<TextField
						variant="outlined"
						label={isRecovery ? "Recovery code" : "Passcode"}
						value={code}
						fullWidth
						onChange={(e) => setCode(e.target.value)}
					/>

					<LoadingButton
						type="submit"
						color={isRecovery ? "secondary" : "primary"}
						loading={twoFactorAuthLogin.loading}
						disabled={twoFactorAuthLogin.loading}
						variant="contained"
						sx={{ px: "2em" }}
					>
						Submit
					</LoadingButton>
				</Box>

				<Button
					onClick={() => {
						setIsRecovery(!isRecovery)
					}}
					sx={{ textTransform: "uppercase", color: "secondary.main" }}
				>
					{isRecovery ? "Use passcode from authenticator app" : "Use a recovery code"}
				</Button>

				{error && (
					<Alert
						severity={"error"}
						sx={{
							minWidth: "300px",
						}}
					>
						{error.charAt(0).toUpperCase() + error.slice(1)}
					</Alert>
				)}
			</Paper>
		</Box>
	)
}
