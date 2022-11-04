import { Alert, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton, TextField, Typography } from "@mui/material"

import { useCallback, useEffect, useState } from "react"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { BigNumber } from "ethers"
import { FancyButton } from "./fancyButton"
import { BINANCE_CHAIN_ID, SUPS_CONTRACT_ADDRESS_BSC } from "../config"
import { ConnectWallet } from "./connectWallet"
import { formatUnits, parseUnits } from "@ethersproject/units"

interface DepositModalProps {
	open: boolean
	onClose: () => void
	walletBalance: BigNumber
	xsynBalance: BigNumber
}

export const DepositSupsModal = ({ open, onClose, walletBalance, xsynBalance }: DepositModalProps) => {
	const { currentChainId, metaMaskState, changeChain, sendTransferToPurchaseAddress } = useWeb3()
	const [depositAmount, setDepositAmount] = useState<BigNumber | null>(null)
	const [depositDisplay, setDepositDisplay] = useState<string | null>(null)
	const [loadingDeposit] = useState<boolean>(false)
	const [loadingWalletBalance] = useState<boolean>(false)
	const [errorWalletBalance] = useState<string>()
	const [errorDepositing] = useState<string>()
	const [errorAmount, setErrorAmount] = useState<string | null>(null)

	const changeChainToBSC = useCallback(async () => {
		if (open && currentChainId?.toString() !== BINANCE_CHAIN_ID) {
			await changeChain(parseInt(BINANCE_CHAIN_ID))
		}
	}, [currentChainId, changeChain, open])

	useEffect(() => {
		changeChainToBSC()
	}, [changeChainToBSC])

	// check balance on frontend
	useEffect(() => {
		if (!depositAmount) {
			setErrorAmount(null)
			return
		}
		if (depositAmount.gt(walletBalance)) {
			setErrorAmount("Insufficient SUPS")
			return
		}
		setErrorAmount(null)
	}, [depositAmount, walletBalance])

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
			<DialogContent sx={{ paddingTop: "1.5rem !important", minWidth: "400px" }}>
				<Box sx={{ display: "flex", flexDirection: "column" }}>
					{metaMaskState !== MetaMaskState.Active && <ConnectWallet />}

					{metaMaskState === MetaMaskState.Active && (
						<>
							{currentChainId?.toString() !== BINANCE_CHAIN_ID && (
								<FancyButton onClick={async () => await changeChainToBSC()}>Switch Network</FancyButton>
							)}
							{currentChainId?.toString() === BINANCE_CHAIN_ID && (
								<>
									<Box sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
										<Typography>XSYN Balance: </Typography>
										<Typography>{formatUnits(xsynBalance, 18)} </Typography>
									</Box>
									{loadingWalletBalance && <Skeleton />}
									{!loadingWalletBalance && (
										<Box sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
											<Typography>Wallet Balance: </Typography>
											<Typography
												sx={{ cursor: "pointer" }}
												onClick={() => {
													setDepositDisplay(formatUnits(walletBalance, 18))
													setDepositAmount(walletBalance)
												}}
											>
												{formatUnits(walletBalance, 18)}
											</Typography>
										</Box>
									)}
									<TextField
										fullWidth
										sx={{ marginTop: "0.5rem" }}
										variant={"filled"}
										label={"Amount"}
										// placeholder={"0.0"}
										onChange={(e) => {
											try {
												if (e.target.value === "") setDepositDisplay(null) // if empty allow empty
												const amt = parseUnits(e.target.value, 18)
												setDepositDisplay(e.target.value.toString())
												setDepositAmount(amt)
											} catch (error) {
												console.error(error)
											}
										}}
										value={depositDisplay ? depositDisplay : ""}
										error={!!errorAmount}
										helperText={errorAmount}
									/>
								</>
							)}
						</>
					)}
				</Box>
			</DialogContent>

			{metaMaskState === MetaMaskState.Active && currentChainId?.toString() === BINANCE_CHAIN_ID && (
				<DialogActions sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "row-reverse" }}>
					{!loadingDeposit && (
						<FancyButton
							disabled={!!errorAmount}
							onClick={async () => {
								if (depositAmount) await sendTransferToPurchaseAddress(SUPS_CONTRACT_ADDRESS_BSC, depositAmount)
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
