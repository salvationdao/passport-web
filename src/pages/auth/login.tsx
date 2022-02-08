import { Alert, Box, Link, Snackbar, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { useForm } from "react-hook-form"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { DiscordIcon, FacebookIcon, GoogleIcon, TwitchIcon, TwitterIcon, XSYNLogo } from "../../assets"
import { DiscordLogin, ReactDiscordFailureResponse, ReactDiscordLoginResponse } from "../../components/discordLogin"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "../../components/facebookLogin"
import { FancyButton } from "../../components/fancyButton"
import { InputField } from "../../components/form/inputField"
import { GradientCircleThing, PhaseTypes } from "../../components/home/gradientCircleThing"
import { Loading } from "../../components/loading"
import { LoginMetaMask } from "../../components/loginMetaMask"
import { ReactTwitchFailureResponse, ReactTwitchLoginResponse, TwitchLogin } from "../../components/twitchLogin"
import { ReactTwitterFailureResponse, ReactTwitterLoginResponse, TwitterLogin } from "../../components/twitterLogin"
import { AuthContainer, useAuth } from "../../containers/auth"
import { colors, fonts } from "../../theme"

interface LogInInput {
	email: string
	password: string
}

export const LoginPage: React.FC = () => {
	const { user } = useAuth()
	const history = useHistory()

	const { loginGoogle, loginFacebook, loginTwitch, loginTwitter, loginDiscord, loginPassword } = AuthContainer.useContainer()

	const { control, handleSubmit, reset } = useForm<LogInInput>()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [showEmailLogin, setShowEmailLogin] = useState(false)

	// Animating background circle
	const [animationPhase, setAnimationPhase] = useState<PhaseTypes>("default")

	const onMetaMaskLoginFailure = (error: string) => {
		setErrorMessage(error)
	}

	// Email login
	const onEmailLogin = handleSubmit(async (input) => {
		try {
			setLoading(true)
			await loginPassword(input.email, input.password)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Somethign went wrong, please try again.")
		} finally {
			setLoading(false)
		}
	})

	// OAuth login
	const onGoogleLogin = async (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
		try {
			if (!!response.code) {
				setErrorMessage(`Couldn't connect to Google: ${response.code}`)
				return
			}
			setErrorMessage(null)
			const r = response as GoogleLoginResponse
			const resp = await loginGoogle(r.tokenId)
			if (!resp || !resp.isNew) return
			history.push("/onboarding")
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onGoogleLoginFailure = (error: Error) => {
		setErrorMessage(error.message)
	}

	const onFacebookLogin = async (response: any) => {
		try {
			if (!!response && !!response.status) {
				setErrorMessage(`Couldn't connect to Facebook: ${response.status}`)
				return
			}
			setErrorMessage(null)
			const r = response as ReactFacebookLoginInfo
			const resp = await loginFacebook(r.accessToken)
			if (!resp || !resp.isNew) return
			history.push("/onboarding")
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onFacebookLoginFailure = (error: ReactFacebookFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Facebook.")
	}

	const onTwitchLogin = async (response: ReactTwitchLoginResponse) => {
		try {
			setErrorMessage(null)
			const resp = await loginTwitch(response.token)
			if (!resp || !resp.isNew) return
			history.push("/onboarding")
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onTwitchLoginFailure = (error: ReactTwitchFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Twitch.")
	}

	const onTwitterLogin = async (response: ReactTwitterLoginResponse) => {
		try {
			setErrorMessage(null)
			const resp = await loginTwitter(response.token, response.verifier)
			if (!resp || !resp.isNew) return
			history.push("/onboarding")
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onTwitterLoginFailure = (error: ReactTwitterFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Twitter.")
	}

	const onDiscordLogin = async (response: ReactDiscordLoginResponse) => {
		try {
			setErrorMessage(null)
			const resp = await loginDiscord(response.code)
			if (!resp || !resp.isNew) return
			history.push("/onboarding")
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onDiscordLoginFailure = (error: ReactDiscordFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Discord.")
	}

	useEffect(() => {
		if (!user) return

		const userTimeout = setTimeout(() => {
			history.push("/profile")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (user) {
		return <Loading text="You are already logged in, redirecting to your profile..." />
	}

	return (
		<>
			<Snackbar
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				open={!!errorMessage}
				autoHideDuration={3000}
				onClose={(_, reason) => {
					if (reason === "clickaway") {
						return
					}

					setErrorMessage(null)
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
					Sign In
				</Typography>
				<Box
					sx={{
						width: "100%",
						maxWidth: "400px",
					}}
				>
					{showEmailLogin ? (
						<>
							<Box
								component="form"
								onSubmit={onEmailLogin}
								sx={{
									"& > *:not(:last-child)": {
										marginBottom: "1rem",
									},
								}}
							>
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
									autoFocus
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
								<Box
									sx={{
										display: "flex",
										"& > *:not(:last-child)": {
											marginRight: ".5rem",
										},
									}}
								>
									<FancyButton
										type="button"
										onClick={() => {
											reset(undefined, {
												keepValues: true,
											})
											setAnimationPhase("default")
											setShowEmailLogin(false)
										}}
									>
										Back
									</FancyButton>
									<FancyButton
										type="submit"
										color="primary"
										loading={loading}
										sx={{
											flexGrow: 1,
										}}
									>
										Log In
									</FancyButton>
								</Box>
							</Box>
							<Typography variant="subtitle1" marginTop="1rem">
								Don't have an account?{" "}
								<Link component={RouterLink} to="/signup">
									Sign up here
								</Link>
							</Typography>
						</>
					) : (
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								"& > *:not(:last-child)": {
									marginBottom: "1rem",
								},
							}}
						>
							<LoginMetaMask onFailure={onMetaMaskLoginFailure} borderColor={colors.metamaskOrange} />
							<GoogleLogin
								clientId="467953368642-8cobg822tej2i50ncfg4ge1pm4c5v033.apps.googleusercontent.com"
								buttonText="Login"
								onSuccess={onGoogleLogin}
								onFailure={onGoogleLoginFailure}
								cookiePolicy={"single_host_origin"}
								render={(props) => (
									<FancyButton
										borderColor={colors.white}
										onClick={props.onClick}
										disabled={props.disabled}
										title="Login with Google"
										startIcon={<GoogleIcon />}
									>
										Log in with Google
									</FancyButton>
								)}
							/>
							<FacebookLogin
								callback={onFacebookLogin}
								onFailure={onFacebookLoginFailure}
								render={(props) => (
									<FancyButton
										borderColor={colors.facebookBlue}
										onClick={props.onClick}
										loading={!props.isSdkLoaded || props.isProcessing}
										startIcon={<FacebookIcon />}
									>
										Log in with Facebook
									</FancyButton>
								)}
							/>
							<TwitchLogin
								callback={onTwitchLogin}
								onFailure={onTwitchLoginFailure}
								render={(props) => (
									<FancyButton
										borderColor={colors.twitchPurple}
										onClick={props.onClick}
										loading={props.isProcessing}
										startIcon={<TwitchIcon />}
									>
										Log in with Twitch
									</FancyButton>
								)}
							/>
							<TwitterLogin
								callback={onTwitterLogin}
								onFailure={onTwitterLoginFailure}
								render={(props) => (
									<FancyButton
										borderColor={colors.twitterBlue}
										onClick={props.onClick}
										loading={props.isProcessing}
										startIcon={<TwitterIcon />}
									>
										Log in with Twitter
									</FancyButton>
								)}
							/>
							<DiscordLogin
								callback={onDiscordLogin}
								onFailure={onDiscordLoginFailure}
								render={(props) => (
									<FancyButton
										borderColor={colors.discordGrey}
										onClick={props.onClick}
										loading={props.isProcessing}
										startIcon={<DiscordIcon />}
									>
										Log in with Discord
									</FancyButton>
								)}
							/>
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
									setAnimationPhase("small")
									setShowEmailLogin(true)
								}}
							>
								Email Login
							</FancyButton>
						</Box>
					)}
				</Box>
			</Box>
		</>
	)
}
