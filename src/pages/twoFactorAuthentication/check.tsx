import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { LoadingButton } from "@mui/lab"
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { useAuth } from "../../containers/auth"
import { colors } from "../../theme"
import { TwoFactorAuthenticationCheckLogin } from "./checkLogin"

interface ITwoFactorAuthenticationCheckProps {
	setVerified?: React.Dispatch<React.SetStateAction<boolean>>
}

const searchParams = new URLSearchParams(window.location.search)
export const TwoFactorAuthenticationCheck: React.FC<ITwoFactorAuthenticationCheckProps> = ({ setVerified }) => {
	const location = useLocation()
	const history = useHistory()
	const { twoFactorAuthLogin, userID } = useAuth()
	const [code, setCode] = useState("")
	const [isRecovery, setIsRecovery] = useState(false)
	const [error, setError] = useState(searchParams.get("err"))

	const tokenGroup = useMemo(() => {
		let token = location.search.replace("?", "").split("&redirectURL")[0].replace("token=", "")
		const redirectURL = searchParams.get("redirectURL")

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
			setError(null)
			e.preventDefault()
			if (code.length === 0) {
				return
			}
			try {
				const token = setVerified ? undefined : tokenGroup.token
				const redirectURL = tokenGroup.redirectURL || ""
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

	if (!userID) {
		return <TwoFactorAuthenticationCheckLogin />
	}

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
					If you have lost access to your authenticator app, use one of the recovery codes provided to you or contact support.
				</Typography>
				<Stack onSubmit={handleSubmit} component="form" width="90%" maxWidth="400px" marginTop="20px" gap="1rem">
					<TextField
						sx={{
							mt: "1rem",
							"& *": {
								"@media (max-width:500px)": {
									font: `4vw Nostromo Regular Medium !important`,
								},
							},
						}}
						placeholder="Enter code"
						value={code}
						onChange={(e) => setCode(e.target.value)}
						inputProps={{
							style: {
								margin: "1rem auto",
								padding: "0 1rem",
								width: isRecovery ? "unset" : `${10 * 1.5}ch`,
								background: `repeating-linear-gradient(90deg, dimgrey 0, 
									 "dimgrey"
									}1ch, transparent 0, transparent 1.6ch) 0 100%/ 10ch 2px no-repeat`,
								font: isRecovery ? "2ch  Nostromo Regular Medium" : `2.4ch Nostromo Regular Medium`,
								letterSpacing: ".6ch",
								textAlign: "center",
							},
							maxLength: isRecovery ? undefined : 6,
							spellCheck: false,
						}}
						onFocus={() => {
							setError(null)
						}}
						InputProps={{ disableUnderline: true }}
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
				</Stack>

				<Button
					onClick={() => {
						setIsRecovery(!isRecovery)
						setError(null)
						setCode("")
					}}
					sx={{ textTransform: "uppercase", color: "secondary.main" }}
				>
					{isRecovery ? "Use passcode from authenticator app" : "Use a recovery code"}
				</Button>

				{error && error.length > 1 && (
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
