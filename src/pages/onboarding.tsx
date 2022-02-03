import UploadIcon from "@mui/icons-material/Upload"
import { Alert, Avatar, Box, BoxProps, Button, Link, Snackbar, styled, Typography, useTheme } from "@mui/material"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useMutation } from "react-fetching-library"
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { useForm } from "react-hook-form"
import { Link as RouterLink, Route, Switch, useHistory, useRouteMatch } from "react-router-dom"
import { DiscordIcon, FacebookIcon, GoogleIcon, MetaMaskIcon, TwitchIcon, TwitterIcon, XSYNLogo } from "../assets"
import { DiscordLogin, ReactDiscordFailureResponse, ReactDiscordLoginResponse } from "../components/discordLogin"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "../components/facebookLogin"
import { FancyButton } from "../components/fancyButton"
import { InputField } from "../components/form/inputField"
import { GradientCircleThing, PhaseTypes } from "../components/home/gradientCircleThing"
import { Loading } from "../components/loading"
import { LoginMetaMask } from "../components/loginMetaMask"
import { Transition, TransitionState } from "../components/transition"
import { ReactTwitchFailureResponse, ReactTwitchLoginResponse, TwitchLogin } from "../components/twitchLogin"
import { ReactTwitterFailureResponse, ReactTwitterLoginResponse, TwitterLogin } from "../components/twitterLogin"
import { AuthContainer, useAuth } from "../containers/auth"
import { useWebsocket } from "../containers/socket"
import { fetching } from "../fetching"
import { formatBytes } from "../helpers"
import HubKey from "../keys"
import { colors, fonts } from "../theme"
import { RegisterResponse } from "../types/auth"
import { User } from "../types/types"

interface SignUpInput {
	username: string
	firstName?: string
	lastName?: string
	email?: string
	password?: string
}

export type ConnectionType = "email" | "metamask" | "google" | "facebook" | "twitch" | "twitter" | "discord"

export const Onboarding: React.FC = () => {
	const { path } = useRouteMatch()

	return (
		<Switch>
			<Route exact path={`${path}`} component={SignUp} />
			<Route path={`${path}/upload`} component={PassportReady} />
		</Switch>
	)
}

/**
 * Onboarding Page to Sign up New Users
 */
