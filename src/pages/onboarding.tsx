import { Alert, Box, Link, Snackbar, Typography } from "@mui/material"
import { useCallback, useEffect, useRef, useState } from "react"
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { useForm } from "react-hook-form"
import { Link as RouterLink, useHistory } from "react-router-dom"
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

	const { control, handleSubmit, watch, trigger, reset } = useForm<SignUpInput>()
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

	const onBack = () => {
		// Reset errors, but persist form values
		reset(undefined, {
			keepValues: true
		})
		setCurrentStep((prevStep) => Math.max(prevStep - 1, 0))
	}

	const renderStep2 = () => {
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
								<li>be 8 or more characters long</li>
								<li>contain <strong>upper</strong> &#38; <strong>lower</strong> case letters</li>
								<li>contain at least <strong>1 number</strong></li>
								<li>contain at least <strong>1 symbol</strong></li>
							</ul>
						</Box>
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<FancyButton type="submit" disabled={loading} sx={{
								flexGrow: 1,
							}}>
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
					<Box component="form" onSubmit={async (e: any) => {
						e.preventDefault()
						const isStepValid = await trigger()
						if (!isStepValid) return
						setCurrentStep(2)
					}} sx={{
						"& > *:not(:last-child)": {
							marginBottom: "1rem"
						}
					}}>
						<InputField name="username" label="Username" control={control} rules={{ required: "Username is required" }} disabled={loading} variant="filled" autoFocus fullWidth />
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
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<FancyButton type="submit" disabled={loading} sx={{
								flexGrow: 1,
							}}>
								Next
							</FancyButton>
						</Box>
					</Box>
				)
			case "metamask":
				return (
					<Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()} sx={{
						"& > *:not(:last-child)": {
							marginBottom: "1rem"
						}
					}}>
						<InputField name="username" label="Username" control={control} rules={{ required: "Username is required" }} disabled={loading} variant="filled" autoFocus fullWidth />
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
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
								sx={{
									flexGrow: 1
								}}
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
						<InputField name="username" label="Username" control={control} rules={{ required: "Username is required" }} disabled={loading} variant="filled" autoFocus fullWidth />
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<GoogleLogin
								clientId="593683501366-gk7ab1nnskc1tft14bk8ebsja1bce24v.apps.googleusercontent.com"
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
					<Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()} sx={{
						"& > *:not(:last-child)": {
							marginBottom: "1rem"
						}
					}}>
						<InputField name="username" label="Username" control={control} rules={{ required: "Username is required" }} disabled={loading} variant="filled" autoFocus fullWidth />
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<FacebookLogin
								appId="577913423867745"
								fields="email"
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
										disabled={props.isDisabled || !props.isSdkLoaded || props.isProcessing}
										startIcon={<FacebookIcon />}
										sx={{
											flexGrow: 1
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
					<Box component="form" onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()} sx={{
						"& > *:not(:last-child)": {
							marginBottom: "1rem"
						}
					}}>
						<InputField name="username" label="Username" control={control} rules={{ required: "Username is required" }} disabled={loading} variant="filled" autoFocus fullWidth />
						<Box sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: ".5rem"
							}
						}}>
							<FancyButton type="button" onClick={onBack}>
								Back
							</FancyButton>
							<TwitchLogin
								clientId="1l3xc5yczselbc4yiwdieaw0hr1oap"
								redirectUri="http://localhost:5003"
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
										disabled={props.isDisabled || props.isProcessing}
										startIcon={<TwitchIcon />}
										sx={{
											flexGrow: 1
										}}
									>
										Sign up with Twitch
									</FancyButton>
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
		<FancyButton type="button" borderColor={colors.metamaskOrange} onClick={() => {
			setSignUpType("metamask")
			setCurrentStep(1)
		}}
			startIcon={<MetaMaskIcon />}>
			Sign up with MetaMask
		</FancyButton>
		<FancyButton type="button" borderColor={colors.white} onClick={() => {
			setSignUpType("google")
			setCurrentStep(1)
		}}
			startIcon={<GoogleIcon />}>
			Sign up with Google
		</FancyButton>
		<FancyButton type="button" borderColor={colors.facebookBlue} onClick={() => {
			setSignUpType("facebook")
			setCurrentStep(1)
		}}
			startIcon={<FacebookIcon />}>
			Sign up with Facebook
		</FancyButton>
		<FancyButton type="button" borderColor={colors.twitchPurple} onClick={() => {
			setSignUpType("twitch")
			setCurrentStep(1)
		}}
			startIcon={<TwitchIcon />}>
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

	return <PassportReady />

	return (
		<>
			<Snackbar
				open={!!errorMessage}
				autoHideDuration={6000}
				onClose={(_, reason) => {
					if (reason === 'clickaway') {
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
				<RouterLink to="/"><Box component="img" src={XSYNLogoImage} alt="XSYN Logo" sx={{
					width: "100px",
					marginBottom: "1rem"
				}} /></RouterLink>
				<Typography variant="h1" sx={{
					marginBottom: "1rem",
					fontFamily: fonts.bizmobold,
					fontSize: "3rem",
					textTransform: "uppercase"
				}}>{currentStep === 0 ? "Create Passport" : "Sign Up"}</Typography>
				<Box sx={{
					width: "100%",
					maxWidth: "400px"
				}}>
					{currentStep === 0 && renderStep0()}
					{currentStep === 1 && renderStep1()}
					{currentStep === 2 && renderStep2()}
					<Typography variant="subtitle1" sx={{
						marginTop: "1rem"
					}} >Already have an account? <Link component={RouterLink} to="/login">Login here</Link></Typography>
				</Box>
			</Box>
		</>
	)
}


interface PassportReadyProps {

}

const PassportReady: React.FC<PassportReadyProps> = () => {
	const [step, setStep] = useState(0)
	const uploadLeft = useRef(0)
	const uploadTop = useRef(0)
	const topTextHeight = useRef(0)
	const bottomTextHeight = useRef(0)

	// Animation specific
	const [revealText, setRevealText] = useState(false)
	const [shrink, setShrink] = useState(false)

	useEffect(() => {
		let timeout2: NodeJS.Timeout
		let timeout3: NodeJS.Timeout
		let timeout4: NodeJS.Timeout
		const timeout = setTimeout(() => {
			setStep(1)
			timeout2 = setTimeout(() => {
				setStep(2)
				timeout3 = setTimeout(() => {
					setShrink(true)
					setRevealText(true)
				}, 500)
			}, 2000)
		}, 2000)

		return () => {
			if (timeout4) clearTimeout(timeout4)
			if (timeout3) clearTimeout(timeout3)
			if (timeout2) clearTimeout(timeout2)
			clearTimeout(timeout)
		}
	}, [])

	const renderStep0 = () => {
		return (
			<Box sx={{
				overflow: "hidden",
				position: "relative",
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}>
				<Box
					sx={(theme) => ({
						zIndex: -1,
						position: "absolute",
						height: "30rem",
						width: "30rem",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						overflow: "hidden",
						borderRadius: "50%",
						border: `2px solid ${theme.palette.secondary.main}`,
						transition: "height .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), width .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity .5s ease-out",
					})}
				/>
				<Typography variant="h1" component="p" sx={{
					fontSize: "3rem",
					textTransform: "uppercase",
				}}>
					Your passport is ready
				</Typography>
			</Box>
		)
	}

	const renderStep1 = () => {
		return (
			<Box
				sx={{
					overflow: "hidden",
					position: "relative",
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}>
				<Box
					ref={(r: HTMLDivElement) => {
						if (!r) return
						if (r.offsetLeft === 0 || r.offsetTop === 0) return
						uploadTop.current = r.offsetTop
						uploadLeft.current = r.offsetLeft
					}}
					sx={(theme) => ({
						zIndex: -1,
						position: "absolute",
						height: "30rem",
						width: "30rem",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						overflow: "hidden",
						borderRadius: "50%",
						border: `2px solid ${theme.palette.secondary.main}`,
						transition: "height .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), width .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity .5s ease-out",
					})}
				/>
				<Typography variant="h1" component="p" sx={{
					fontSize: "3rem",
					textTransform: "uppercase",
				}}>
					Let's set up your profile
				</Typography>
			</Box>
		)
	}

	const renderUploadStep = () => {
		return (
			<Box sx={{
				overflow: "hidden",
				position: "relative",
				minHeight: "100vh",
			}}>
				<Box sx={{
					position: "absolute",
					top: `calc(50% - ${topTextHeight.current}px - ${bottomTextHeight.current}px - 1rem)`,
					left: "50%",
					transform: "translate(-50%, -50%)",
					display: 'flex',
					flexDirection: "column",
					alignItems: "center",
					width: "100%"
				}}>
					<Typography ref={(r: HTMLDivElement) => {
						if (!r) return
						if (r.clientHeight === 0) return
						topTextHeight.current = r.clientHeight
					}}
						variant="h1" component="p" sx={{
							marginBottom: "1rem",
							opacity: revealText ? 1 : 0,
							transition: "opacity .2s ease-in",
							lineHeight: 1,
							fontSize: "3rem",
							textTransform: "uppercase",
						}}>
						Upload a profile image
					</Typography>
					<Box
						sx={(theme) => ({
							height: shrink ? "8rem" : "30rem",
							width: shrink ? "8rem" : "30rem",
							overflow: "hidden",
							borderRadius: "50%",
							border: `2px solid ${theme.palette.secondary.main}`,
							transition: "height .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), width .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity .5s ease-out",
						})}
					/>
					<Typography ref={(r: HTMLDivElement) => {
						if (!r) return
						if (r.clientHeight === 0) return
						bottomTextHeight.current = r.clientHeight
					}} variant="body1" sx={{
						marginTop: "1rem",
						opacity: revealText ? 1 : 0,
						transition: "opacity .2s ease-in",
						lineHeight: 1,
						fontSize: "1rem",
						textTransform: "uppercase",
					}}>
						Drag an image here for your profile picture
					</Typography>
				</Box>
			</Box>
		)
	}

	return (
		<>
			{step === 0 && renderStep0()}
			{step === 1 && renderStep1()}
			{step === 2 && renderUploadStep()}
		</>
	)
}