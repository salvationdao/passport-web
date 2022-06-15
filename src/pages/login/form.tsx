import * as React from "react"
import TabContext from "@mui/lab/TabContext"
import TabList from "@mui/lab/TabList"
import Tab from "@mui/material/Tab"
import { Alert, Box } from "@mui/material"
import { MetaMaskLogin } from "../../components/loginMetaMask"
import { FancyButton } from "../../components/fancyButton"
import { MetaMaskIcon, WalletConnectIcon } from "../../assets"
import { SyntheticEvent, useState } from "react"
import { useAuth } from "../../containers/auth"

const LoginForm = () => {
	const { authType, setAuthType } = useAuth()
	const [error, setError] = useState<string | undefined>(undefined)

	const handleChange = (event: SyntheticEvent, newValue: string) => {
		setAuthType(newValue)
	}
	return (
		<Box component={TabContext} sx={{ display: "flex", flexDirection: "column", flex: 1, width: "100%" }} value={authType}>
			<TabList onChange={handleChange} aria-label="Pick login type" variant="fullWidth">
				<Tab label="Wallet" value="wallet" />
			</TabList>
			<Box sx={{ borderTop: 1, borderColor: "divider", padding: "20px", flex: 1, display: "flex" }}>
				{authType === "wallet" && (
					<Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
						<MetaMaskLogin
							onFailure={setError}
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
									Login with Wallet
								</FancyButton>
							)}
						/>
					</Box>
				)}

			</Box>
			{error && <Alert severity="error">{error}</Alert>}
		</Box>
	)
}

export default LoginForm
