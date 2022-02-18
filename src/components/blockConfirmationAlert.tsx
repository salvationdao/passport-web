import { Box, IconButton, Link, Typography, useTheme } from "@mui/material"
import Alert from "@mui/material/Alert"
import { useEffect, useState } from "react"
import { useWeb3, web3Constants } from "../containers/web3"
import { colors } from "../theme"
import { ChainConfirmations } from "./blockConfirmationSnackList"

/**
 * Snackbar to view confirmed blocks
 */

interface BlockConfirmationProps {
	currentConfirmation: ChainConfirmations
	handleFilter: (txID: string) => void
}
export const BlockConfirmationSnackbar = ({ currentConfirmation, handleFilter }: BlockConfirmationProps) => {
	const theme = useTheme()
	const { currentChainId } = useWeb3()

	const [scanSite, setScanSite] = useState<string | undefined>()

	useEffect(() => {
		switch (currentChainId) {
			case web3Constants.ethereumChainId:
				setScanSite("etherscan.io")
				break
			case web3Constants.binanceChainId:
				setScanSite("bscscan.com")
				break
			case web3Constants.goerliChainId:
				setScanSite("goerli.etherscan.io")
				break
			default:
				setScanSite((prev) => prev)
		}
	}, [currentChainId])

	return (
		<Box sx={{ marginTop: "1rem" }}>
			<Alert
				severity={currentConfirmation?.confirmationAmount === 6 ? "success" : "info"}
				sx={
					currentConfirmation?.confirmationAmount === 6
						? { backgroundColor: colors.navyBlue, border: `${theme.palette.success.main} 1px solid`, borderRadius: "0" }
						: { backgroundColor: colors.navyBlue, border: `${colors.skyBlue} 1px solid`, borderRadius: "0" }
				}
			>
				<Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: ".5rem", minWidth: "170px" }}>
					<Typography color="white">
						<b>{currentConfirmation?.confirmationAmount}/6</b> Confirmations
					</Typography>
					<IconButton
						disableRipple
						edge="start"
						onClick={() => {
							handleFilter(currentConfirmation.tx)
						}}
						sx={{ margin: "0", padding: "0" }}
					>
						<Typography sx={{ color: "white" }}>&#x2715;</Typography>
					</IconButton>
				</Box>
				<Typography color="white">
					{`Transaction: `}
					<Link href={currentConfirmation ? `https://${scanSite}/tx/${currentConfirmation.tx}` : `https://${scanSite}/tx/`} target="_blank">
						{currentConfirmation?.tx.substring(0, 12)}...
					</Link>
				</Typography>
			</Alert>
		</Box>
	)
}
