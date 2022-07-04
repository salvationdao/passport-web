import ArrowBack from "@mui/icons-material/ArrowBack"
import { Box, Stack, TextField, Typography, useTheme } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"
import { FancyButton } from "../components/fancyButton"
import { SupremacyAuth } from "../components/supremacy/auth"
import { useAuth } from "../containers/auth"
import { colors } from "../theme"

const ResetPassword: React.FC = () => {
	const theme = useTheme()
	const searchParams = new URLSearchParams(window.location.search)
	const token = searchParams.get("token")
	const { resetPassword, resetPasswordLoading } = useAuth()
	const [error, setError] = React.useState<string | null>(null)

	const errorCallback = (msg: string) => {
		setError(msg)
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const password = data.get("password")?.toString()
		const confirmPassword = data.get("confirmPassword")?.toString()
		if (!password || !token) {
			return
		}
		if (confirmPassword !== password) {
			setError("Password does not match")
			return
		}

		await resetPassword(password, token, errorCallback)
	}
	const formatError = error?.split(" ")
	let firstWordError = ""
	if (formatError) {
		firstWordError = formatError[0]
	}
	formatError?.shift()

	return (
		<SupremacyAuth title="Reset Password">
			<Stack sx={{ mt: "2rem", borderTop: 1, borderColor: "divider", p: "2em" }}>
				<Stack component="form" onSubmit={handleSubmit} sx={{ width: "100%", minWidth: "25rem" }}>
					<Typography sx={{ textAlign: "left" }}>Enter your new password:</Typography>
					<TextField
						margin="normal"
						required
						fullWidth
						name="password"
						label="Password"
						type="password"
						id="password"
						autoComplete="current-password"
						inputProps={{ minLength: 8 }}
					/>
					<TextField
						margin="normal"
						required
						fullWidth
						name="confirmPassword"
						label="Confirm Password"
						type="password"
						id="confirmPassword"
						inputProps={{ minLength: 8 }}
						onChange={() => {
							if (error) {
								setError(null)
							}
						}}
					/>

					{formatError && (
						<Box sx={{ display: "flex" }}>
							<Typography
								component="span"
								variant="caption"
								sx={{ color: colors.errorRed, width: "fit-content", textAlign: "left", textTransform: "capitalize" }}
							>
								{firstWordError}&nbsp;
							</Typography>
							<Typography component="span" variant="caption" sx={{ color: colors.errorRed, width: "fit-content", textAlign: "left" }}>
								{formatError.join(" ")}
							</Typography>
						</Box>
					)}

					<FancyButton
						loading={resetPasswordLoading}
						submit
						fullWidth
						filled
						borderColor={theme.palette.primary.main}
						sx={{ mt: 3, mb: 2 }}
					>
						Reset Password
					</FancyButton>
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
		</SupremacyAuth>
	)
}

export default ResetPassword
