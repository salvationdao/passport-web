import MetaMaskOnboarding from "@metamask/onboarding"
import { Button } from "@mui/material"
import React, { useEffect, useCallback } from "react"
import { MetaMaskIcon } from "../assets"
import { WalletConnectIcon } from "../assets"
import { MetaMaskState, useWeb3 } from "../containers/web3"

interface ConnectWalletProps {
	addNewWallet?: () => Promise<void>
}

export const ConnectWallet = ({ addNewWallet }: ConnectWalletProps) => {
	const { metaMaskState, connect, wcProvider, account } = useWeb3()

	const enableWalletConnect = useCallback(async () => {
		if (wcProvider) await wcProvider.enable()
	}, [wcProvider])

	useEffect(() => {
		if (typeof (window as any).ethereum !== "undefined" || typeof (window as any).web3 !== "undefined") {
			if (account) {
				;(async () => enableWalletConnect)()
			}
		}
	}, [account, enableWalletConnect])

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
			startIcon={<WalletConnectIcon />}
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
