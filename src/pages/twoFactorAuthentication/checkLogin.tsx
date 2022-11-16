import ArrowBack from "@mui/icons-material/ArrowBack"
import { LoadingButton } from "@mui/lab"
import { Alert, Button, Slide, Stack, TextField, Typography, useTheme } from "@mui/material"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { SupremacyAuth } from "../../components/supremacy/auth"
import { useAuth } from "../../containers/auth"

interface ITwoFactorAuthenticationCheckProps {
	setVerified?: React.Dispatch<React.SetStateAction<boolean>>
}

const searchParams = new URLSearchParams(window.location.search)
export const TwoFactorAuthenticationCheckLogin: React.FC<ITwoFactorAuthenticationCheckProps> = ({ setVerified }) => {
	const location = useLocation()
	const theme = useTheme()
	const { twoFactorAuthLogin } = useAuth()
	const [code, setCode] = useState("")
	const [isRecovery, setIsRecovery] = useState(false)
	const [error, setError] = useState<string | null>(null)

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
			setError(null)
			e.preventDefault()
			if (code.length === 0) {
				return
			}
			try {
				const token = setVerified ? undefined : tokenGroup.token
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
		<SupremacyAuth title="Two Factor Authentication">
			<Slide in={true} direction="left">
				<Stack
					sx={{
						borderTop: 1,
						borderColor: "divider",
						alignItems: "center",
						gap: "1rem",
						maxWidth: "30rem",
						py: "2em",
						position: "relative",
					}}
				>
					<Typography sx={{ maxWidth: "450px" }}>
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
				</Stack>
			</Slide>
			<Link to="/login">
				<Typography
					component="span"
					sx={{
						position: "absolute",
						bottom: "1rem",
						left: "1rem",
						color: theme.palette.secondary.main,
						display: "flex",
						alignItems: "center",
						gap: "1rem",
						transition: "all .2s",
						"&:hover": {
							borderBottom: `1px solid ${theme.palette.secondary.main}`,
						},
						"@media (max-height:400px)": {
							position: "static",
						},
					}}
				>
					<ArrowBack /> Back to login page
				</Typography>
			</Link>
		</SupremacyAuth>
	)
}
