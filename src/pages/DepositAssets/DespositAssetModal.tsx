import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { BigNumber } from "ethers"

interface DespositAssetModalProps {
	open: boolean
	maxAmount: BigNumber
}

export const DespositAssetModal = ({ open, maxAmount }: DespositAssetModalProps) => {
	return (
		<Dialog open={open} maxWidth={"xl"}>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Deposit Asset
			</DialogTitle>
			<DialogContent sx={{ paddingTop: "1.5rem !important", minWidth: "400px" }}></DialogContent>

			<DialogActions sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "row-reverse" }}></DialogActions>
		</Dialog>
	)
}
