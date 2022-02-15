import MetaMaskOnboarding from "@metamask/onboarding"
import { Button } from "@mui/material"
import React from "react"
import { MetaMaskIcon } from "../assets"
import { MetaMaskState, useWeb3 } from "../containers/web3"

interface ConnectWalletProps {
	addNewWallet?: () => Promise<void>
}

export const ConnectWallet = ({ addNewWallet }: ConnectWalletProps) => {
	const { metaMaskState, connect } = useWeb3()

	return (
		<Button
			onClick={async () => {
				// if metamask not logged in do nothing
				if (metaMaskState === MetaMaskState.NotLoggedIn) {
					await connect()
					return
				}
				// if metamask not installed tell take to install page
				if (metaMaskState === MetaMaskState.NotInstalled) {
					const onboarding = new MetaMaskOnboarding()
					onboarding.startOnboarding()
					return
				}
				// if metamask logged in add wallet
				if (metaMaskState === MetaMaskState.Active) {
					if (addNewWallet) {
						await addNewWallet()
					}
					return
				}
			}}
			title={
				metaMaskState === MetaMaskState.Active
					? "Connect Wallet to account"
					: metaMaskState === MetaMaskState.NotLoggedIn
					? "Connect and sign in to MetaMask to continue"
					: "Install MetaMask"
			}
			startIcon={<MetaMaskIcon />}
			variant="contained"
			fullWidth
		>
			{metaMaskState === MetaMaskState.NotLoggedIn
				? "Connect and sign in to MetaMask to continue"
				: metaMaskState === MetaMaskState.NotInstalled
				? "Install MetaMask"
				: "Connect Wallet to account"}
		</Button>
	)
}
