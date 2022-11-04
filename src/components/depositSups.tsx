import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import { Box, Button, TextField, Typography } from "@mui/material"
import { BigNumber } from "ethers"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import React, { useEffect, useState } from "react"
import { MetaMaskIcon, WalletConnectIcon } from "../assets"
import Arrow from "../assets/images/arrow.png"
import SupsToken from "../assets/images/sup-token.svg"
import { ETHEREUM_CHAIN_ID, SUPS_CONTRACT_ADDRESS_BSC, SUPS_CONTRACT_ADDRESS_ETH } from "../config"
import { useAuth } from "../containers/auth"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { supFormatter } from "../helpers/items"
import { AddressDisplay, metamaskErrorHandling } from "../helpers/web3"
import HubKey from "../keys"
import { colors } from "../theme"
import { transferStateType } from "../types/types"
import { FancyButton } from "./fancyButton"
import { usePassportCommandsUser } from "../hooks/usePassport"
import { useSubscription } from "../containers/ws"

//TODO: after transfer on blockchain, give user ON WORLD game tokens

interface DepositSupsProps {
	chain: string
	setCurrentTransferHash: React.Dispatch<React.SetStateAction<string>>
	setCurrentTransferState: React.Dispatch<React.SetStateAction<transferStateType>>
	currentTransferState: string
	depositAmount: BigNumber
	setDepositAmount: React.Dispatch<React.SetStateAction<BigNumber>>
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	setError: React.Dispatch<React.SetStateAction<string>>
}

