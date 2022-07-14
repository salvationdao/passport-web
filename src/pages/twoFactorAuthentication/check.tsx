import { LoadingButton } from "@mui/lab"
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { useAuth } from "../../containers/auth"
import { usePassportCommandsUser } from "../../hooks/usePassport"

export const TwoFactorAuthenticationCheck = () => {
	const { send } = usePassportCommandsUser("/commander")
	const { token } = useParams<{ token: string }>()
	const { twoFactorAuthLogin, setUser } = useAuth()
	const history = useHistory()
	const [showSecretCode, setShowSecretCode] = useState(false)
	const [passcode, setPasscode] = useState("")
	const [isRecovery, setIsRecovery] = useState(false)
	const [error, setError] = useState<string>()
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!token || token.length === 0) {
			window.location.replace("/")
		}
	}, [token])

	const errorCallback = useCallback((msg: string) => {
		setError(msg)
	}, [])

	const verifyPasscode = useCallback(async () => {
		try {
			await twoFactorAuthLogin.action(token, errorCallback)
		} catch (err: any) {
			console.error(err)
			setError(err)
		}
	}, [token, errorCallback, twoFactorAuthLogin])

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
			}}
		>
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

				<Typography sx={{ maxWidth: "600px", textAlign: "center" }}>
					To proceed, please enter the passcode from your authenticator app.
					<br />
					<br />
					If you have lost access to you authenticator app, use one of the recovery codes provided to you or contact support.
				</Typography>
				<Box
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
						fullWidth
						onChange={(e) => setPasscode(e.target.value)}
					/>

					<LoadingButton color={isRecovery ? "secondary" : "primary"} loading={loading} variant="contained" sx={{ px: "2em" }}>
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
						{error}
					</Alert>
				)}
			</Paper>
		</Box>
	)
}
