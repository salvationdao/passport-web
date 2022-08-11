import ArrowBack from "@mui/icons-material/ArrowBack"
import { Alert, Slide, Stack, TextField, Typography, useTheme } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"
import { FancyButton } from "../components/fancyButton"
import { SpamEmailWarning, SupremacyAuth } from "../components/supremacy/auth"
import { useAuth } from "../containers/auth"

const ForgotPassword: React.FC = () => {
	const theme = useTheme()
	const { forgotPassword } = useAuth()
	const [error, setError] = React.useState<string | null>(null)
	const [success, setSuccess] = React.useState<string | null>(null)

	const errorCallback = (msg: string) => {
		setError(msg)
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const email = data.get("email")?.toString()
		if (!email) {
			setError("No email has been set.")
			return
		}

		const successMessage = await forgotPassword.action(email, errorCallback)

		if (!error) {
			setSuccess(successMessage)
		}
	}
	const formatError = error?.split(" ")
	let firstWordError = ""
	if (formatError) {
		firstWordError = formatError[0]
	}
	formatError?.shift()

	return (
		<SupremacyAuth title="Forgot Password">
			<Slide in={true} direction="left">
				<Stack sx={{ borderTop: 1, borderColor: "divider", p: "2em" }}>
					<Stack component="form" onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: "25rem" }} onChange={() => setError(null)}>
						<Typography sx={{ textAlign: "left" }}>Enter your email address to recover your password:</Typography>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							type="email"
							autoComplete="email"
							onFocus={() => {
								if (success || error) {
									setSuccess(null)
									setError(null)
								}
							}}
						/>
						{formatError ? (
							<Alert severity="error">
								<span style={{ textTransform: "capitalize" }}>{firstWordError}</span>&nbsp;
								{formatError.join(" ")}
							</Alert>
						) : (
							success && <Alert severity="success">{success}</Alert>
						)}
						<FancyButton
							loading={forgotPassword.loading}
							submit
							fullWidth
							filled
							borderColor={theme.palette.primary.main}
							sx={{ mt: 3, mb: 2 }}
						>
							Send email
						</FancyButton>
						<SpamEmailWarning />
					</Stack>
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

export default ForgotPassword
