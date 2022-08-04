import { Alert, Box, Stack, styled, Tab, Tabs } from "@mui/material"
import { useEffect, useState } from "react"
import { GoogleIcon, MetaIcon, MetaMaskIcon, TwitterIcon, WalletConnectIcon } from "../../assets"
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
			<Box sx={{ borderTop: 1, borderColor: "divider", padding: "20px", flex: 1, display: "flex" }}>
				<Stack sx={{ height: "100%", justifyContent: "center", alignItems: "center", gap: "1rem", maxWidth: "30rem" }}>
					<Tabs
						variant="fullWidth"
						value={tab}
						onChange={(e, newValue) => {
							setTab(newValue)
						}}
					>
						<Tab label="Login" value={FormTabs.Login} />
						<Tab label="Signup" value={FormTabs.Signup} />
					</Tabs>
					<EmailLogin signup={tab === FormTabs.Signup} />
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
						<MetaMaskLogin
							onFailure={setError}
							render={(props) => (
								<ConnectButton
									onClick={props.onClick}
									loading={props.isProcessing}
									title="Connect Wallet to account"
									startIcon={<MetaMaskIcon />}
								>
									MetaMask
								</ConnectButton>
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
								>
									Wallet Connect
								</ConnectButton>
							)}
						/>
						{/*<FacebookLoginWrapper*/}
						{/*	onFailure={setError}*/}
						{/*	render={(props, loading) => (*/}
						{/*		<OAuthButton*/}
						{/*			onClick={props.onClick}*/}
						{/*			loading={loading ? loading : props.isProcessing}*/}
						{/*			title="Connect Wallet to account"*/}
						{/*			startIcon={<MetaIcon />}*/}
						{/*		>*/}
						{/*			Meta*/}
						{/*		</OAuthButton>*/}
						{/*	)}*/}
						{/*/>*/}
						{/*<GoogleLoginWrapper*/}
						{/*	onFailure={setError}*/}
						{/*	render={(props) => (*/}
						{/*		<OAuthButton*/}
						{/*			loading={props.loading}*/}
						{/*			onClick={props.onClick}*/}
						{/*			title="Connect Wallet to account"*/}
						{/*			startIcon={<GoogleIcon />}*/}
						{/*		>*/}
						{/*			Google*/}
						{/*		</OAuthButton>*/}
						{/*	)}*/}
						{/*/>*/}
						{/*<TwitterLoginWrapper*/}
						{/*	onFailure={setError}*/}
						{/*	render={(props) => (*/}
						{/*		<OAuthButton onClick={props.onClick} title="Connect Wallet to account" startIcon={<TwitterIcon />}>*/}
						{/*			Twitter*/}
						{/*		</OAuthButton>*/}
						{/*	)}*/}
						{/*/>*/}
					</Box>
				</Stack>
			</Box>
			{error && <Alert severity="error">{error}</Alert>}
		</Stack>
	)
}

const ConnectButton = styled(FancyButton)({
	width: "calc(50% - .25rem)",
	borderRadius: ".5rem",
	backgroundColor: colors.darkNavyBlue,
	height: "5rem",
	"& .MuiButton-startIcon>svg": {
		height: "2.5rem",
	},
})

const OAuthButton = styled(ConnectButton)({
	display: "flex",
	flexDirection: "column",
	alignItems: "center",
	justifyContent: "center",
	width: "calc((100% - 1rem)/3)",
	gap: ".5rem",
	"&>span": {
		margin: 0,
	},
	"& .MuiButton-startIcon>svg": {
		height: "1.5rem",
	},
})
