import { useState } from "react"
import { Spread } from "./spread"
import { AuthContainer } from "../containers/auth"
import { Spaced } from "./spaced"
import { Redirect } from "react-router-dom"
import { ForgotPasswordModal } from "./forgotPassword"
import { Button, CircularProgress, Alert, Box } from "@mui/material"
import { InputField } from "./form/inputField"
import { useForm } from "react-hook-form"

export const Login = ({ admin }: { admin?: boolean }) => {
	const { loginPassword, loading, user } = AuthContainer.useContainer()
	const { control, handleSubmit } = useForm<{
		email: string
		password: string
	}>({
		defaultValues: {
			email: process.env.NODE_ENV !== "production" ? (admin ? "superadmin@example.com" : "member@example.com") : "",
			password: process.env.NODE_ENV !== "production" ? "NinjaDojo_!" : "",
		},
	})
	const [showForgotPass, setShowForgotPass] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const submitHandler = handleSubmit(async ({ email, password }) => {
		try {
			await loginPassword(email, password)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	})

	if (user) return <Redirect to={"/"} />

	return (
		<>
			<form onSubmit={submitHandler}>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						marginBottom: "10px",
					}}
				>
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
						placeholder="Your email"
						fullWidth
						disabled={loading}
						sx={{ marginBottom: "0.5rem" }}
					/>

					<InputField
						name="password"
						label="Password"
						type="password"
						control={control}
						rules={{ required: "Password is required." }}
						placeholder="Your password"
						fullWidth
						disabled={loading}
					/>
				</Box>

				{errorMessage && (
					<Alert severity="error" sx={{ mb: "10px", maxWidth: "600px" }}>
						{errorMessage}
					</Alert>
				)}

				<Spread>
					<Button onClick={() => setShowForgotPass(true)}>Forgot Password</Button>
					<Spaced>
						{loading && <CircularProgress />}
						<Button type="submit" variant="contained" color="primary">
							Log in
						</Button>
					</Spaced>
				</Spread>
			</form>
			<ForgotPasswordModal isOpen={showForgotPass} onClose={() => setShowForgotPass(false)} />
		</>
	)
}
