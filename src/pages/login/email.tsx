import * as React from "react"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import TextField from "@mui/material/TextField"
import FormControlLabel from "@mui/material/FormControlLabel"
import Checkbox from "@mui/material/Checkbox"
import Link from "@mui/material/Link"
import Grid from "@mui/material/Grid"
import Box from "@mui/material/Box"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import Typography from "@mui/material/Typography"
import Container from "@mui/material/Container"

const EmailLogin = () => {
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		console.log({
			email: data.get("email"),
			password: data.get("password"),
		})
	}

	return (
		<Box component="form" onSubmit={handleSubmit}>
			<TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus />
			<TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" />
			<FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" />
			<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
				Sign In
			</Button>
		</Box>
	)
}

export default EmailLogin
