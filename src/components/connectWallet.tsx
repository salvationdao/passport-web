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
	const { metaMaskState, connect, wcProvider, wcConnect } = useWeb3()

	const enableWalletConnect = useCallback(async () => {
		if (wcProvider) await wcProvider.enable()
	}, [wcProvider])

	useEffect(() => {
		if (typeof (window as any).ethereum !== "undefined" || typeof (window as any).web3 !== "undefined") {
			if (wcProvider?.connected) {
				;(async () => enableWalletConnect)()
			}
		}
	}, [wcProvider, enableWalletConnect])

	return (
		<Button
			onClick={async () => {
				if (metaMaskState === MetaMaskState.NotInstalled) {
					await connect()
				} else {
					await wcConnect()
				}
			}}
			title="Connect Wallet to account"
			startIcon={metaMaskState === MetaMaskState.NotInstalled ? <WalletConnectIcon /> : <MetaMaskIcon />}
			variant="contained"
			fullWidth
		>
			Connect Wallet to account
		</Button>
	)
}
