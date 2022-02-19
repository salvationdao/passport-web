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
	const { metaMaskState, connect, wcConnect } = useWeb3()

	return (
		<Button
			onClick={async () => {
				if (metaMaskState !== MetaMaskState.NotInstalled) {
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
