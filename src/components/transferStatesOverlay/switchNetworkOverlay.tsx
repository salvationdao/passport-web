import { Box, Typography } from "@mui/material"
import { BINANCE_CHAIN_ID, ETHEREUM_CHAIN_ID } from "../../config"
import { useWeb3 } from "../../containers/web3"
import { colors } from "../../theme"
import { FancyButton } from "../fancyButton"
import { useCallback } from "react"

interface SwitchNetworkOverlayProps {
	currentChainId: number | undefined
	changeChain: (chain: number) => Promise<void>
	newChainID: string
}

export const SwitchNetworkOverlay = ({ currentChainId, changeChain, newChainID }: SwitchNetworkOverlayProps) => {
	const { account } = useWeb3()
	const handleNetworkSwitch = useCallback(async () => {
		await changeChain(parseInt(newChainID))
	}, [changeChain, newChainID])

	if (!account) {
		return null
	}
	return (
		<Box
			sx={
				currentChainId === parseInt(newChainID)
					? { display: "none" }
					: {
							zIndex: 5,
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							padding: "1rem",
							height: "100%",
							minWidth: "100%",
							backgroundColor: colors.darkerNavyBackground,
							display: "flex",
							justifyContent: "center",
					  }
			}
		>
			<Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "600px", alignItems: "center" }}>
				<Typography variant="h2" sx={{ textTransform: "uppercase", textAlign: "center", textDecoration: "underline", marginBottom: "2rem" }}>
					Attention!
				</Typography>
				{newChainID === BINANCE_CHAIN_ID && (
					<Typography variant="body1" sx={{ textAlign: "center", marginBottom: "2rem" }}>
						Please switch your network to Binance Smart Chain. Click the button below and follow the prompts.
					</Typography>
				)}
				{newChainID === ETHEREUM_CHAIN_ID && (
					<Typography variant="body1" sx={{ textAlign: "center", marginBottom: "2rem" }}>
						Please switch your network to Ethereum {ETHEREUM_CHAIN_ID === "5" ? "Testnet" : "Mainnet"}. Click the button below and follow
						the prompts.
					</Typography>
				)}
				{newChainID !== BINANCE_CHAIN_ID && newChainID !== ETHEREUM_CHAIN_ID && (
					<Typography variant="body1" sx={{ textAlign: "center", marginBottom: "2rem" }}>
						Please switch your network. Click the button below and follow the prompts.
					</Typography>
				)}
				<FancyButton
					filled
					borderColor={colors.skyBlue}
					sx={{ width: "fit-content", mx: "auto", px: "2em", color: colors.black, borderRadius: "10px" }}
					onClick={handleNetworkSwitch}
				>
					Switch Network
				</FancyButton>
			</Box>
		</Box>
	)
}
