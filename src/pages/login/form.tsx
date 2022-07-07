import { Alert, Box, Stack, styled, Tab, Tabs } from "@mui/material"
import { useState } from "react"
import { FacebookIcon, MetaMaskIcon, WalletConnectIcon } from "../../assets"
import { FacebookLogin } from "../../components/facebookLogin"
import { FancyButton } from "../../components/fancyButton"
import { MetaMaskLogin } from "../../components/loginMetaMask"
import { WalletConnectLogin } from "../../components/loginWalletConnect"
import { colors } from "../../theme"
import { EmailLogin } from "./email"

enum FormTabs {
	Login = "login",
	Signup = "signup",
}

export const LoginForm = () => {
	const [error, setError] = useState<string | undefined>(undefined)
	const [tab, setTab] = useState(FormTabs.Login)

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
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
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
						<FacebookLogin
							callback={() => console.log("it works")}
							onFailure={setError}
							render={(props) => (
								<ConnectButton
									onClick={props.onClick}
									loading={props.isProcessing}
									title="Connect Wallet to account"
									startIcon={<FacebookIcon />}
								>
									Facebook
								</ConnectButton>
							)}
						/>
					</Box>
				</Stack>
			</Box>
			{error && <Alert severity="error">{error}</Alert>}
		</Stack>
	)
}

const ConnectButton = styled(FancyButton)({
	width: "calc(50% - .5rem)",
	borderRadius: ".5rem",
	backgroundColor: colors.darkNavyBlue,
})
