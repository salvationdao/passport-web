import { Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { MetaMaskState, useWeb3 } from "../../containers/web3"
import { BINANCE_CHAIN_ID, SUPS_CONTRACT_ADDRESS } from "../../config"
import { FancyButton } from "../../components/fancyButton"

interface DespositAssetModalProps {
	open: boolean
}

export const DespositAssetModal = () => {
	const { metaMaskState, currentChainId } = useWeb3()

	return (
		<Dialog open={open} onClose={onClose} maxWidth={"xl"} key={currentChainId}>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Deposit SUPS
			</DialogTitle>
			<DialogContent sx={{ paddingTop: "1.5rem !important", minWidth: "400px" }}></DialogContent>

			{metaMaskState === MetaMaskState.Active && currentChainId?.toString() === BINANCE_CHAIN_ID && (
				<DialogActions sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "row-reverse" }}>
					{!loadingDeposit && (
						<FancyButton
							disabled={!!errorAmount}
							onClick={async () => {
								if (depositAmount) await sendTransferToPurchaseAddress(SUPS_CONTRACT_ADDRESS, depositAmount)
							}}
						>
							Deposit
						</FancyButton>
					)}
					{loadingDeposit && <CircularProgress color={"primary"} />}
					{(errorWalletBalance || errorDepositing) && <Alert severity={"error"}>{errorWalletBalance || errorDepositing}</Alert>}
				</DialogActions>
			)}
		</Dialog>
	)
}