const SignUp = () => {
	const history = useHistory()
	const { send } = useWebsocket()
	const { user } = useAuth()
	const { signUpFacebook, signUpGoogle, signUpTwitch, signUpTwitter, signUpDiscord, setUser } = useAuth()

	const [loading, setLoading] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>()

	const { control, handleSubmit, watch, trigger, reset } = useForm<SignUpInput>()
	const username = watch("username")
	const password = watch("password")

	const [signUpType, setSignUpType] = useState<ConnectionType | null>(null)
	const [currentStep, setCurrentStep] = useState(0)

	// For gradient circle animations
	const [animationPhase, setAnimationPhase] = useState<PhaseTypes>("default")

	const validUsername = useCallback(async (): Promise<boolean> => {
		// check username isn't empty
		return await trigger("username")
	}, [trigger])

	// OAuth
	const onMetaMaskLoginFailure = (error: string) => {
		setErrorMessage(error)
	}

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
			await signUpGoogle(r.tokenId, username)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onGoogleLoginFailure = (error: Error) => {
		setErrorMessage(error.message)
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
			await signUpFacebook(r.accessToken, username)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setLoading(false)
		}
	}
	const onFacebookLoginFailure = (error: ReactFacebookFailureResponse) => {
		setErrorMessage(error.status || "Failed to signup with Facebook.")
	}

	const onTwitchLogin = async (response: ReactTwitchLoginResponse) => {
		try {
			setErrorMessage(undefined)
			await signUpTwitch(response.token, username)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onTwitchLoginFailure = (error: ReactTwitchFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Twitch.")
	}

	const onTwitterLogin = async (response: ReactTwitterLoginResponse) => {
		try {
			setErrorMessage(undefined)
			await signUpTwitter(response.token, response.verifier, username)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onTwitterLoginFailure = (error: ReactTwitterFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Twitter.")
	}

	const onDiscordLogin = async (response: ReactDiscordLoginResponse) => {
		try {
			setErrorMessage(undefined)
			await signUpDiscord(response.code, username)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onDiscordLoginFailure = (error: ReactDiscordFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Discord.")
	}

	const onBack = () => {
		// Reset errors, but persist form values
		reset(undefined, {
			keepValues: true,
		})
		setCurrentStep((prevStep) => Math.max(prevStep - 1, 0))
	}

	const renderStep2 = () => {
		switch (signUpType) {
			case "email":
				return (
					<Box
						component="form"
						onSubmit={handleSubmit(async (input) => {
							try {
								setLoading(true)
								setErrorMessage(undefined)

								const resp = await send<RegisterResponse>(HubKey.AuthRegister, input)
								setUser(resp.user)
								localStorage.setItem("token", resp.token)
							} catch (e) {
								setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
							} finally {
								setLoading(false)
							}
						})}
						sx={{
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<InputField
							autoFocus
							name="password"
							label="Password"
							type="password"
							control={control}
							placeholder="Password"
							fullWidth
							variant="filled"
							disabled={loading}
							rules={{
								required: "Password is required",
							}}
						/>
						<Box>
							Your password must:
							<ul>
								<PasswordRequirement fulfilled={!!password && password.length >= 8}>be 8 or more characters long</PasswordRequirement>
								<PasswordRequirement fulfilled={!!password && password.toUpperCase() !== password && password.toLowerCase() !== password}>
									contain <strong>upper</strong> &#38; <strong>lower</strong> case letters
								</PasswordRequirement>
								<PasswordRequirement fulfilled={!!password && /\d/.test(password)}>
									contain at least <strong>1 number</strong>
								</PasswordRequirement>
								<PasswordRequirement fulfilled={!!password && /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)}>
									contain at least <strong>1 symbol</strong>
								</PasswordRequirement>
							</ul>
						</Box>
						<Box
							sx={{
								display: "flex",
								"& > *:not(:last-child)": {
									marginRight: ".5rem",
								},
							}}
						>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<FancyButton
								type="submit"
								disabled={loading}
								sx={{
									flexGrow: 1,
								}}
							>
								Create Account
							</FancyButton>
						</Box>
					</Box>
				)
		}

		return null
	}

	const renderStep1 = () => {
		switch (signUpType) {
			case "email":
				return (
					<Box
						component="form"
						onSubmit={async (e: any) => {
							e.preventDefault()
							const isStepValid = await trigger()
							if (!isStepValid) return
							setCurrentStep(2)
						}}
						sx={{
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<InputField
							name="username"
							label="Username"
							control={control}
							rules={{ required: "Username is required" }}
							disabled={loading}
							variant="filled"
							autoFocus
							fullWidth
						/>
						<InputField name="firstName" label="First Name" control={control} fullWidth variant="filled" disabled={loading} />
						<InputField name="lastName" label="Last Name" control={control} fullWidth variant="filled" disabled={loading} />
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
							variant="filled"
							disabled={loading}
						/>
						<Box
							sx={{
								display: "flex",
								"& > *:not(:last-child)": {
									marginRight: ".5rem",
								},
							}}
						>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<FancyButton
								type="submit"
								disabled={loading}
								sx={{
									flexGrow: 1,
								}}
							>
								Next
							</FancyButton>
						</Box>
					</Box>
				)
			case "metamask":
				return (
					<Box
						component="form"
						onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
						sx={{
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<InputField
							name="username"
							label="Username"
							control={control}
							rules={{ required: "Username is required" }}
							disabled={loading}
							variant="filled"
							autoFocus
							fullWidth
						/>
						<Box
							sx={{
								display: "flex",
								"& > *:not(:last-child)": {
									marginRight: ".5rem",
								},
							}}
						>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<LoginMetaMask
								type="submit"
								signUp={{
									username,
								}}
								onClick={async () => {
									if (!(await validUsername())) {
										return false
									}
									return true
								}}
								onFailure={onMetaMaskLoginFailure}
								sx={{
									flexGrow: 1,
								}}
							/>
						</Box>
					</Box>
				)
			case "google":
				return (
					<Box
						component="form"
						onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
						sx={{
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<InputField
							name="username"
							label="Username"
							control={control}
							rules={{ required: "Username is required" }}
							disabled={loading}
							variant="filled"
							autoFocus
							fullWidth
						/>
						<Box
							sx={{
								display: "flex",
								"& > *:not(:last-child)": {
									marginRight: ".5rem",
								},
							}}
						>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<GoogleLogin
								clientId="467953368642-8cobg822tej2i50ncfg4ge1pm4c5v033.apps.googleusercontent.com"
								onSuccess={onGoogleLogin}
								onFailure={onGoogleLoginFailure}
								cookiePolicy={"single_host_origin"}
								render={(props) => (
									<FancyButton
										type="submit"
										onClick={async () => {
											if (!(await validUsername())) return
											props.onClick()
										}}
										loading={props.disabled}
										disabled={props.disabled}
										title="Sign up with Google"
										startIcon={<GoogleIcon />}
										sx={{
											flexGrow: 1,
										}}
									>
										Sign up with Google
									</FancyButton>
								)}
							/>
						</Box>
					</Box>
				)
			case "facebook":
				return (
					<Box
						component="form"
						onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
						sx={{
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<InputField
							name="username"
							label="Username"
							control={control}
							rules={{ required: "Username is required" }}
							disabled={loading}
							variant="filled"
							autoFocus
							fullWidth
						/>
						<Box
							sx={{
								display: "flex",
								"& > *:not(:last-child)": {
									marginRight: ".5rem",
								},
							}}
						>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<FacebookLogin
								callback={onFacebookLogin}
								onFailure={onFacebookLoginFailure}
								render={(props) => (
									<FancyButton
										type="submit"
										title="Sign Up with Facebook"
										onClick={async (event) => {
											if (!(await validUsername())) return
											props.onClick(event)
										}}
										loading={!props.isSdkLoaded || props.isProcessing}
										startIcon={<FacebookIcon />}
										sx={{
											flexGrow: 1,
										}}
									>
										Sign Up with Facebook
									</FancyButton>
								)}
							/>
						</Box>
					</Box>
				)
			case "twitch":
				return (
					<Box
						component="form"
						onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
						sx={{
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<InputField
							name="username"
							label="Username"
							control={control}
							rules={{ required: "Username is required" }}
							disabled={loading}
							variant="filled"
							autoFocus
							fullWidth
						/>
						<Box
							sx={{
								display: "flex",
								"& > *:not(:last-child)": {
									marginRight: ".5rem",
								},
							}}
						>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<TwitchLogin
								callback={onTwitchLogin}
								onFailure={onTwitchLoginFailure}
								render={(props) => (
									<FancyButton
										type="submit"
										title="Sign up with Twitch"
										onClick={async (event) => {
											if (!(await validUsername())) return
											props.onClick(event)
										}}
										loading={props.isProcessing}
										startIcon={<TwitchIcon />}
										sx={{
											flexGrow: 1,
										}}
									>
										Sign up with Twitch
									</FancyButton>
								)}
							/>
						</Box>
					</Box>
				)
			case "twitter":
				return (
					<Box
						component="form"
						onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
						sx={{
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<InputField
							name="username"
							label="Username"
							control={control}
							rules={{ required: "Username is required" }}
							disabled={loading}
							variant="filled"
							autoFocus
							fullWidth
						/>
						<Box
							sx={{
								display: "flex",
								"& > *:not(:last-child)": {
									marginRight: ".5rem",
								},
							}}
						>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<TwitterLogin
								callback={onTwitterLogin}
								onFailure={onTwitterLoginFailure}
								render={(props) => (
									<FancyButton
										type="submit"
										title="Sign up with Twitter"
										onClick={async (event) => {
											if (!(await validUsername())) return
											props.onClick(event)
										}}
										loading={props.isProcessing}
										startIcon={<TwitterIcon />}
										sx={{
											flexGrow: 1,
										}}
									>
										Sign up with Twitter
									</FancyButton>
								)}
							/>
						</Box>
					</Box>
				)
			case "discord":
				return (
					<Box
						component="form"
						onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
						sx={{
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<InputField
							name="username"
							label="Username"
							control={control}
							rules={{ required: "Username is required" }}
							disabled={loading}
							variant="filled"
							autoFocus
							fullWidth
						/>
						<Box
							sx={{
								display: "flex",
								"& > *:not(:last-child)": {
									marginRight: ".5rem",
								},
							}}
						>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<DiscordLogin
								callback={onDiscordLogin}
								onFailure={onDiscordLoginFailure}
								render={(props) => (
									<FancyButton
										type="submit"
										title="Sign up with Discord"
										onClick={async (event) => {
											if (!(await validUsername())) return
											props.onClick(event)
										}}
										loading={props.isProcessing}
										startIcon={<DiscordIcon />}
										sx={{
											flexGrow: 1,
										}}
									>
										Sign up with Discord
									</FancyButton>
								)}
							/>
						</Box>
					</Box>
				)
		}
	}

	const renderStep0 = () => (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				"& > *:not(:last-child)": {
					marginBottom: "1rem",
				},
			}}
		>
			<FancyButton
				type="button"
				borderColor={colors.metamaskOrange}
				onClick={() => {
					setSignUpType("metamask")
					setCurrentStep(1)
				}}
				startIcon={<MetaMaskIcon />}
			>
				Sign up with MetaMask
			</FancyButton>
			<FancyButton
				type="button"
				borderColor={colors.white}
				onClick={() => {
					setSignUpType("google")
					setCurrentStep(1)
				}}
				startIcon={<GoogleIcon />}
			>
				Sign up with Google
			</FancyButton>
			<FancyButton
				type="button"
				borderColor={colors.facebookBlue}
				onClick={() => {
					setSignUpType("facebook")
					setCurrentStep(1)
				}}
				startIcon={<FacebookIcon />}
			>
				Sign up with Facebook
			</FancyButton>
			<FancyButton
				type="button"
				borderColor={colors.twitchPurple}
				onClick={() => {
					setSignUpType("twitch")
					setCurrentStep(1)
				}}
				startIcon={<TwitchIcon />}
			>
				Sign up with Twitch
			</FancyButton>
			<FancyButton
				type="button"
				borderColor={colors.twitterBlue}
				onClick={() => {
					setSignUpType("twitter")
					setCurrentStep(1)
				}}
				startIcon={<TwitterIcon />}
			>
				Sign up with Twitter
			</FancyButton>
			<FancyButton
				type="button"
				borderColor={colors.discordGrey}
				onClick={() => {
					setSignUpType("discord")
					setCurrentStep(1)
				}}
				startIcon={<DiscordIcon />}
			>
				Sign up with Discord
			</FancyButton>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
				}}
			>
				<Box
					component="span"
					sx={(theme) => ({
						minHeight: "2px",
						width: "100%",
						marginRight: "1rem",
						backgroundColor: theme.palette.primary.main,
					})}
				/>
				Or
				<Box
					component="span"
					sx={(theme) => ({
						minHeight: "2px",
						width: "100%",
						marginLeft: "1rem",
						backgroundColor: theme.palette.primary.main,
					})}
				/>
			</Box>
			<FancyButton
				borderColor={colors.white}
				filled
				onClick={() => {
					setCurrentStep(1)
					setSignUpType("email")
				}}
			>
				Email Signup
			</FancyButton>
		</Box>
	)

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
			history.push("/onboarding/upload")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (user) {
		return <Loading text="Loading" />
	}

	return (
		<>
			<Snackbar
				open={!!errorMessage}
				autoHideDuration={3000}
				onClose={(_, reason) => {
					if (reason === "clickaway") {
						return
					}

					setErrorMessage(undefined)
				}}
				message={errorMessage}
			>
				<Alert severity="error">{errorMessage}</Alert>
			</Snackbar>
			<Box
				sx={{
					overflow: "hidden",
					position: "relative",
					minHeight: "100vh",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					flexDirection: "column",
					padding: "3rem",
				}}
			>
				<GradientCircleThing
					sx={{
						zIndex: -1,
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
					phase={animationPhase}
					hideInner
				/>
				<RouterLink to="/">
					<Box
						component={XSYNLogo}
						sx={{
							width: "100px",
							marginBottom: "1rem",
						}}
					/>
				</RouterLink>
				<Typography
					variant="h1"
					sx={{
						marginBottom: "1rem",
						fontFamily: fonts.bizmobold,
						fontSize: "3rem",
						textTransform: "uppercase",
					}}
				>
					{currentStep === 0 ? "Create Passport" : "Sign Up"}
				</Typography>
				<Box
					sx={{
						width: "100%",
						maxWidth: "400px",
					}}
				>
					{currentStep === 0 && renderStep0()}
					{currentStep === 1 && renderStep1()}
					{currentStep === 2 && renderStep2()}
					<Typography
						variant="subtitle1"
						sx={{
							marginTop: "1rem",
						}}
					>
						Already have an account?{" "}
						<Link component={RouterLink} to="/login">
							Login here
						</Link>
					</Typography>
				</Box>
			</Box>
		</>
	)
}

interface PasswordRequirementProps extends BoxProps {
	fulfilled: boolean
}

export const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ fulfilled, sx, ...props }) => {
	const theme = useTheme()
	return (
		<Box
			component="li"
			sx={{
				...sx,
				color: fulfilled ? theme.palette.secondary.main : "inherit",
			}}
			{...props}
		/>
	)
}

interface PassportReadyProps {}

const PassportReady: React.FC<PassportReadyProps> = () => {
	const { user } = AuthContainer.useContainer()
	const history = useHistory()
	const [step, setStep] = useState(0)
	const uploadCircleRef = useRef<HTMLDivElement | null>(null)

	// Image uploads
	const [loading, setLoading] = useState(false)
	const { send } = useWebsocket()
	const { mutate: upload } = useMutation(fetching.mutation.fileUpload)
	const [errorMessage, setErrorMessage] = useState<string>()
	const [file, setFile] = useState<File>()
	const maxFileSize = 1e7

	const onSubmit = async () => {
		if (!file || !user) return

		try {
			setLoading(true)
			// Upload avatar
			const r = await upload({ file, public: true })
			if (r.error || !r.payload) {
				throw new Error("Failed to upload image, please try again.")
			}

			// Update user
			const avatarID = r.payload.id
			const resp = await send<User>(HubKey.UserUpdate, {
				id: user.id,
				avatarID,
			})

			// On success
			if (resp) {
				setStep(3)
			}
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setLoading(false)
		}
	}

	const onRemoveImage = () => {
		setFile(undefined)
		setErrorMessage(undefined)
	}

	const onDrop = useCallback((files: File[]) => {
		if (files.length <= 0) return
		const file = files[0]
		if (!!maxFileSize && file.size > maxFileSize) {
			setErrorMessage("File is larger than the max file size: " + formatBytes(maxFileSize))
			return
		}

		setFile(file)
		setErrorMessage(undefined)
	}, [])
	const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({ onDrop, disabled: step !== 2 || loading })

	useEffect(() => {
		let timeout2: NodeJS.Timeout
		const timeout = setTimeout(() => {
			setStep(1)
			timeout2 = setTimeout(() => {
				setStep(2)
			}, 2000)
		}, 2000)

		return () => {
			if (timeout2) clearTimeout(timeout2)
			clearTimeout(timeout)
		}
	}, [])

	useEffect(() => {
		if (step !== 3 || loading) return
		const timeout = setTimeout(() => {
			history.push("/profile")
		}, 300)

		return () => {
			clearTimeout(timeout)
		}
	}, [step, loading, history])

	return (
		<>
			<Snackbar
				open={!!errorMessage}
				autoHideDuration={6000}
				onClose={(_, reason) => {
					if (reason === "clickaway") {
						return
					}

					setErrorMessage(undefined)
				}}
				message={errorMessage}
			>
				<Alert severity="error">{errorMessage}</Alert>
			</Snackbar>
			<Box
				sx={{
					overflow: "hidden",
					position: "relative",
					minHeight: "100vh",
				}}
			>
				<FadeTransition show={step < 3 || loading}>
					<Box
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							width: "100%",
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<FadeTransition show={step === 2 && !loading} occupySpace>
							<Typography
								variant="h1"
								component="p"
								sx={{
									lineHeight: 1,
									fontSize: "3rem",
									textTransform: "uppercase",
									textAlign: "center",
								}}
							>
								Upload a profile image
							</Typography>
						</FadeTransition>
						<Box
							{...getRootProps()}
							ref={(r: HTMLDivElement) => {
								if (!r || step !== 3) return
								uploadCircleRef.current = r
							}}
							sx={(theme) => ({
								position: "relative",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: step === 2 && !loading ? (isDragActive ? "10rem" : "8rem") : "30rem",
								width: step === 2 && !loading ? (isDragActive ? "10rem" : "8rem") : "30rem",
								borderRadius: "50%",
								border: `2px solid ${theme.palette.secondary.main}`,
								transition:
									"height .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), width .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity .5s ease-out",
								cursor: step === 2 && !loading ? "pointer" : "initial",
								"&:hover #UploadIcon": {
									opacity: step === 2 && !loading ? 1 : 0,
								},
							})}
						>
							<input {...getInputProps()} />
							<Box
								id="UploadIcon"
								sx={{
									zIndex: 1,
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									borderRadius: "50%",
									backgroundColor: "rgba(0, 0, 0, .6)",
									opacity: isDragActive || isFocused ? 1 : 0,
									transition: "opacity .2s ease-in",
									pointerEvents: "none",
								}}
							>
								<UploadIcon />
							</Box>
							{!!file && step === 2 && !loading && (
								<Avatar
									src={URL.createObjectURL(file)}
									sx={{
										height: "95%",
										width: "95%",
									}}
								/>
							)}
							<MiddleText show={step === 0}>Your passport is ready</MiddleText>
							<MiddleText show={step === 1}>Let's set up your profile</MiddleText>
							<MiddleText show={loading}>Loading...</MiddleText>
						</Box>
						<FadeTransition show={step === 2 && !loading} occupySpace>
							<Typography
								variant="body1"
								sx={{
									lineHeight: 1,
									fontSize: "1rem",
									textTransform: "uppercase",
									textAlign: "center",
								}}
							>
								Drag an image here for your profile picture
							</Typography>
						</FadeTransition>
						<FadeTransition show={step === 2 && !loading}>
							<Box
								sx={{
									display: "flex",
									"& > *:not(:last-child)": {
										marginRight: "1rem",
									},
								}}
							>
								<FadeTransition show={!file} occupySpace>
									<Button onClick={() => setStep(3)} variant="text">
										Or, skip this step
									</Button>
								</FadeTransition>
								<FadeTransition show={!!file} occupySpace>
									<Button onClick={() => onRemoveImage()} variant="text">
										Clear Image
									</Button>
								</FadeTransition>
								<FadeTransition show={!!file}>
									<Button onClick={() => onSubmit()} variant="contained">
										Submit Profile Image
									</Button>
								</FadeTransition>
							</Box>
						</FadeTransition>
					</Box>
				</FadeTransition>
			</Box>
		</>
	)
}

interface FadeTransitionProps extends BoxProps {
	show: boolean
	occupySpace?: boolean
}

const FadeTransition: React.FC<FadeTransitionProps> = ({ show, occupySpace, sx, ...props }) => {
	const duration = 200

	const transitionStyles: { [key in TransitionState]: any } = {
		entering: {
			opacity: 1,
		},
		exiting: {
			opacity: 0,
			visibilty: occupySpace ? "hidden" : "initial",
		},
	}

	return (
		<Transition show={show} timeout={duration}>
			{(state) => {
				return (
					<Box
						sx={{
							...sx,
							...transitionStyles[state],
							transition: `opacity ${duration}ms ease-in`,
						}}
						{...props}
					/>
				)
			}}
		</Transition>
	)
}

const MiddleText = styled(FadeTransition)({
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	textAlign: "center",
	whiteSpace: "nowrap",
	fontSize: "3rem",
	textTransform: "uppercase",
	"@media (max-width: 650px)": {
		whiteSpace: "initial",
	},
})
