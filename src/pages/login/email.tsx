import HCaptcha from "@hcaptcha/react-hcaptcha"
import { Alert, Box, Stack, TextField, Typography, useTheme } from "@mui/material"
import * as React from "react"
import { FancyButton } from "../../components/fancyButton"
import { CAPTCHA_KEY } from "../../config"
import { useAuth } from "../../containers/auth"

interface IEmailLoginProps {
	signup?: boolean
}

export const EmailLogin: React.FC<IEmailLoginProps> = ({ signup }) => {
	const theme = useTheme()
	const { loginPassword, emailSignup, captchaToken, setCaptchaToken } = useAuth()
	const [error, setError] = React.useState<string | null>(null)
	const captchaRef = React.useRef<HCaptcha>(null)

	const errorCallback = (msg: string) => {
		setError(msg)
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		setError(null)
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const email = data.get("email")?.toString()
		const password = data.get("password")?.toString()

		if (!email) {
			setError("No email has been provided")
			return
		}
		if (signup && !captchaToken) {
			setError("Please verify you are human")
			return
		}

		if (signup) {
			// Insert send verify email handler
			await emailSignup.action(email, captchaToken, errorCallback)
		} else if (password) {
			await loginPassword.action(email, password, errorCallback)
		}
	}

	const formatError = error?.split(" ")
	let firstWordError = ""
	if (formatError) {
		firstWordError = formatError[0]
	}
	formatError?.shift()

	React.useEffect(() => {
		setError(null)
	}, [signup])

	return (
		<>
			<Stack component="form" onSubmit={handleSubmit} sx={{ width: "100%", minWidth: "200px" }}>
				<TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email" autoComplete="email" />
				{!signup && (
					<TextField
						margin="normal"
						required
						fullWidth
						name="password"
						label="Password"
						type="password"
						id="password"
						autoComplete="current-password"
						inputProps={{ minLength: signup ? 8 : 0 }}
					/>
				)}

				{signup && (
					<Box sx={{ my: 3 }}>
						{!captchaToken && (
							<Typography variant="h2" sx={{ fontSize: "1rem", my: "1rem" }}>
								Please verify you are human.
							</Typography>
						)}
						<HCaptcha
							theme="dark"
							sitekey={CAPTCHA_KEY}
							ref={captchaRef}
							onVerify={(token) => {
								setCaptchaToken(token)
								setError(null)
							}}
							onExpire={() => setCaptchaToken(undefined)}
						/>
					</Box>
				)}
				{captchaToken && (
					<FancyButton
						submit
						fullWidth
						filled
						borderColor={signup ? theme.palette.secondary.main : theme.palette.primary.main}
						sx={{ mt: 1, mb: 2 }}
						loading={signup ? emailSignup.loading : loginPassword.loading}
					>
						{loginPassword.loading || emailSignup.loading ? "Loading..." : signup ? "Sign up with email" : "Sign In"}
					</FancyButton>
				)}
			</Stack>
			{formatError && (
				<Alert severity="error">
					<span style={{ textTransform: "capitalize" }}>{firstWordError}</span>&nbsp;
					{formatError.join(" ")}
				</Alert>
			)}
		</>
	)
}
