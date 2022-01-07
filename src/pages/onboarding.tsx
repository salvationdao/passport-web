import { useHistory } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Logo } from "../components/logo"
import { Alert, Box, Button, Paper, Typography } from "@mui/material"
import { InputField } from "../components/form/inputField"
import { Spaced } from "../components/spaced"
import HubKey from "../keys"
import { useCallback, useState } from "react"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "../components/facebookLogin"
import { ReactComponent as FacebookIcon } from "../assets/images/icons/facebook.svg"
import { useAuth } from "../containers/auth"
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { ReactComponent as GoogleIcon } from "../assets/images/icons/google.svg"
import { useWebsocket } from "../containers/socket"
import { RegisterResponse } from "../types/auth"
import { LoginMetaMask } from "../components/loginMetaMask"

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
	const { push } = useHistory()
	const { send } = useWebsocket()
	const { user } = useAuth()
	const { loginFacebook, loginGoogle, loginMetamask, setUser } = useAuth()

	const [emailSignup, setEmailSignup] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>()

	const { control, handleSubmit, watch, trigger, setError } = useForm<SignUpInput>()
	const username = watch("username")

	// email signup
	const submitHandler = handleSubmit(async (input) => {
		try {
			setLoading(true)
			setErrorMessage(undefined)

			// for email signup, check email and password isn't empty (should trigger username itself)
			if (input.email === "") {
				setError("email", { message: "Email required for email signups" })
				return
			}
			if (input.password === "") {
				setError("password", { message: "Password required for email signups" })
				return
			}

			const resp = await send<RegisterResponse>(HubKey.AuthRegister, input)
			setUser(resp.user)
			localStorage.setItem("token", resp.token)
		} catch (e) {
			setErrorMessage(e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setLoading(false)
		}
	})

	const validUsername = useCallback(async (): Promise<boolean> => {
		// check username isn't empty
		return await trigger("username")
	}, [trigger])

	// OAuth
	const onGoogleLogin = async (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
		try {
			setLoading(true)
			setErrorMessage(undefined)

			if (!!response.code) {
				setErrorMessage(`Couldn't connect to Google: ${response.code}`)
				return
			}
			setErrorMessage(undefined)
			const r = response as GoogleLoginResponse
			await loginGoogle(r.tokenId, username)
		} catch (e) {
			setErrorMessage(e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onGoogleLoginFailure = (error: Error) => {
		setErrorMessage(error.message)
	}

	const onMetaMaskLoginFailure = (error: string) => {
		setErrorMessage(error)
	}

	const onFacebookLogin = async (response: any) => {
		try {
			setLoading(true)
			setErrorMessage(undefined)

			if (!!response && !!response.status) {
				setErrorMessage(`Couldn't connect to Facebook: ${response.status}`)
				return
			}
			const r = response as ReactFacebookLoginInfo
			await loginFacebook(r.accessToken, username)
		} catch (e) {
			setErrorMessage(e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setLoading(false)
		}
	}

	const onFacebookLoginFailure = (error: ReactFacebookFailureResponse) => {
		setErrorMessage(error.status || "Failed to signup with Facebook.")
	}

	if (user) push("/")

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

				<form onSubmit={submitHandler}>
					<Typography variant="h3">Sign up</Typography>
					<InputField name="username" label="Username" control={control} rules={{ required: "Username is required." }} fullWidth disabled={loading} />
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
						<LoginMetaMask
							signUp
							username={username}
							onClick={() => {
								if (username == "") {
									setError("username", { message: "Username Cannon be empty." })
									return false
								}
								return true
							}}
							onFailure={onMetaMaskLoginFailure}
						/>
						<GoogleLogin
							clientId="593683501366-gk7ab1nnskc1tft14bk8ebsja1bce24v.apps.googleusercontent.com"
							buttonText="Login"
							onSuccess={onGoogleLogin}
							onFailure={onGoogleLoginFailure}
							cookiePolicy={"single_host_origin"}
							render={(props) => (
								<Button
									onClick={async () => {
										if (!(await validUsername())) return
										props.onClick()
									}}
									disabled={props.disabled}
									title="Sign up with Google"
									startIcon={<GoogleIcon />}
									variant="contained"
								>
									Sign up with Google
								</Button>
							)}
						/>
						<FacebookLogin
							appId="577913423867745"
							fields="email"
							callback={onFacebookLogin}
							onFailure={onFacebookLoginFailure}
							render={(props) => (
								<Button
									title="Sign Up with Facebook"
									onClick={async (event) => {
										if (!(await validUsername())) return
										props.onClick(event)
									}}
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

								<Button type="button" variant="contained" onClick={() => push("/")}>
									Cancel
								</Button>
							</Spaced>
						</>
					)}
				</form>
				{!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}
			</Paper>
		</Box>
	)
}
