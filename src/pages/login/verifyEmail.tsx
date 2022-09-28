import ArrowBack from "@mui/icons-material/ArrowBack"
import { Alert, Slide, Stack, TextField, Typography, useTheme } from "@mui/material"
import React, { useState } from "react"
import { Redirect, useHistory } from "react-router-dom"
import { FancyButton } from "../../components/fancyButton"
import { SpamEmailWarning, SupremacyAuth } from "../../components/supremacy/auth"
import { AuthTypes, useAuth } from "../../containers/auth"

const EmailSignupVerify: React.FC = () => {
	const theme = useTheme()
	const history = useHistory()
	const { emailCode, setSignupRequest, verifyCode } = useAuth()
	const [code, setCode] = useState("")
	const [error, setError] = React.useState<string | null>(null)
	const [success, setSuccess] = React.useState<string | null>(null)

	const errorCallback = (msg: string) => {
		setError(msg)
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!code || !emailCode) {
			setError("No code has been set.")
			return
		}
		if (!emailCode.token) {
			setError("No code has been set.")
			return
		}
		// Validate code
		const success = await verifyCode.action(emailCode?.token, code.toLowerCase(), errorCallback)

		if (!success) {
			setError("Incorrect code. Please try again.")
		} else {
			setSignupRequest({ email: emailCode.email, auth_type: AuthTypes.Email })
			history.push("/signup")
		}
	}
	const formatError = error?.split(" ")
	let firstWordError = ""
	if (formatError) {
		firstWordError = formatError[0]
	}
	formatError?.shift()

	if (!emailCode) {
		return <Redirect to="/login?signup=true" />
	}
	return (
		<SupremacyAuth title="Verify Email Signup">
			<Slide in={true} direction="left">
				<Stack sx={{ borderTop: 1, borderColor: "divider", p: "2em 1em" }}>
					<Stack component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: "28rem" }}>
						<Typography sx={{ textAlign: "center" }}>
							A verifying code was sent to your email. <br />
							Please enter it below:
						</Typography>

						<TextField
							sx={{
								mt: "1rem",
								"@media (max-width:600px)": {
									"& *": {
										fontSize: "1.5ch !important",
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
									width: `${10 * 1.5}ch`,
									background: `repeating-linear-gradient(90deg, dimgrey 0, 
									 "dimgrey"
									}1ch, transparent 0, transparent 1.6ch) 0 100%/ 10ch 2px no-repeat`,
									font: `2.4ch Nostromo Regular Medium`,
									letterSpacing: ".6ch",
									textAlign: "center",
								},
								maxLength: 5,
								spellCheck: false,
							}}
							onFocus={() => {
								if (success || error) {
									setSuccess(null)
									setError(null)
								}
							}}
							InputProps={{ disableUnderline: true }}
						/>

						{formatError && (
							<Alert severity="error">
								<span style={{ textTransform: "capitalize" }}>{firstWordError}</span>&nbsp;
								{formatError.join(" ")}
							</Alert>
						)}
						{success && <Alert severity="success">{success}</Alert>}
						<FancyButton
							// loading={forgotPassword.loading}
							disabled={code.length !== 5}
							submit
							fullWidth
							filled
							borderColor={theme.palette.secondary.main}
							sx={{ mt: 3, mb: 2 }}
						>
							Submit
						</FancyButton>
						<SpamEmailWarning />
					</Stack>
					<Typography
						component="span"
						sx={{
							position: "absolute",
							bottom: "2rem",
							left: "2rem",
							color: theme.palette.secondary.main,
							display: "flex",
							alignItems: "center",
							cursor: "pointer",
							gap: "1rem",
							transition: "all .2s",
							"&:hover": {
								borderBottom: `1px solid ${theme.palette.secondary.main}`,
							},
						}}
						onClick={() => history.goBack()}
					>
						<ArrowBack /> Back to login page
					</Typography>
				</Stack>
			</Slide>
		</SupremacyAuth>
	)
}

export default EmailSignupVerify
