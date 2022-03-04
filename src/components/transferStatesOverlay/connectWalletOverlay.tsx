import { Box, Typography } from "@mui/material"
import React from "react"
import { colors } from "../../theme"
import { ConnectWallet } from "../connectWallet"

interface ConnectWalletOverlayProps {
	walletIsConnected: boolean
}
export const ConnectWalletOverlay = ({ walletIsConnected }: ConnectWalletOverlayProps) => {
	return (
		<Box
			sx={
				walletIsConnected
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
					In order to continue, your wallet must be connected. Click the button below and follow the prompts to continue.
				</Typography>
				<ConnectWallet />
			</Box>
		</Box>
	)
}
