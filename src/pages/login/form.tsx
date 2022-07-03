import { Alert, Box, Stack, Tab, Tabs } from "@mui/material"
import { useState } from "react"
import { MetaMaskIcon, WalletConnectIcon } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { MetaMaskLogin } from "../../components/loginMetaMask"
import { WalletConnectLogin } from "../../components/loginWalletConnect"
import EmailLogin from "./email"

enum FormTabs {
	Login = "login",
	Signup = "signup",
}

const LoginForm = () => {
	const [error, setError] = useState<string | undefined>(undefined)
	const [tab, setTab] = useState(FormTabs.Login)

	return (
		<Stack>
			<Box sx={{ borderTop: 1, borderColor: "divider", padding: "20px", flex: 1, display: "flex" }}>
				<Stack sx={{ height: "100%", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
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
					<MetaMaskLogin
						onFailure={setError}
						render={(props) => (
							<FancyButton
								onClick={props.onClick}
								loading={props.isProcessing}
								title="Connect Wallet to account"
								sx={{
									width: "100%",
									borderRadius: ".5rem",
								}}
								startIcon={<MetaMaskIcon />}
							>
								MetaMask
							</FancyButton>
						)}
					/>
					<WalletConnectLogin
						onFailure={setError}
						render={(props) => (
							<FancyButton
								onClick={props.onClick}
								loading={props.isProcessing}
								title="Connect Wallet to account"
								sx={{
									width: "100%",
									borderRadius: ".5rem",
								}}
								startIcon={<WalletConnectIcon />}
							>
								Wallet Connect
							</FancyButton>
						)}
					/>
				</Stack>
			</Box>
			{error && <Alert severity="error">{error}</Alert>}
		</Stack>
	)
}

export default LoginForm
