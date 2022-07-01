import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import * as React from "react"

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
			<TextField
				margin="normal"
				required
				fullWidth
				name="password"
				label="Password"
				type="password"
				id="password"
				autoComplete="current-password"
			/>
			{/* <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Remember me" /> */}
			<Box sx={{ display: "flex", gap: "1rem" }}>
				<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
					Sign In
				</Button>
				<Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} color="secondary">
					Register
				</Button>
			</Box>
		</Box>
	)
}

export default EmailLogin
