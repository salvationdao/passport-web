import { useState } from "react"
import { AuthContainer } from "../containers"
import { Alert, Box, Button } from "@mui/material"
import MetaMaskOnboarding from "@metamask/onboarding"
import { ReactComponent as MetaMaskIcon } from "../assets/images/icons/metamask.svg"
import { MetaMaskState, useWeb3 } from "../containers/web3"

export const LoginMetaMask = () => {
	const { loginMetamask } = AuthContainer.useContainer()
	const { metaMaskState, connect } = useWeb3()
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	return (
		<>
			<Box
				sx={{
					marginTop: "2vh",
					display: "flex",
				}}
			>
				<Button
					onClick={async () => {
						if (metaMaskState === MetaMaskState.NotLoggedIn) {
							await connect()
							return
						}
						if (metaMaskState === MetaMaskState.Active) {
							const err = await loginMetamask()
							if (err) setErrorMessage(err)
							return
						}
						const onboarding = new MetaMaskOnboarding()
						onboarding.startOnboarding()
					}}
					title={
						metaMaskState === MetaMaskState.NotInstalled
							? "Install MetaMask"
							: metaMaskState === MetaMaskState.NotLoggedIn
							? "Sign into your MetaMask to continue"
							: "Login With MetaMask"
					}
					startIcon={<MetaMaskIcon />}
					variant="contained"
				>
					{metaMaskState === MetaMaskState.NotInstalled
						? "Install MetaMask"
						: metaMaskState === MetaMaskState.NotLoggedIn
						? "Connect and ign into your MetaMask to continue"
						: "Login With MetaMask"}
				</Button>
			</Box>
			{errorMessage && (
				<Alert severity="error" sx={{ mt: "20px", maxWidth: "600px" }}>
					{errorMessage}
				</Alert>
			)}
		</>
	)
}
