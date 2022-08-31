import { Alert, Box, Stack, styled, Tab, Tabs, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { Link, useHistory } from "react-router-dom"
import { GoogleIcon, MetaIcon, MetaMaskIcon, TwitterIcon, WalletConnectIcon, XSYNWordmarkImagePath } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { MetaMaskLogin } from "../../components/loginMetaMask"
import { WalletConnectLogin } from "../../components/loginWalletConnect"
import { AuthTypes, useAuth } from "../../containers/auth"
import { colors } from "../../theme"
import { EmailLogin } from "./email"
import FacebookLoginWrapper from "./oauth/facebook"
import GoogleLoginWrapper from "./oauth/google"
import TwitterLoginWrapper from "./oauth/twitter"

enum FormTabs {
	Login = "login",
	Signup = "signup",
}

const searchParams = new URLSearchParams(window.location.search)
const signup = searchParams.get("signup")

export const LoginForm = () => {
	const { setSignupRequest, handleAuthCheck, redirectURL } = useAuth()
	const history = useHistory()
	const [error, setError] = useState<string | null>(searchParams.get("err"))
	const [tab, setTab] = useState(signup === "true" ? FormTabs.Signup : FormTabs.Login)
	const [twitterPopup, setTwitterPopup] = useState<Window | null>(null)

	const twitterAuthCallback = useCallback(
		async (event?: MessageEvent) => {
			if (!twitterPopup || twitterPopup.closed) return
			if (!!event?.data["tfa"] && redirectURL) {
				window.location.replace(redirectURL)
			} else if (!!event?.data["redirectURL"] && !!event?.data["twitter_token"]) {
				const redirectURL = event?.data.redirectURL as string
				const twitterToken = event?.data.twitter_token as string

				setSignupRequest({
					auth_type: AuthTypes.Twitter,
					twitter_token: twitterToken,
					redirect_url: redirectURL,
				})
				history.push(`/signup?captcha=true`)
			} else if (!!event?.data["twitter_token"]) {
				const twitterToken = event?.data.twitter_token as string
				setSignupRequest({
					auth_type: AuthTypes.Twitter,
					twitter_token: twitterToken,
				})
				history.push("/signup/?captcha=true")
			} else if (!!event?.data["login"]) {
				try {
					await handleAuthCheck()
				} catch (err: any) {
					setError(err.message)
				}
			}
		},
		[twitterPopup, redirectURL, setSignupRequest, history, handleAuthCheck],
	)

	useEffect(() => {
		window.addEventListener("message", twitterAuthCallback, false)

		return () => {
			window.removeEventListener("message", twitterAuthCallback)
		}
	}, [twitterAuthCallback, twitterPopup])

	return (
		<Stack>
			<Stack sx={{ height: "100%", justifyContent: "center", alignItems: "center", gap: "1rem", maxWidth: "30rem", px: "2em" }}>
				<Logo src={XSYNWordmarkImagePath} alt="xsyn logo" />

				<Tabs
					variant="fullWidth"
					value={tab}
					onChange={(e, newValue) => {
						setTab(newValue)
						setError(null)
					}}
					sx={{
						width: "100%",
						"& button": {
							borderBottom: 0.5,
							borderColor: colors.navyBlue,
						},
						"& .Mui-selected": {
							background: `${colors.neonPink}10`,
						},
					}}
				>
					<TabStyled label="Login" value={FormTabs.Login} />
					<TabStyled label="Signup" value={FormTabs.Signup} />
				</Tabs>

				<EmailLogin signup={tab === FormTabs.Signup} />
				{error && <Alert severity="error">{error}</Alert>}
				<Stack alignItems="left" gap="1rem">
					<Typography component="span">{tab === FormTabs.Login ? "Or continue sign in with" : "Or create an account with"}</Typography>
					<Box sx={{ display: "flex", gap: "1rem" }}>
						<MetaMaskLogin
							onFailure={setError}
							render={(props) => (
								<ConnectButton
									tooltip="Metamask"
									onClick={(e) => {
										props.onClick(e)
										setError(null)
									}}
									loading={props.isProcessing}
									startIcon={<MetaMaskIcon />}
								/>
							)}
						/>
						<WalletConnectLogin
							onFailure={setError}
							render={(props) => (
								<ConnectButton
									tooltip="Wallet Connect"
									onClick={(e) => {
										props.onClick(e)
										setError(null)
									}}
									loading={props.isProcessing}
									startIcon={<WalletConnectIcon />}
								/>
							)}
						/>
						<FacebookLoginWrapper
							onFailure={setError}
							render={(props, loading) => (
								<ConnectButton
									tooltip="Meta"
									onClick={(e) => {
										props.onClick(e)
										setError(null)
									}}
									loading={loading ? loading : props.isProcessing}
									startIcon={<MetaIcon />}
									sx={{
										"&>span svg": {
											mt: "-5px !important",
										},
									}}
								/>
							)}
						/>
						<GoogleLoginWrapper
							onFailure={setError}
							render={(props) => (
								<ConnectButton
									tooltip="Google"
									sx={{
										"&>span svg": {
											height: "1.5rem !important",
											width: "1.5rem !important",
											"@media (max-width:600px)": {
												height: "2rem !important",
												width: "2rem !important",
											},
										},
									}}
									loading={props.loading}
									onClick={(e) => {
										props.onClick()
										setError(null)
									}}
									startIcon={<GoogleIcon />}
								/>
							)}
						/>
						<TwitterLoginWrapper
							onFailure={setError}
							onClick={async (popup) => {
								if (popup) setTwitterPopup(popup)
								setError(null)
							}}
							render={(props) => (
								<ConnectButton
									tooltip="Twitter"
									sx={{
										"&>span svg": {
											height: "1.6rem !important",
											width: "1.6rem !important",
											"@media (max-width:600px)": {
												height: "2rem !important",
												width: "2rem !important",
											},
										},
									}}
									onClick={props.onClick}
									startIcon={<TwitterIcon />}
								/>
							)}
						/>
					</Box>
				</Stack>
				{tab === FormTabs.Login && (
					<Link to="/forgot-password">
						<Typography
							component="span"
							sx={{
								mt: "2rem",
								display: "inline-block",
								color: colors.darkGrey,
								cursor: "pointer",
								transition: "all .5s",
								"&:hover": {
									color: "secondary",
									textDecoration: "underline",
								},
							}}
						>
							Forgot your password?
						</Typography>
					</Link>
				)}
			</Stack>
		</Stack>
	)
}

const ConnectButton = styled(FancyButton)({
	transition: "all .5s",
	borderRadius: "50%",
	borderColor: `${colors.neonPink}80`,
	minWidth: "60px",
	width: "60px",
	height: "60px",
	backgroundColor: `${colors.darkNavyBlue}50`,
	display: "flex",
	justifyContent: "center",
	position: "relative",
	"& > span": {
		position: "absolute",
		top: "50%",
		left: "50%",
		transform: "translate(-50%, -50%)",
		margin: 0,
		"& svg": {
			height: "3rem",
			width: "3rem",
		},
	},
	"& *": {
		margin: "0 !important",
	},
	"& .MuiButton-startIcon>svg": {
		height: "2rem",
		width: "2rem",
		"@media (max-width:600px)": {
			height: "2.5rem",
			width: "2.5rem",
		},
	},
	"@media (max-width:600px)": {
		minWidth: "50px",
		width: "60px",
		height: "60px",
	},
	"@media (max-width:450px)": {
		minWidth: "50px",
		width: "50px",
		height: "50px",
	},
})

const Logo = styled("img")({
	height: "3rem",
	marginBottom: "1rem",
})

const TabStyled = styled(Tab)({
	fontSize: "1.2rem",
})
