import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"
import { BigNumber } from "ethers"
import { FancyButton } from "../../components/fancyButton"
import { Asset1155Json } from "../../types/types"
import { colors } from "../../theme"
import { useWeb3 } from "../../containers/web3"
import { useCallback, useState } from "react"

interface DespositAssetModalProps {
	open: boolean
	maxAmount: BigNumber
	asset: Asset1155Json
	transferAddress: string
	tokenID: number
	mintContract: string
}

export const DespositAssetModal = ({ open, maxAmount, asset, tokenID, transferAddress, mintContract }: DespositAssetModalProps) => {
	const [amount, setAmount] = useState<number>(1)
	const [loading, setLoading] = useState<boolean>(false)
	const { safeTransferFrom1177 } = useWeb3()

	const startTransfer = useCallback(async () => {
		try {
			setLoading(true)
			const resp = await safeTransferFrom1177(mintContract, tokenID, amount, transferAddress)
			if (!resp) return
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}, [amount, mintContract, safeTransferFrom1177, tokenID, transferAddress])

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
			<DialogContent sx={{ paddingTop: "1.5rem !important", minWidth: "400px" }}>
				Confirm deposit of asset "<Typography sx={{ color: `${colors.neonPink}` }}>{asset.name}</Typography>"
			</DialogContent>

			<DialogActions sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "row-reverse" }}>
				<FancyButton loading={loading} onClick={startTransfer}>
					Deposit Asset
				</FancyButton>
			</DialogActions>
		</Dialog>
	)
}