export const DepositSups = ({
	chain,
	setCurrentTransferState,
	currentTransferState,
	setCurrentTransferHash,
	depositAmount,
	setDepositAmount,
	setLoading,
	setError,
}: DepositSupsProps) => {
	const { metaMaskState, supBalanceBSC, supBalanceETH, provider, sendTransferToPurchaseAddress, account } = useWeb3()
	const { user, userID } = useAuth()
	const userSups = useSubscription<string>({ URI: `/user/${userID}/sups`, key: HubKey.UserSupsSubscribe })
	const { state, send } = usePassportCommandsUser("/commander")

	const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))
	const [xsynSups, setXsynSups] = useState<BigNumber>(BigNumber.from(0))
	const [supsTotal, setSupsTotal] = useState<BigNumber>()
	const [immediateError, setImmediateError] = useState<string>()
	const [depositDisplay, setDepositDisplay] = useState<string>("")

	useEffect(() => {
		if (chain === ETHEREUM_CHAIN_ID && supBalanceETH) {
			setBalance(supBalanceETH)
		} else if (supBalanceBSC) {
			setBalance(supBalanceBSC)
		}
	}, [chain, supBalanceBSC, supBalanceETH])

	useEffect(() => {
		if (userSups) {
			setXsynSups(BigNumber.from(userSups))
		}
	}, [userSups])

	useEffect(() => {
		if (!depositAmount) return

		const bigNumDepositAmt = depositAmount
		if (bigNumDepositAmt && xsynSups) {
			const totalSups = bigNumDepositAmt.add(xsynSups)
			setSupsTotal(totalSups)
			return
		}
		if (!xsynSups && bigNumDepositAmt) {
			setSupsTotal(bigNumDepositAmt)
			return
		}
		if (xsynSups && !bigNumDepositAmt) {
			setSupsTotal(xsynSups)
			return
		}
		setSupsTotal(BigNumber.from(0))
	}, [depositAmount, xsynSups])

	async function handleDeposit(chain: string) {
		setLoading(true)
		if (!depositAmount || !user || !provider) return
		const bigNumDepositAmt = depositAmount

		let contractAddress = SUPS_CONTRACT_ADDRESS_BSC
		if (chain === ETHEREUM_CHAIN_ID) {
			contractAddress = SUPS_CONTRACT_ADDRESS_ETH
		}

		try {
			setCurrentTransferState("waiting")
			if (state !== WebSocket.OPEN) return
			const tx = await sendTransferToPurchaseAddress(contractAddress, bigNumDepositAmt)
			setCurrentTransferHash(tx.hash)
			setCurrentTransferState("confirm")
			await tx.wait()

			// Store transaction in server
			await send(HubKey.SupsDeposit, {
				transaction_hash: tx.hash,
				amount: bigNumDepositAmt.toString(),
			})
		} catch (e: any) {
			//checking metamask Signature
			const error = metamaskErrorHandling(e)
			error ? setError(error) : setError("Issue depositing, please try again.")
			setCurrentTransferState("error")
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		if (balance) {
			if (depositAmount.gt(balance)) {
				setImmediateError("Deposit amount above max value")
			}
		}
	}, [depositAmount, setImmediateError, balance])

	return (
		<Box sx={{ width: "80%", minWidth: "300px" }}>
			<Box
				sx={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}
			>
				<Box sx={{ position: "relative", width: "100%" }}>
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							backgroundColor: colors.inputBg,
							borderRadius: "10px",
							padding: ".5rem 1rem",
							marginBottom: "1rem",
							width: "100%",
							minHeight: "125px",
							justifyContent: "space-between",
						}}
					>
						<Box sx={{ display: "flex", justifyContent: "space-between" }}>
							<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h5">
								From:{` ${account ? AddressDisplay(account) : null}`}
							</Typography>
							{metaMaskState === MetaMaskState.NotInstalled ? (
								<WalletConnectIcon height={"1.2rem"} width={"1.2rem"} />
							) : (
								<MetaMaskIcon height={"1.2rem"} width={"1.2rem"} />
							)}
						</Box>
						<Box sx={{ display: "flex" }}>
							<Typography
								variant="h6"
								sx={{ color: colors.lightNavyBlue2, fontWeight: 800, marginRight: ".5rem", alignSelf: "center" }}
							>
								Amount:
							</Typography>
							<TextField
								color="secondary"
								fullWidth
								variant="filled"
								value={depositDisplay ? depositDisplay : ""}
								onChange={(e) => {
									const num = Number(e.target.value)

									if (e.target.value.charAt(0) !== "." && isNaN(num)) {
										setDepositDisplay(e.target.value)
										setImmediateError("Amount must be a number")
									}
									if (e.target.value === "") {
										setDepositDisplay(e.target.value)
										setDepositAmount(BigNumber.from(0))
										setImmediateError(undefined)
										return
									}

									if (e.target.value.charAt(0) === "-") {
										setDepositDisplay(e.target.value)
										setImmediateError("Amount can't be negative")
										return
									}

									try {
										setDepositDisplay(e.target.value)
										const newValue = parseUnits(e.target.value, 18)
										setDepositAmount(newValue)
									} catch (err) {
										console.error(err)
									}
								}}
								sx={{
									"& .MuiFilledInput-input": {
										backgroundColor: colors.inputBg,
										padding: ".5rem",
									},
									input: { color: colors.skyBlue, fontSize: "1.2rem", fontWeight: 800, lineHeight: 0.5 },
								}}
							/>
						</Box>
						<Button
							sx={{ ml: "auto", width: "fit-content" }}
							disabled={!balance || balance._hex === BigNumber.from(0)._hex}
							onClick={() => {
								if (balance) {
									setDepositAmount(balance)
									setDepositDisplay(formatUnits(balance, 18))
								}
							}}
						>
							<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="body1">
								Max: <b>{balance ? (+formatUnits(balance, 18)).toFixed(4) : "--"}</b>
							</Typography>
						</Button>
					</Box>
					<Box
						component="img"
						src={Arrow}
						alt="token image"
						sx={{
							height: "3rem",
							position: "absolute",
							top: "0",
							left: "0",
							right: "0",
							bottom: "0",
							margin: "auto",
							zIndex: 2,
						}}
					/>

					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							backgroundColor: colors.inputBg,
							borderRadius: "10px",
							padding: ".5rem 1rem",
							minHeight: "125px",
							marginTop: "1rem",
						}}
					>
						<Box sx={{ display: "flex", justifyContent: "space-between" }}>
							<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h5">
								To:{` ${user?.username}`}
							</Typography>
							<SportsEsportsIcon sx={{ fontSize: "1.2rem", color: colors.darkGrey }} />
						</Box>
						<Box sx={{ display: "flex" }}>
							<Typography variant="h6" sx={{ color: colors.lightNavyBlue2, fontWeight: 800, marginRight: "1rem" }}>
								Total after deposit:{" "}
							</Typography>

							<Box component="img" src={SupsToken} alt="token image" sx={{ height: "1rem", paddingRight: ".5rem" }} />

							<Typography variant="h6" sx={{ color: colors.skyBlue, fontWeight: 800 }}>
								{supsTotal ? supFormatter(supsTotal.toString()) : "--"}
							</Typography>
						</Box>
						<Box sx={{ display: "flex", alignSelf: "flex-end" }}>
							<Typography variant="body1" sx={{ color: colors.lightNavyBlue2, fontWeight: 800, marginRight: ".5rem" }}>
								Current Balance:
							</Typography>
							<Typography variant="body1" sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }}>
								{xsynSups ? supFormatter(xsynSups.toString()) : "--"}
							</Typography>
						</Box>
					</Box>
				</Box>
				<FancyButton
					loading={state !== WebSocket.OPEN || !send}
					disabled={
						!depositAmount || !balance || depositAmount.gt(balance) || currentTransferState !== "none" || immediateError !== undefined
					}
					borderColor={colors.skyBlue}
					sx={{ marginTop: "1.5rem", width: "50%" }}
					onClick={() => {
						handleDeposit(chain)
					}}
				>
					Deposit $SUPS
				</FancyButton>
				<Typography color="error" variant="subtitle1" sx={immediateError ? { margin: "1rem" } : { display: "none" }}>
					{immediateError}
				</Typography>
			</Box>
		</Box>
	)
}
