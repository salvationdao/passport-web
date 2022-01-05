import { useHistory } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Logo } from "../components/logo"
import { Alert } from "@mui/material"
import { Button, Typography, Paper } from "@mui/material"
import { InputField } from "../components/form/inputField"
import { Spaced } from "../components/spaced"
import { useQuery } from "../hooks/useSend"
import HubKey from "../keys"
import { User } from "../types/types"
import { Box } from "@mui/material"

interface SignUpInput {
	firstName: string
	lastName: string
	email: string
	password: string
}

/**
 * Onboarding Page to Sign up New Users
 */
export const Onboarding = () => {
	const history = useHistory()
	const { control, handleSubmit } = useForm<SignUpInput>()
	const { query: signUp, payload, loading, error } = useQuery<User>(HubKey.AuthRegister)
	const success = !!payload && !error

	// Callback Handlers
	const submitHandler = handleSubmit((input) => {
		signUp(input)
	})

	// Render
	return (
		<Box
			sx={{
				minHeight: "100vh",
				width: "100%",
				backgroundColor: "primary.main",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
			}}
		>
			<Logo />

			<Paper
				sx={{
					padding: "1.5rem 1.5rem 0.5rem",
					width: "70%",
					maxWidth: "600px",
					boxShadow: 2,
					"& .MuiFormControl-root": {
						marginTop: "0.5rem",
					},
				}}
			>
				{/* Onboard Form */}
				{!success && (
					<form onSubmit={submitHandler}>
						<Typography variant="h3">Sign up</Typography>

						<InputField
							name="firstName"
							label="First Name"
							control={control}
							rules={{ required: "First Name is required." }}
							fullWidth
							disabled={loading}
						/>

						<InputField
							name="lastName"
							label="Last Name"
							control={control}
							rules={{ required: "Last Name is required." }}
							fullWidth
							disabled={loading}
						/>

						<InputField
							name="email"
							label="Email"
							type="email"
							control={control}
							rules={{
								required: "Email is required.",
								pattern: {
									value: /.+@.+\..+/,
									message: "Invalid email address",
								},
							}}
							fullWidth
							disabled={loading}
						/>

						<InputField
							name="password"
							label="Password"
							type="password"
							control={control}
							rules={{ required: "Please enter a password." }}
							placeholder="Password"
							fullWidth
							disabled={loading}
						/>

						<Spaced alignRight height="60px">
							<Button type="submit" variant="contained" color="primary" disabled={loading}>
								Create Account
							</Button>

							<Button type="button" variant="contained" onClick={() => history.push("/")}>
								Cancel
							</Button>

							{!!error && <Alert severity="error">{error}</Alert>}
						</Spaced>
					</form>
				)}
				{/* Onboard Complete */}
				{!!payload && success && (
					<>
						<Typography variant="h3">Verify Your Email Address</Typography>
						<Typography sx={{ margin: "10px 0" }}>
							<span>{"We now need to verify your email address. We've sent an email to "}</span>
							<Box component="span" sx={{ color: "primary.main" }}>
								{payload.email}
							</Box>
							<span>{" to verify it. Please click the link in that email to continue."}</span>
						</Typography>
						<Button type="button" variant="contained" color="primary" onClick={() => history.push("/verify")} sx={{ marginBottom: "0.5rem" }}>
							Verify Email
						</Button>
					</>
				)}
			</Paper>
		</Box>
	)
}
