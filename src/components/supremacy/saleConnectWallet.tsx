import { Button } from "@mui/material"
import { MetaMaskIcon, WalletConnectIcon } from "../../assets"
import { MetaMaskState, useWeb3 } from "../../containers/web3"
import { SupFancyButton } from "./supFancyButton"

interface ConnectWalletProps {
	addNewWallet?: () => Promise<void>
}

export const SaleConnectWallet = () => {
	const { metaMaskState, connect, wcConnect } = useWeb3()

	return (
		<SupFancyButton
			onClick={async () => {
				if (metaMaskState !== MetaMaskState.NotInstalled) {
					await connect()
				} else {
					await wcConnect()
				}
			}}
			title="Connect Wallet to account"
			variant="contained"
			fullWidth
		>
			Connect Wallet
		</SupFancyButton>
	)
}
