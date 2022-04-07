import { Box, Typography } from "@mui/material"
import React from "react"
import { BINANCE_CHAIN_ID } from "../../config"
import { colors } from "../../theme"
import { FancyButton } from "../fancyButton"

interface SwitchNetworkOverlayProps {
	currentChainId: number | undefined
	changeChain: (chain: number) => Promise<void>
}

export const SwitchNetworkOverlay = ({ currentChainId, changeChain }: SwitchNetworkOverlayProps) => {
	const handleNetworkSwitch = async () => {
		await changeChain(parseInt(BINANCE_CHAIN_ID))
	}
	return (
		<Box
			sx={
				currentChainId === parseInt(BINANCE_CHAIN_ID)
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
				<Typography variant="body1" sx={{ textAlign: "center", marginBottom: "2rem" }}>
					Please switch your network to Binance Smart Chain. Click the button below and follow the prompts.
				</Typography>
				<FancyButton borderColor={colors.skyBlue} sx={{ width: "50%" }} onClick={handleNetworkSwitch}>
					Switch Network
				</FancyButton>
			</Box>
		</Box>
	)
}
