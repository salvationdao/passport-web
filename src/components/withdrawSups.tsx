import { Alert, Box, CircularProgress, Skeleton, TextField, Typography } from "@mui/material"
import { BigNumber } from "bignumber.js"
import { ethers } from "ethers"
import React, { useCallback, useEffect, useState } from "react"
import Safe from "../assets/images/gradient/safe.png"
import { BINANCE_CHAIN_ID, REDEEM_ADDRESS, SUPS_CONTRACT_ADDRESS, WITHDRAW_ADDRESS } from "../config"
import { useAuth } from "../containers/auth"
import { SocketState, useWebsocket } from "../containers/socket"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { supFormatter } from "../helpers/items"
import { useSecureSubscription } from "../hooks/useSecureSubscription"
import HubKey from "../keys"
import { colors } from "../theme"
import { ConnectWallet } from "./connectWallet"
import { FancyButton } from "./fancyButton"

BigNumber.config({ EXPONENTIAL_AT: 1e9 })

const UseSignatureMode = true

interface WithdrawModalProps {
	open: boolean
	onClose: () => void
}

interface GetSignatureResponse {
	messageSignature: string
	expiry: number
}

export const WithdrawSups: React.FC = () => {
	const { account, provider, currentChainId, metaMaskState, changeChain } = useWeb3()
	const { send, state } = useWebsocket()
	const { user } = useAuth()
	const { payload: userSups } = useSecureSubscription<string>(HubKey.UserSupsSubscribe)
	const [withdrawAmount, setWithdrawAmount] = useState<string>("")
	const [withdrawContractAmount, setWithdrawContractAmount] = useState<BigNumber>()
	const [loadingWithdraw, setLoadingWithdraw] = useState<boolean>(false)
	const [loadingWalletBalance, setLoadingWalletBalance] = useState<boolean>(false)
	const [errorWalletBalance, setErrorWalletBalance] = useState<string>()
	const [errorWithdrawing, setErrorWithdrawing] = useState<string>()
	const [errorAmount, setErrorAmount] = useState<string>()

	const changeChainToBSC = useCallback(async () => {
		if (currentChainId?.toString() !== BINANCE_CHAIN_ID) {
			await changeChain(parseInt(BINANCE_CHAIN_ID))
		}
	}, [currentChainId, changeChain])

	useEffect(() => {
		changeChainToBSC()
	}, [changeChainToBSC])

	// check balance on frontend
	useEffect(() => {
		const userAmt = new BigNumber(userSups || "0").shiftedBy(-18)
		const withAmount = new BigNumber(withdrawAmount)
		if (withdrawAmount === "") {
			setErrorAmount(undefined)
			return
		}
		if (withAmount.comparedTo(userAmt) === 1) {
			setErrorAmount("Insufficient SUPS")
			return
		}
		if (!withdrawContractAmount) {
			setErrorAmount("Unable to check  Withdraw contract balance.")
			return
		}
		if (withAmount.comparedTo(withdrawContractAmount.shiftedBy(-18)) >= 0) {
			setErrorAmount("Withdraw Contract balance too low.")
			return
		}
		setErrorAmount(undefined)
	}, [withdrawAmount, userSups, withdrawContractAmount])

	// docs: https://docs.ethers.io/v5/api/contract/example/#example-erc-20-contract--connecting-to-a-contract
	const getWithdrawContractBalance = useCallback(async () => {
		try {
			if (!provider || currentChainId?.toString() !== BINANCE_CHAIN_ID) return
			setLoadingWalletBalance(true)

			// A Human-Readable ABI; for interacting with the contract, we
			// must include any fragment we wish to use
			const abi = [
				// Read-Only Functions
				"function balanceOf(address owner) view returns (uint256)",
				"function decimals() view returns (uint8)",
				"function symbol() view returns (string)",

				// Events
				// "event Transfer(address indexed from, address indexed to, uint amount)",
			]
			const erc20 = new ethers.Contract(SUPS_CONTRACT_ADDRESS, abi, provider)
			const bal: { _hex: string } = await erc20.balanceOf(UseSignatureMode ? WITHDRAW_ADDRESS : REDEEM_ADDRESS)
			setWithdrawContractAmount(new BigNumber(bal._hex))
			setErrorWalletBalance(undefined)
		} catch (e) {
			setErrorWalletBalance(e === "string" ? e : "Issue getting withdraw contract balance , please try again.")
		} finally {
			setLoadingWalletBalance(false)
		}
	}, [provider, currentChainId])

	useEffect(() => {
		getWithdrawContractBalance()
	}, [getWithdrawContractBalance])

	const withDrawAttemptSignature = useCallback(async () => {
		try {
			if (!provider) return
			setLoadingWithdraw(true)
			// get nonce from withdraw contract
			// send nonce, amount and user wallet addr to server validates they have enough sups
			// server generates a sig and returns it
			// submit that sig to withdraw contract withdrawSups func
			// listen on backend for update

			// A Human-Readable ABI; for interacting with the contract,
			// we must include any fragment we wish to use
			const abi = ["function nonces(address user) view returns (uint256)", "function withdrawSUPS(uint256, bytes signature, uint256 expiry)"]
			const signer = provider.getSigner()
			const withdrawContract = new ethers.Contract(WITHDRAW_ADDRESS, abi, signer)
			const nonce = await withdrawContract.nonces(account)
			const withdrawAmountBigNum = new BigNumber(withdrawAmount).shiftedBy(18).toString()
			const resp = await fetch(`/api/withdraw/${account}/${nonce}/${withdrawAmountBigNum}`)
			const respJson: GetSignatureResponse = await resp.json()

			await withdrawContract.withdrawSUPS(withdrawAmountBigNum, respJson.messageSignature, respJson.expiry)
			setErrorWithdrawing(undefined)
		} catch (e) {
			setErrorWithdrawing(e === "string" ? e : "Issue withdrawing, please try again.")
		} finally {
			setLoadingWithdraw(false)
		}
	}, [provider, account, withdrawAmount])

	const withDrawAttempt = useCallback(async () => {
		if (!user || !user.publicAddress || user.publicAddress === "" || state !== SocketState.OPEN) return

		try {
			if (!provider) return
			setLoadingWithdraw(true)

			const withdrawAmountBigNum = new BigNumber(withdrawAmount).shiftedBy(18).toString()
			await send(HubKey.SupsWithdraw, { amount: withdrawAmountBigNum })

			setErrorWithdrawing(undefined)
		} catch (e) {
			setErrorWithdrawing(e === "string" ? e : "Issue withdrawing, please try again.")
		} finally {
			setLoadingWithdraw(false)
		}
	}, [provider, send, state, withdrawAmount, user])

	return (
		<Box component="div" sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3em", width: "100%" }}>
			<Box component={"img"} src={Safe} alt={"SUPS Safe"} sx={{ height: "150px", width: "150px" }}></Box>

			<Typography variant="h2" sx={{ color: "primary", textTransform: "uppercase" }}>
				Withdraw $SUPS
			</Typography>
			{metaMaskState !== MetaMaskState.Active && <ConnectWallet />}
			{metaMaskState === MetaMaskState.Active && (
				<>
					{currentChainId?.toString() !== BINANCE_CHAIN_ID && (
						<FancyButton onClick={async () => await changeChainToBSC()}>Switch Network</FancyButton>
					)}
					{currentChainId?.toString() === BINANCE_CHAIN_ID && (
						<>
							<Box sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
								<Typography variant="h4" sx={{ fontWeight: "bold" }}>
									XSYN Balance
								</Typography>
								<Typography
									variant="h4"
									sx={{ color: colors.skyBlue }}
									onClick={() => {
										if (userSups) setWithdrawAmount(supFormatter(userSups))
									}}
								>
									{supFormatter(userSups || "0")}{" "}
								</Typography>
							</Box>
							{loadingWalletBalance && <Skeleton />}
							{!loadingWalletBalance && (
								<Box sx={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
									<Typography variant="h4" sx={{ fontWeight: "bold" }}>
										Available Withdraw Pool
									</Typography>
									<Typography variant="h4" sx={{ color: colors.darkNeonPink }}>
										{supFormatter(withdrawContractAmount?.toString() || "0")}
									</Typography>
								</Box>
							)}
							<TextField
								fullWidth
								variant={"filled"}
								label={"Amount"}
								onChange={(e) => {
									if (e.target.value === "") setWithdrawAmount("") // if empty allow empty
									const amt = new BigNumber(e.target.value)
									if (amt.isNaN()) {
										// if nan they go away
										return
									}
									if (amt.decimalPlaces() > 18) return // no more than 18 decimals
									setWithdrawAmount(e.target.value)
								}}
								value={withdrawAmount}
								error={!!errorAmount}
								helperText={errorAmount}
							/>
							{metaMaskState === MetaMaskState.Active && currentChainId?.toString() === BINANCE_CHAIN_ID && (
								<Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "row-reverse" }}>
									{!loadingWithdraw && (
										<FancyButton
											sx={{ paddingLeft: "1em", paddingRight: "1em" }}
											onClick={() => (UseSignatureMode ? withDrawAttemptSignature() : withDrawAttempt())}
										>
											Withdraw your $sups
										</FancyButton>
									)}
									{loadingWithdraw && <CircularProgress color={"primary"} />}
									{(errorWalletBalance || errorWithdrawing) && <Alert severity={"error"}>{errorWalletBalance || errorWithdrawing}</Alert>}
								</Box>
							)}
						</>
					)}
				</>
			)}
		</Box>
	)
}
