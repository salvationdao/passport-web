import { Alert, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Skeleton, TextField, Typography } from "@mui/material"
import { useSecureSubscription } from "../hooks/useSecureSubscription"
import HubKey from "../keys"

import React, { useCallback, useEffect, useState } from "react"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { BigNumber, ethers } from "ethers"
import { supFormatter } from "../helpers/items"
import { FancyButton } from "./fancyButton"
import { SocketState, useWebsocket } from "../containers/socket"
import { useAuth } from "../containers/auth"
import { BINANCE_CHAIN_ID, REDEEM_ADDRESS, SUPS_CONTRACT_ADDRESS, WITHDRAW_ADDRESS } from "../config"
import { ConnectWallet } from "./connectWallet"
import { formatUnits, parseUnits } from "@ethersproject/units"

const UseSignatureMode = true

interface DepositModalProps {
	open: boolean
	onClose: () => void
	walletBalance: BigNumber
	xsynBalance: BigNumber
}

interface GetSignatureResponse {
	messageSignature: string
	expiry: number
}

export const DepositSupsModal = ({ open, onClose, walletBalance, xsynBalance }: DepositModalProps) => {
	const { account, provider, currentChainId, metaMaskState, changeChain, sendTransferToPurchaseAddress } = useWeb3()
	const { send, state } = useWebsocket()
	const { user } = useAuth()
	const { payload: userSups } = useSecureSubscription<string>(HubKey.UserSupsSubscribe)
	const [depositAmount, setDepositAmount] = useState<BigNumber>(BigNumber.from(0))
	const [loadingDeposit, setLoadingDeposit] = useState<boolean>(false)
	const [loadingWalletBalance, setLoadingWalletBalance] = useState<boolean>(false)
	const [errorWalletBalance, setErrorWalletBalance] = useState<string>()
	const [errorDepositing, setErrorDepositing] = useState<string>()
	const [errorAmount, setErrorAmount] = useState<string>()

	const changeChainToBSC = useCallback(async () => {
		if (open && currentChainId?.toString() !== BINANCE_CHAIN_ID) {
			await changeChain(parseInt(BINANCE_CHAIN_ID))
		}
	}, [currentChainId, changeChain, open])

	useEffect(() => {
		changeChainToBSC()
	}, [changeChainToBSC])

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
										onChange={(e) => {
											try {
												if (e.target.value === "") setDepositAmount(BigNumber.from(0)) // if empty allow empty
												const amt = parseUnits(e.target.value, 18)
												setDepositAmount(amt)
											} catch (error) {
												console.error(error)
											}
										}}
										value={formatUnits(depositAmount, 18)}
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
