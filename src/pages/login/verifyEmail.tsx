import ArrowBack from "@mui/icons-material/ArrowBack"
import { Alert, Slide, Stack, TextField, Typography, useTheme } from "@mui/material"
import React, { useState } from "react"
import { Link, Redirect, useHistory } from "react-router-dom"
import { FancyButton } from "../../components/fancyButton"
import { SpamEmailWarning, SupremacyAuth } from "../../components/supremacy/auth"
import { AuthTypes, useAuth } from "../../containers/auth"

const EmailSignupVerify: React.FC = () => {
	const theme = useTheme()
	const history = useHistory()
	const { emailCode, setSignupRequest } = useAuth()
	const [verifyCode, setVerifyCode] = useState("")
	const [error, setError] = React.useState<string | null>(null)
	const [success, setSuccess] = React.useState<string | null>(null)

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!verifyCode || !emailCode) {
			setError("No code has been set.")
			return
		}
		if (verifyCode.toLowerCase() !== emailCode.code?.toLowerCase()) {
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
				<Stack sx={{ borderTop: 1, borderColor: "divider", p: "2em" }}>
					<Stack component="form" onSubmit={handleSubmit} sx={{ width: "100%", minWidth: "25rem" }}>
						<Typography sx={{ textAlign: "center" }}>
							A verifying code was sent to your email. <br />
							Please enter it below:
						</Typography>

						<TextField
							sx={{ mt: "1rem" }}
							placeholder="Enter code"
							value={verifyCode}
							onChange={(e) => setVerifyCode(e.target.value)}
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
							disabled={verifyCode.length !== 5}
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
					<Link to="/login?signup=true">
						<Typography
							component="span"
							sx={{
								position: "absolute",
								bottom: 0,
								left: "1rem",
								color: theme.palette.secondary.main,
								display: "flex",
								alignItems: "center",
								gap: "1rem",
								transition: "all .2s",
								"&:hover": {
									borderBottom: `1px solid ${theme.palette.secondary.main}`,
								},
							}}
						>
							<ArrowBack /> Back to login page
						</Typography>
					</Link>
				</Stack>
			</Slide>
		</SupremacyAuth>
	)
}

export default EmailSignupVerify
