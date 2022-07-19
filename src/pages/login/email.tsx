import { Alert, Stack, Typography, useTheme } from "@mui/material"
import TextField from "@mui/material/TextField"
import * as React from "react"
import { Link } from "react-router-dom"
import { FancyButton } from "../../components/fancyButton"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { colors } from "../../theme"

interface IEmailLoginProps {
	signup?: boolean
}

export const EmailLogin: React.FC<IEmailLoginProps> = ({ signup }) => {
	const theme = useTheme()
	const { loginPassword, signupPassword } = useAuth()
	const { displayMessage } = useSnackbar()
	const [error, setError] = React.useState<string | null>(null)

	const errorCallback = (msg: string) => {
		setError(msg)
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		setError(null)
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const email = data.get("email")?.toString()
		const password = data.get("password")?.toString()
		const confirmPassword = data.get("confirmPassword")?.toString()

		if (confirmPassword !== password && signup) {
			setError("Password does not match")
			return
		}
		if (!email || !password) {
			setError("No email or password has been set.")
			return
		}
		if (signup) {
			const username = data.get("username")?.toString()
			username && (await signupPassword.action(username, email, password, errorCallback))
			displayMessage("A confirmation email was sent to your address. Please verify your email account.")
		} else {
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
		<Stack component="form" onSubmit={handleSubmit} sx={{ width: "100%", minWidth: "25rem" }}>
			{signup && (
				<TextField
					margin="normal"
					required
					fullWidth
					name="username"
					label="Username"
					type="text"
					id="username"
					inputProps={{ maxLength: 30 }}
					onChange={() => {
						if (error) {
							setError(null)
						}
					}}
				/>
			)}
			<TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email" autoComplete="email" />
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
			{signup && (
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
			)}
			{formatError && (
				<Alert severity="error">
					<span style={{ textTransform: "capitalize" }}>{firstWordError}</span>&nbsp;
					{formatError.join(" ")}
				</Alert>
			)}
			{/* <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" /> */}

			<FancyButton
				submit
				fullWidth
				filled
				borderColor={signup ? theme.palette.secondary.main : theme.palette.primary.main}
				sx={{ mt: 3, mb: 2 }}
				loading={loginPassword.loading}
			>
				{loginPassword.loading ? "Loading..." : signup ? "Sign up" : "Sign In"}
			</FancyButton>
			{!signup && (
				<Link to="/forgot-password">
					<Typography
						component="span"
						sx={{
							display: "inline-block",
							textDecoration: "underline",
							color: colors.white,
							cursor: "pointer",
							"&:hover": {
								color: theme.palette.secondary.main,
							},
						}}
					>
						Forgot your password?
					</Typography>
				</Link>
			)}
		</Stack>
	)
}
