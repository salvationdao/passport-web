import { Alert, Box, Stack, styled, Tab, Tabs, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { GoogleIcon, MetaIcon, MetaMaskIcon, TwitterIcon, WalletConnectIcon, XSYNWordmarkImagePath } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { MetaMaskLogin } from "../../components/loginMetaMask"
import { WalletConnectLogin } from "../../components/loginWalletConnect"
import { colors } from "../../theme"
import { EmailLogin } from "./email"
import FacebookLoginWrapper from "./oauth/facebook"
import GoogleLoginWrapper from "./oauth/google"
import TwitterLoginWrapper from "./oauth/twitter"

enum FormTabs {
	Login = "login",
	Signup = "signup",
}

export const LoginForm = () => {
	const [error, setError] = useState<string | null>(null)
	const [tab, setTab] = useState(FormTabs.Login)

	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				setError(null)
			}, 2000)

			return () => {
				clearTimeout(timer)
			}
		}
	}, [error])

	return (
		<Stack>
			<Stack sx={{ height: "100%", justifyContent: "center", alignItems: "center", gap: "1rem", maxWidth: "30rem", px: "2em" }}>
				<Logo src={XSYNWordmarkImagePath} alt="xsyn logo" />

				<Tabs
					variant="fullWidth"
					value={tab}
					onChange={(e, newValue) => {
						setTab(newValue)
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
									onClick={props.onClick}
									loading={props.isProcessing}
									title="Connect Wallet to account"
									startIcon={<MetaMaskIcon />}
								/>
							)}
						/>
						<WalletConnectLogin
							onFailure={setError}
							render={(props) => (
								<ConnectButton
									onClick={props.onClick}
									loading={props.isProcessing}
									title="Connect Wallet to account"
									startIcon={<WalletConnectIcon />}
								/>
							)}
						/>
						<FacebookLoginWrapper
							onFailure={setError}
							render={(props, loading) => (
								<ConnectButton
									onClick={props.onClick}
									loading={loading ? loading : props.isProcessing}
									title="Connect Wallet to account"
									startIcon={<MetaIcon />}
								/>
							)}
						/>
						<GoogleLoginWrapper
							onFailure={setError}
							render={(props) => (
								<ConnectButton
									sx={{
										"& svg": {
											height: "1.5rem !important",
											width: "1.5rem !important",
										},
									}}
									loading={props.loading}
									onClick={props.onClick}
									title="Connect Wallet to account"
									startIcon={<GoogleIcon />}
								/>
							)}
						/>
						<TwitterLoginWrapper
							onFailure={setError}
							render={(props) => (
								<ConnectButton
									sx={{
										"& svg": {
											height: "1.5rem !important",
											width: "1.5rem !important",
										},
									}}
									onClick={props.onClick}
									title="Connect Wallet to account"
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
			height: "2rem",
			width: "2rem",
		},
	},
	"& *": {
		margin: "0 !important",
	},
	"& .MuiButton-startIcon>svg": {
		height: "2rem",
		width: "2rem",
	},
	"@media (max-width:600px)": {
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
