import { Stack, Typography } from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import * as React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../containers/auth"
import { colors } from "../../theme"

interface IEmailLoginProps {
	signup?: boolean
}

const EmailLogin: React.FC<IEmailLoginProps> = ({ signup }) => {
	const { loginPassword } = useAuth()
	const [passwordMatch, setPasswordMatch] = React.useState(true)

	const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const email = data.get("email")?.toString()
		const password = data.get("password")?.toString()
		const confirmPassword = data.get("confirmPassword")?.toString()

		if (confirmPassword !== password && signup) {
			setPasswordMatch(false)
		}

		if (email && password) {
			loginPassword(email, password)
		}
	}

	return (
		<Stack component="form" onSubmit={handleLogin} sx={{ width: "100%", minWidth: "25rem" }}>
			<TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" />
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
					name="password"
					label="Confirm Password"
					type="password"
					id="confirmPassword"
					inputProps={{ minLength: 8 }}
				/>
			)}
			{!passwordMatch && (
				<Typography
					component="span"
					variant="caption"
					sx={{ display: "inline-block", color: colors.errorRed, width: "fit-content", textAlign: "left" }}
				>
					Password did not match
				</Typography>
			)}
			{/* <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" /> */}

			<Button type="submit" fullWidth variant="contained" color={signup ? "secondary" : "primary"} sx={{ mt: 3, mb: 2 }}>
				{signup ? "Sign up" : "Sign In"}
			</Button>
			{!signup && (
				<Link to="/forgot-password">
					<Typography
						component="a"
						variant="caption"
						sx={{ display: "inline-block", textDecoration: "underline", color: colors.white, cursor: "pointer" }}
					>
						Forgot your password?
					</Typography>
				</Link>
			)}
		</Stack>
	)
}

export default EmailLogin
