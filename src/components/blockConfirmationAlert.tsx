import { Box, IconButton, Link, Typography, useTheme } from "@mui/material"
import Alert from "@mui/material/Alert"
import { useWeb3 } from "../containers/web3"
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
	const { currentToken } = useWeb3()

	return (
		<Box sx={{ marginTop: "1rem" }}>
			<Alert
				severity={currentConfirmation?.confirmationAmount === 6 ? "success" : "info"}
				sx={
					currentConfirmation?.confirmationAmount === 6
						? { backgroundColor: colors.darkNavyBlue, border: `${theme.palette.success.main} 1px solid`, borderRadius: "0" }
						: { backgroundColor: colors.darkNavyBlue, border: `${colors.skyBlue} 1px solid`, borderRadius: "0" }
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
					<Link
						href={
							currentConfirmation
								? `https://${currentToken.scanSite}/tx/${currentConfirmation.tx}`
								: `https://${currentToken.scanSite}/tx/`
						}
						target="_blank"
					>
						{currentConfirmation?.tx.substring(0, 12)}...
					</Link>
				</Typography>
			</Alert>
		</Box>
	)
}
