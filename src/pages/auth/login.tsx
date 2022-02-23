import { Box, IconButton, Link, styled, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { useForm } from "react-hook-form"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { DiscordIcon, FacebookIcon, GoogleIcon, MailIcon, MetaMaskIcon, WalletConnectIcon, TwitchIcon, TwitterIcon, XSYNLogo } from "../../assets"
import { DiscordLogin, ReactDiscordFailureResponse, ReactDiscordLoginResponse } from "../../components/discordLogin"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "../../components/facebookLogin"
import { FancyButton } from "../../components/fancyButton"
import { InputField } from "../../components/form/inputField"
import { Loading } from "../../components/loading"
import { MetaMaskLogin } from "../../components/loginMetaMask"
import { ReactTwitchFailureResponse, ReactTwitchLoginResponse, TwitchLogin } from "../../components/twitchLogin"
import { ReactTwitterFailureResponse, ReactTwitterLoginResponse, TwitterLogin } from "../../components/twitterLogin"
import { AuthContainer, useAuth } from "../../containers/auth"
import { useSidebarState } from "../../containers/sidebar"
import { useSnackbar } from "../../containers/snackbar"
import { fonts } from "../../theme"

interface LogInInput {
	email: string
	password: string
}

export const LoginPage: React.FC = () => {
	const history = useHistory()
	const { user } = useAuth()
	const { setSidebarOpen } = useSidebarState()
	const { displayMessage } = useSnackbar()

	const { loginGoogle, loginFacebook, loginTwitch, loginTwitter, loginDiscord, loginPassword } = AuthContainer.useContainer()

	const { control, handleSubmit, reset } = useForm<LogInInput>()
	const [loading, setLoading] = useState(false)
	const [showEmailLogin, setShowEmailLogin] = useState(false)
	const [onlyWalletConnection, setOnlyWalletConnection] = useState(true)

	const onMetaMaskLoginFailure = (error: string) => {
		displayMessage(error, "error")
	}

	// Email login
	const onEmailLogin = handleSubmit(async (input) => {
		try {
			setLoading(true)
			await loginPassword(input.email, input.password)
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setLoading(false)
		}
	})

	// OAuth login
	const onGoogleLogin = async (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
		try {
			if (!!response.code) {
				displayMessage(`Couldn't connect to Google: ${response.code}`, "error")
				return
			}
			const r = response as GoogleLoginResponse
			const resp = await loginGoogle(r.tokenId)
			if (!resp || !resp.isNew) return
			history.push("/onboarding")
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		}
	}
	const onGoogleLoginFailure = (error: Error) => {
		displayMessage(error.message, "error")
	}

	const onFacebookLogin = async (response: any) => {
		try {
			if (!!response && !!response.status) {
				displayMessage(`Couldn't connect to Facebook: ${response.status}`, "error")
				return
			}
			const r = response as ReactFacebookLoginInfo
			const resp = await loginFacebook(r.accessToken)
			if (!resp || !resp.isNew) return
			history.push("/onboarding")
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		}
	}
	const onFacebookLoginFailure = (error: ReactFacebookFailureResponse) => {
		displayMessage(error.status || "Failed to login with Facebook.", "error")
	}

	const onTwitchLogin = async (response: ReactTwitchLoginResponse) => {
		try {
			const resp = await loginTwitch(response.token)
			if (!resp || !resp.isNew) return
			history.push("/onboarding")
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		}
	}
	const onTwitchLoginFailure = (error: ReactTwitchFailureResponse) => {
		displayMessage(error.status || "Failed to login with Twitch.", "error")
	}

	const onTwitterLogin = async (response: ReactTwitterLoginResponse) => {
		try {
			const resp = await loginTwitter(response.token, response.verifier)
			if (!resp || !resp.isNew) return
			history.push("/onboarding")
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		}
	}
	const onTwitterLoginFailure = (error: ReactTwitterFailureResponse) => {
		displayMessage(error.status || "Failed to login with Twitter.", "error")
	}

	const onDiscordLogin = async (response: ReactDiscordLoginResponse) => {
		try {
			const resp = await loginDiscord(response.code)
			if (!resp || !resp.isNew) return
			history.push("/onboarding")
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		}
	}
	const onDiscordLoginFailure = (error: ReactDiscordFailureResponse) => {
		displayMessage(error.status || "Failed to login with Discord.", "error")
	}

	useEffect(() => {
		setSidebarOpen(false)
	}, [setSidebarOpen])

	useEffect(() => {
		if (!user) return

		const userTimeout = setTimeout(() => {
			history.push("/profile")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	useEffect(() => {
		fetch(`/api/whitelist/check`).then((res) => {
			res.json().then((data) => {
				setOnlyWalletConnection(data)
			})
		})
	}, [])

	if (user) {
		return <Loading text="You are already logged in, redirecting to your profile..." />
	}

	return (
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
					fontSize: "2rem",
					textTransform: "uppercase",
					textAlign: "center",
				}}
			>
				Connect Passport
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
						<MetaMaskLogin
							onFailure={onMetaMaskLoginFailure}
							render={(props) => (
								<FancyButton
									onClick={props.onClick}
									loading={props.isProcessing}
									title="Connect Wallet to account"
									sx={{
										marginBottom: "1rem",
										padding: "1rem",
										borderRadius: ".5rem",
									}}
									startIcon={
										typeof (window as any).ethereum === "undefined" || typeof (window as any).web3 === "undefined" ? (
											<WalletConnectIcon />
										) : (
											<MetaMaskIcon />
										)
									}
								>
									Connect Wallet to account
								</FancyButton>
							)}
						/>

						<Box sx={{ position: onlyWalletConnection ? "relative" : "unset" }}>
							{onlyWalletConnection && (
								<Typography
									variant="subtitle1"
									sx={{
										textAlign: "center",
										position: "absolute",
										maxWidth: "20rem",
										width: "100%",
										margin: "auto",
										top: "4em",
										bottom: "0",
										left: "0",
										right: "0",
										color: (theme) => theme.palette.primary.main,
										textTransform: "uppercase",
										fontFamily: fonts.bizmosemi_bold,
										zIndex: 100,
									}}
								>
									Only wallet connections are allowed during early access
								</Typography>
							)}
							<BlurBox disable={onlyWalletConnection}>
								<Typography
									variant="subtitle1"
									sx={{
										color: (theme) => theme.palette.primary.main,
										textAlign: "center",
										textTransform: "uppercase",
										fontFamily: fonts.bizmosemi_bold,
									}}
								>
									Or Sign In With
								</Typography>
								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: "repeat(3, minmax(3rem, 1fr))",
										gap: "1rem",
									}}
								>
									<StyledIconButton
										onClick={() => {
											setShowEmailLogin(true)
										}}
										disabled={onlyWalletConnection}
									>
										<MailIcon />
									</StyledIconButton>
									<GoogleLogin
										clientId="467953368642-8cobg822tej2i50ncfg4ge1pm4c5v033.apps.googleusercontent.com"
										buttonText="Login"
										onSuccess={onGoogleLogin}
										onFailure={onGoogleLoginFailure}
										cookiePolicy={"single_host_origin"}
										disabled={onlyWalletConnection}
										render={(props) => (
											<StyledIconButton onClick={props.onClick} disabled={onlyWalletConnection} title={"Login with Google"}>
												<GoogleIcon />
											</StyledIconButton>
										)}
									/>
									<FacebookLogin
										callback={onFacebookLogin}
										onFailure={onFacebookLoginFailure}
										render={(props) => (
											<StyledIconButton
												onClick={props.onClick}
												disabled={onlyWalletConnection || !props.isSdkLoaded || props.isProcessing}
												title="Login with Facebook"
											>
												<FacebookIcon />
											</StyledIconButton>
										)}
									/>
									<TwitchLogin
										callback={onTwitchLogin}
										onFailure={onTwitchLoginFailure}
										render={(props) => (
											<StyledIconButton
												onClick={props.onClick}
												disabled={onlyWalletConnection || props.isProcessing}
												title="Log in with Twitch"
											>
												<TwitchIcon />
											</StyledIconButton>
										)}
									/>
									<TwitterLogin
										callback={onTwitterLogin}
										onFailure={onTwitterLoginFailure}
										render={(props) => (
											<StyledIconButton
												onClick={props.onClick}
												disabled={onlyWalletConnection || props.isProcessing}
												title="Log in with Twitter"
											>
												<TwitterIcon />
											</StyledIconButton>
										)}
									/>
									<DiscordLogin
										callback={onDiscordLogin}
										onFailure={onDiscordLoginFailure}
										render={(props) => (
											<StyledIconButton
												onClick={props.onClick}
												disabled={onlyWalletConnection || props.isProcessing}
												title="Log in with Discord"
											>
												<DiscordIcon />
											</StyledIconButton>
										)}
									/>
								</Box>
							</BlurBox>
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	)
}

const StyledIconButton = styled(IconButton)({
	borderRadius: ".5rem",
	":disabled": {
		filter: "grayscale(100%)",
	},
})

const BlurBox = styled(Box)((props: { disable: boolean }) => ({
	filter: props.disable ? "blur(5px)" : "blue(0px)",
	opacity: props.disable ? "30%" : "100%",
}))
