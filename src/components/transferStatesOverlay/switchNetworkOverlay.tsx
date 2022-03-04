import { Box, Typography } from "@mui/material"
import React from "react"
import { BINANCE_CHAIN_ID } from "../../config"
import { useWeb3 } from "../../containers/web3"
import { colors } from "../../theme"
import { FancyButton } from "../fancyButton"

export const SwitchNetworkOverlay = () => {
	const { currentChainId, changeChain } = useWeb3()

	const handleNetworkSwitch = async () => {
		await changeChain(parseInt(BINANCE_CHAIN_ID))
	}
	return (
		<Box
			sx={
				currentChainId === parseInt(BINANCE_CHAIN_ID)
					? { display: "none" }
					: {
							position: "absolute",
							zIndex: 5,
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
