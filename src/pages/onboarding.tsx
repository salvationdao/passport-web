import { Alert, Box, Button, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { useForm } from "react-hook-form"
import { Link, useHistory } from "react-router-dom"
import { ReactComponent as FacebookIcon } from "../assets/images/icons/facebook.svg"
import { ReactComponent as GoogleIcon } from "../assets/images/icons/google.svg"
import { ReactComponent as MetaMaskIcon } from "../assets/images/icons/metamask.svg"
import { ReactComponent as TwitchIcon } from "../assets/images/icons/twitch.svg"
import XSYNLogoImage from "../assets/images/XSYN Stack White.svg"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "../components/facebookLogin"
import { FancyButton } from "../components/fancyButton"
import { InputField } from "../components/form/inputField"
import { GradientCircleThing, PhaseTypes } from "../components/home/gradientCircleThing"
import { Loading } from "../components/loading"
import { LoginMetaMask } from "../components/loginMetaMask"
import { ReactTwitchFailureResponse, ReactTwitchLoginInfo, TwitchLogin } from "../components/twitchLogin"
import { useAuth } from "../containers/auth"
import { useWebsocket } from "../containers/socket"
import HubKey from "../keys"
import { colors, fonts } from "../theme"
import { RegisterResponse } from "../types/auth"

interface SignUpInput {
	username: string
	firstName?: string
	lastName?: string
	email?: string
	password?: string
}

type SignUpType = "email" | "metamask" | "google" | "facebook" | "twitch"

/**
 * Onboarding Page to Sign up New Users
 */
export const Onboarding = () => {
	const history = useHistory()
	const { send } = useWebsocket()
	const { user } = useAuth()
	const { loginFacebook, loginGoogle, loginTwitch, setUser } = useAuth()

	const [loading, setLoading] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>()

	const { control, handleSubmit, watch, trigger } = useForm<SignUpInput>()
	const username = watch("username")

	const [signUpType, setSignUpType] = useState<SignUpType | null>(null)
	const [currentStep, setCurrentStep] = useState(0)

	// For gradient circle animations
	const [animationPhase, setAnimationPhase] = useState<PhaseTypes>("default")

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

	const onTwitchLogin = async (response: any) => {
		try {
			if (!!response && !!response.status) {
				setErrorMessage(`Couldn't connect to Twitch: ${response.status}`)
				return
			}
			setErrorMessage(undefined)
			const r = response as ReactTwitchLoginInfo
			await loginTwitch(r.token, username)
		} catch (e) {
			setErrorMessage(e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onTwitchLoginFailure = (error: ReactTwitchFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Twitch.")
	}

	const renderStep1 = () => {
		switch (signUpType) {
			case "email":
				return (
					<Box component="form" onSubmit={handleSubmit(async (input) => {
						try {
							setLoading(true)
							setErrorMessage(undefined)

							const resp = await send<RegisterResponse>(HubKey.AuthRegister, input)
							setUser(resp.user)
							localStorage.setItem("token", resp.token)
						} catch (e) {
							setErrorMessage(e === "string" ? e : "Something went wrong, please try again.")
						} finally {
							setLoading(false)
						}
					})} sx={{
						"& > *:not(:last-child)": {
							marginBottom: "1rem"
						}
					}}>
						<InputField name="username" label="Username" control={control} rules={{ required: "Username is required" }} disabled={loading} variant="standard" autoFocus fullWidth />
						<InputField name="firstName" label="First Name" control={control} fullWidth variant="standard" disabled={loading} />
						<InputField name="lastName" label="Last Name" control={control} fullWidth variant="standard" disabled={loading} />
						<InputField
							name="email"
							label="Email"
							type="email"
							control={control}
							rules={{
								required: "Email is required",
								pattern: {
									value: /.+@.+\..+/,
									message: "Invalid email address",
								},
							}}
							fullWidth
							variant="standard"
							disabled={loading}
						/>
						<InputField
							name="password"
							label="Password"
							type="password"
							control={control}
							placeholder="Password"
							fullWidth
							variant="standard"
							disabled={loading}
							rules={{
								required: "Password is required",
							}}
						/>
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<Button type="button" variant="contained" onClick={() => setCurrentStep(0)} sx={(theme) => ({
								marginLeft: "auto",
								backgroundColor: theme.palette.background.paper
							})}>
								Back
							</Button>
							<Button type="submit" variant="contained" color="primary" disabled={loading}>
								Create Account
							</Button>
						</Box>
						{!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}
					</Box>
				)
			case "metamask":
				return (
					<Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()} sx={{
						"& > *:not(:last-child)": {
							marginBottom: "1rem"
						}
					}}>
						<InputField name="username" label="Username" control={control} rules={{ required: "Username is required" }} disabled={loading} variant="standard" autoFocus fullWidth />
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<Button type="button" variant="contained" onClick={() => setCurrentStep(0)} sx={(theme) => ({
								marginLeft: "auto",
								backgroundColor: theme.palette.background.paper
							})}>
								Back
							</Button>
							<LoginMetaMask
								type="submit"
								signUp
								username={username}
								onClick={async () => {
									if (!(await validUsername())) {
										return false
									}
									return true
								}}
								onFailure={onMetaMaskLoginFailure}
							/>
						</Box>
					</Box>
				)
			case "google":
				return (
					<Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()} sx={{
						"& > *:not(:last-child)": {
							marginBottom: "1rem"
						}
					}}>
						<InputField name="username" label="Username" control={control} rules={{ required: "Username is required" }} disabled={loading} variant="standard" autoFocus fullWidth />
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<Button type="button" variant="contained" onClick={() => setCurrentStep(0)} sx={(theme) => ({
								marginLeft: "auto",
								backgroundColor: theme.palette.background.paper
							})}>
								Back
							</Button>
							<GoogleLogin
								clientId="593683501366-gk7ab1nnskc1tft14bk8ebsja1bce24v.apps.googleusercontent.com"
								buttonText="Login"
								onSuccess={onGoogleLogin}
								onFailure={onGoogleLoginFailure}
								cookiePolicy={"single_host_origin"}
								render={(props) => (
									<Button
										type="submit"
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
						</Box>
					</Box>
				)
			case "facebook":
				return (
					<Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()} sx={{
						"& > *:not(:last-child)": {
							marginBottom: "1rem"
						}
					}}>
						<InputField name="username" label="Username" control={control} rules={{ required: "Username is required" }} disabled={loading} variant="standard" autoFocus fullWidth />
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<Button type="button" variant="contained" onClick={() => setCurrentStep(0)} sx={(theme) => ({
								marginLeft: "auto",
								backgroundColor: theme.palette.background.paper
							})}>
								Back
							</Button>
							<FacebookLogin
								appId="577913423867745"
								fields="email"
								callback={onFacebookLogin}
								onFailure={onFacebookLoginFailure}
								render={(props) => (
									<Button
										type="submit"
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
					</Box>
				)
			case "twitch":
				return (
					<Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()} sx={{
						"& > *:not(:last-child)": {
							marginBottom: "1rem"
						}
					}}>
						<InputField name="username" label="Username" control={control} rules={{ required: "Username is required" }} disabled={loading} variant="standard" autoFocus fullWidth />
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<Button type="button" variant="contained" onClick={() => setCurrentStep(0)} sx={(theme) => ({
								marginLeft: "auto",
								backgroundColor: theme.palette.background.paper
							})}>
								Back
							</Button>
							<TwitchLogin
								clientId="1l3xc5yczselbc4yiwdieaw0hr1oap"
								redirectUri="http://localhost:5003"
								callback={onTwitchLogin}
								onFailure={onTwitchLoginFailure}
								render={(props) => (
									<Button
										type="submit"
										title="Sign up with Twitch"
										onClick={props.onClick}
										disabled={props.isDisabled || props.isProcessing}
										startIcon={<TwitchIcon />}
										variant="contained"
									>
										Sign up with Twitch
									</Button>
								)} />
						</Box>
					</Box>

				)
		}
	}

	const renderStep0 = () => (<Box sx={{
		display: "flex",
		flexDirection: "column",
		"& > *:not(:last-child)": {
			marginBottom: "1rem"
		}
	}}>
		<FancyButton type="button" borderColor="#F6851B" onClick={() => {
			setSignUpType("metamask")
			setCurrentStep(1)
		}}
			startIcon={<MetaMaskIcon />}
			sx={(theme) => ({
				backgroundColor: theme.palette.background.paper
			})}>
			Sign up with MetaMask
		</FancyButton>
		<FancyButton type="button" borderColor={colors.white} onClick={() => {
			setSignUpType("google")
			setCurrentStep(1)
		}}
			startIcon={<GoogleIcon />}
			sx={(theme) => ({
				backgroundColor: theme.palette.background.paper
			})}>
			Sign up with Google
		</FancyButton>
		<FancyButton type="button" borderColor="#3F558C" onClick={() => {
			setSignUpType("facebook")
			setCurrentStep(1)
		}}
			startIcon={<FacebookIcon />}
			sx={(theme) => ({
				backgroundColor: theme.palette.background.paper
			})}>
			Sign up with Facebook
		</FancyButton>
		<FancyButton type="button" borderColor="#8551F6" onClick={() => {
			setSignUpType("twitch")
			setCurrentStep(1)
		}}
			startIcon={<TwitchIcon />}
			sx={(theme) => ({
				backgroundColor: theme.palette.background.paper
			})}>
			Sign up with Twitch
		</FancyButton>
		<Box sx={{
			display: "flex",
			alignItems: "center",
		}}>
			<Box component="span" sx={(theme) => ({
				minHeight: "2px",
				width: "100%",
				marginRight: "1rem",
				backgroundColor: theme.palette.primary.main,
			})} />
			Or
			<Box component="span" sx={(theme) => ({
				minHeight: "2px",
				width: "100%",
				marginLeft: "1rem",
				backgroundColor: theme.palette.primary.main,
			})} />
		</Box>
		<FancyButton borderColor={colors.white} filled onClick={() => {
			setCurrentStep(1)
			setSignUpType("email")
		}}>
			Email Signup
		</FancyButton>
	</Box>)

	useEffect(() => {
		switch (currentStep) {
			case 0:
				setAnimationPhase("default")
				break
			case 1:
				setAnimationPhase("small")
				break
		}
	}, [currentStep])

	useEffect(() => {
		if (!user) return

		const userTimeout = setTimeout(() => {
			history.push("/")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (user) {
		return <Loading text="You are already logged in, redirecting to home page..." />
	}

	return (
		<Box
			sx={{
				overflow: 'hidden',
				position: "relative",
				minHeight: "100vh",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
				padding: "3rem"
			}}
		>
			<GradientCircleThing sx={{
				zIndex: -1,
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)"
			}} phase={animationPhase} hideInner />
			<Link to="/"><Box component="img" src={XSYNLogoImage} alt="XSYN Logo" sx={{
				width: "100px",
				marginBottom: "1rem"
			}} /></Link>
			<Typography variant="h1" sx={{
				marginBottom: "1rem",
				fontFamily: fonts.bizmobold,
				fontSize: "3rem",
				textTransform: "uppercase"
			}}>{currentStep == 0 ? "Create Passport" : "Sign Up"}</Typography>
			<Box sx={{
				width: "100%",
				maxWidth: "400px"
			}}>
				{currentStep === 0 && renderStep0()}
				{currentStep === 1 && renderStep1()}
			</Box>
		</Box>
	)
}
