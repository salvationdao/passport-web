import { useHistory } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Logo } from "../components/logo"
import { Alert, Box, Button, Paper, Typography } from "@mui/material"
import { InputField } from "../components/form/inputField"
import { Spaced } from "../components/spaced"
import { useQuery } from "../hooks/useSend"
import HubKey from "../keys"
import { User } from "../types/types"
import { useState } from "react"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "../components/facebookLogin"
import { ReactComponent as FacebookIcon } from "../assets/images/icons/facebook.svg"
import { useAuth } from "../containers/auth"

enum SignUpMethod {
	Email,
	MetaMask,
	Google,
	Facebook,
	Twitter,
}

interface SignUpInput {
	username: string
	firstName?: string
	lastName?: string
	email?: string
	password?: string
}

/**
 * Onboarding Page to Sign up New Users
 */
export const Onboarding = () => {
	const history = useHistory()
	const { loginFacebook, loginGoogle, loginMetamask } = useAuth()
	const { control, handleSubmit, watch } = useForm<SignUpInput>()
	const { query: signUp, payload, loading, error } = useQuery<User>(HubKey.AuthRegister)
	const [emailSignup, setEmailSignup] = useState<boolean>(false)
	const success = !!payload && !error
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const username = watch("username")
	// Callback Handlers
	const submitHandler = handleSubmit((input) => {
		signUp(input)
	})

	const onGoogleLoginFailure = (error: Error) => {
		setErrorMessage(error.message)
	}

	const onFacebookLogin = async (response: any) => {
		if (!!response && !!response.status) {
			setErrorMessage(`Couldn't connect to Facebook: ${response.status}`)
			return
		}
		setErrorMessage(null)
		const r = response as ReactFacebookLoginInfo
		const err = await loginFacebook(r.accessToken, username)
		if (!!err) setErrorMessage(err)
	}

	const onFacebookLoginFailure = (error: ReactFacebookFailureResponse) => {
		setErrorMessage(error.status || "Failed to signup with Facebook.")
	}

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
							name="username"
							label="Username"
							control={control}
							rules={{ required: "Username is required." }}
							fullWidth
							disabled={loading}
						/>

						<Box
							sx={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "space-between",
								gap: "0.5rem",
								margin: "0.5rem",
							}}
						>
							<Button variant="contained" onClick={() => setEmailSignup((prev) => !prev)}>
								Email Signup
							</Button>
							<FacebookLogin
								appId="577913423867745"
								fields="email"
								callback={onFacebookLogin}
								onFailure={onFacebookLoginFailure}
								render={(props) => (
									<Button
										title="Login with Facebook"
										onClick={props.onClick}
										disabled={props.isDisabled || !props.isSdkLoaded || props.isProcessing}
										startIcon={<FacebookIcon />}
										variant="contained"
									>
										Sign Up with Facebook
									</Button>
								)}
							/>
						</Box>

						{emailSignup && (
							<>
								<InputField name="firstName" label="First Name" control={control} fullWidth disabled={loading} />

								<InputField name="lastName" label="Last Name" control={control} fullWidth disabled={loading} />

								<InputField
									name="email"
									label="Email"
									type="email"
									control={control}
									rules={{
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
							</>
						)}
					</form>
				)}
				{!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}

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
