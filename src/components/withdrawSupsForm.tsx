import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import { Box, Button, Dialog, DialogContent, DialogTitle, TextField, Typography } from "@mui/material"
import { BigNumber, ethers } from "ethers"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import React, { useCallback, useEffect, useState } from "react"
import { MetaMaskIcon, WalletConnectIcon } from "../assets"
import Arrow from "../assets/images/arrow.png"
import Safe from "../assets/images/gradient/safeLarge.png"
import SupsToken from "../assets/images/sup-token.svg"
import { API_ENDPOINT_HOSTNAME, REDEEM_ADDRESS, SUPS_CONTRACT_ADDRESS, WITHDRAW_ADDRESS } from "../config"
import { useSnackbar } from "../containers/snackbar"
import { SocketState, WSSendFn } from "../containers/socket"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { supFormatter } from "../helpers/items"
import { AddressDisplay, metamaskErrorHandling } from "../helpers/web3"
import { useSecureSubscription } from "../hooks/useSecureSubscription"
import HubKey from "../keys"
import { colors } from "../theme"
import { transferStateType, User } from "../types/types"
import { FancyButton } from "./fancyButton"
import { ConnectWalletOverlay } from "./transferStatesOverlay/connectWalletOverlay"
import { SwitchNetworkOverlay } from "./transferStatesOverlay/switchNetworkOverlay"

interface WithdrawSupsFormProps {
	setCurrentTransferState: React.Dispatch<React.SetStateAction<transferStateType>>
	currentTransferState: string
	withdrawAmount: BigNumber
	setWithdrawAmount: React.Dispatch<React.SetStateAction<BigNumber>>
	setError: React.Dispatch<React.SetStateAction<string>>
	setCurrentTransferHash: React.Dispatch<React.SetStateAction<string>>
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	user: User | undefined
	state: SocketState
	send: WSSendFn
}

const UseSignatureMode = true

interface GetSignatureResponse {
	refundID: string
	messageSignature: string
	expiry: number
}

interface CheckEarlyResponse {
	max_withdraw: string
	unlimited: boolean
	total_withdrawn: string
}

export const WithdrawSupsForm = ({
	currentTransferState,
	withdrawAmount,
	setWithdrawAmount,
	setLoading,
	setCurrentTransferHash,
	setCurrentTransferState,
	setError,
	user,
	state,
	send,
}: WithdrawSupsFormProps) => {
	const { account, metaMaskState, supBalance, provider, signer, changeChain, currentChainId } = useWeb3()
	const [withdrawDisplay, setWithdrawDisplay] = useState<string>("")
	const { payload: userSups } = useSecureSubscription<string>(HubKey.UserSupsSubscribe)
	const { displayMessage } = useSnackbar()
	const [xsynSups, setXsynSups] = useState<BigNumber>(BigNumber.from(0))
	const [supsWalletTotal, setSupsWalletTotal] = useState<BigNumber>()
	const [supsAccountTotal, setSupsAccountTotal] = useState<BigNumber>()
	const [withdrawContractAmount, setWithdrawContractAmount] = useState<BigNumber>()
	const [immediateError, setImmediateError] = useState<string>()
	const [dialogOpen, setDialogOpen] = useState<boolean>(false)
	const [isInfinite, setIsInfinite] = useState<boolean>(false)
	const [earlyLimit, setEarlyLimit] = useState<BigNumber>()
	const [limitSet, setLimitSet] = useState<boolean>(false)
	const [totalWithdrawn, setTotalWithdrawn] = useState<BigNumber>()
	const [maxLimit, setMaxLimit] = useState<BigNumber>()

	useEffect(() => {
		try {
			;(async () => {
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/withdraw/check/${user?.public_address}`)
				const body = (await resp.clone().json()) as CheckEarlyResponse
				setIsInfinite(body.unlimited)
				if (!body.unlimited) {
					setEarlyLimit(BigNumber.from(body.max_withdraw))
					setTotalWithdrawn(BigNumber.from(body.total_withdrawn))
					setMaxLimit(BigNumber.from(body.max_withdraw).sub(BigNumber.from(body.total_withdrawn)))
					return
				}
			})()
		} catch (error) {
			console.log(error)
		}
	}, [user?.public_address])

	useEffect(() => {
		if (userSups) {
			setXsynSups(BigNumber.from(userSups))
			if (!isInfinite) {
				setMaxLimit(BigNumber.from(userSups))
			}
		}
	}, [userSups, isInfinite])

	useEffect(() => {
		if (xsynSups && supBalance) {
			setSupsAccountTotal(xsynSups)
			setSupsWalletTotal(supBalance)
		}
	}, [xsynSups, supBalance])

	useEffect(() => {
		if (xsynSups === undefined || supBalance === undefined) return
		if (withdrawAmount && xsynSups && supBalance) {
			const totalAccountSups = xsynSups.sub(withdrawAmount)
			setSupsAccountTotal(totalAccountSups)

			const totalWalletSups = supBalance.add(withdrawAmount)
			setSupsWalletTotal(totalWalletSups)
			return
		}
		if (!withdrawAmount) {
			setSupsAccountTotal(xsynSups)
			setSupsWalletTotal(supBalance)
			return
		}
		setSupsWalletTotal(undefined)
	}, [withdrawAmount, xsynSups, supBalance])

	// check balance on frontend
	useEffect(() => {
		if (!isInfinite && earlyLimit) {
			if (earlyLimit.isZero() || earlyLimit.isNegative()) {
				setImmediateError("Early contributor limit reached for today")
				return
			}
		}
		if (!supBalance) {
			setImmediateError("Could not get user $SUPS balance")
			return
		}
		if (withdrawAmount.gt(xsynSups)) {
			setImmediateError("Insufficient $SUPS")
			return
		}
		if (!withdrawContractAmount) {
			setImmediateError("Unable to check withdraw contract balance.")
			return
		}
		if (withdrawAmount.gt(withdrawContractAmount)) {
			setImmediateError("Withdraw Contract balance too low.")
			return
		}
		if (!isInfinite && earlyLimit) {
			if (withdrawAmount.gt(earlyLimit)) {
				setImmediateError("This amount will exceed the early contributor limit.")
				return
			}
			if (earlyLimit.isZero() || earlyLimit.isNegative()) {
				setImmediateError("Early contributor limit reached for today")
				return
			}
		}
		setImmediateError(undefined)
	}, [withdrawAmount, supBalance, withdrawContractAmount, earlyLimit, xsynSups, isInfinite])

	const withdrawAttemptSignature = useCallback(async () => {
		setLoading(true)
		try {
			if (!signer || !withdrawAmount) return
			// get nonce from withdraw contract
			// send nonce, amount and user wallet addr to server validates they have enough sups
			// server generates a sig and returns it
			// submit that sig to withdraw contract withdrawSups func
			// listen on backend for update

			// A Human-Readable ABI; for interacting with the contract,
			// we must include any fragment we wish to use
			setCurrentTransferState("waiting")
			const abi = ["function nonces(address user) view returns (uint256)", "function withdrawSUPS(uint256, bytes signature, uint256 expiry)"]
			const withdrawContract = new ethers.Contract(WITHDRAW_ADDRESS, abi, signer)
			const nonce = await withdrawContract.nonces(account)
			await fetch(`/api/withdraw/${account}/${nonce}/${withdrawAmount.toString()}`)
				.then(async (resp) => {
					const respJson: GetSignatureResponse = await resp.json()

					const tx = await withdrawContract.withdrawSUPS(withdrawAmount.toString(), respJson.messageSignature, respJson.expiry)
					setCurrentTransferHash(tx.hash)
					setCurrentTransferState("confirm")
					await tx.wait()
					setWithdrawAmount(BigNumber.from(0))
				})
				.catch((e) => {
					setCurrentTransferState("error")
					const message = metamaskErrorHandling(e)
					!!message ? setError(message) : setError("Issue withdrawing, please try again.")
				})
		} catch (e: any) {
			setCurrentTransferState("error")
			const message = metamaskErrorHandling(e)
			!!message ? setError(message) : setError("Issue withdrawing, please try again.")
		} finally {
			setLoading(false)
		}
	}, [signer, account, withdrawAmount, setCurrentTransferHash, setCurrentTransferState, setError, setLoading, setWithdrawAmount])

	// docs: https://docs.ethers.io/v5/api/contract/example/#example-erc-20-contract--connecting-to-a-contract
	useEffect(() => {
		;(async () => {
			try {
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
				setWithdrawContractAmount(BigNumber.from(bal._hex))
			} catch (e) {
				const message = metamaskErrorHandling(e)
				!!message ? displayMessage(message) : displayMessage(e === "string" ? e : "Issue getting withdraw contract balance , please try again.")
			}
		})()
	}, [provider, displayMessage, currentChainId])

	useEffect(() => {
		if (withdrawContractAmount && earlyLimit && !limitSet) {
			const newEarlyLimit = withdrawContractAmount.sub(earlyLimit)
			console.log(newEarlyLimit.toString())
			if (newEarlyLimit.isNegative()) {
				// console.log("Setting to 0")
				// setEarlyLimit(BigNumber.from("0"))
				setLimitSet(true)
				return
			}
			setLimitSet(true)
			console.log(earlyLimit?.toString())
		}
	}, [earlyLimit, withdrawContractAmount, limitSet])

	return (
		<>
			<SwitchNetworkOverlay changeChain={changeChain} currentChainId={currentChainId} />
			<ConnectWalletOverlay walletIsConnected={!!account} />
			<Box
				component="img"
				src={Safe}
				alt="Image of a Safe"
				sx={{
					height: "12rem",
				}}
			/>

			<Typography variant="h2" sx={{ textTransform: "uppercase", marginBottom: ".5rem" }}>
				Withdraw $Sups
			</Typography>
			<Box sx={{ width: "80%", minWidth: "300px" }}>
				<Box
					sx={{
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Box sx={{ display: "flex", alignSelf: "flex-end", margin: ".5rem 0" }}>
						<Typography variant="h4" noWrap sx={{ fontWeight: "bold", marginRight: "1rem" }}>
							Available Withdraw Pool:
						</Typography>
						<Typography variant="h4" sx={{ color: colors.darkNeonPink }}>
							{supFormatter(withdrawContractAmount?.toString() || "0")}
						</Typography>
					</Box>
					{!isInfinite && (
						<>
							<Box sx={{ display: "flex", alignSelf: "flex-end", margin: ".5rem 0" }}>
								<Typography variant="h5" noWrap sx={{ fontWeight: "bold", marginRight: "1rem" }}>
									Early Contributor Limit:
								</Typography>
								<Typography variant="h5" sx={{ color: colors.darkNeonPink }}>
									{earlyLimit ? (+formatUnits(earlyLimit, 18)).toFixed(4) : "0"}
								</Typography>
							</Box>
							<Box sx={{ display: "flex", alignSelf: "flex-end", margin: ".5rem 0" }}>
								<Typography variant="h6" noWrap sx={{ fontWeight: "bold", marginRight: "1rem" }}>
									Total Withdrawn:
								</Typography>
								<Typography variant="h6" sx={{ color: colors.darkNeonPink }}>
									{totalWithdrawn ? (+formatUnits(totalWithdrawn, 18)).toFixed(4) : "0"}
								</Typography>
							</Box>
						</>
					)}

					<Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
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
										From:{` ${user?.username}`}
									</Typography>
									<SportsEsportsIcon sx={{ fontSize: "1.2rem", color: colors.darkGrey }} />
								</Box>
								<Box sx={{ display: "flex" }}>
									<Typography variant="h6" sx={{ color: colors.lightNavyBlue2, fontWeight: 800, marginRight: ".5rem", alignSelf: "center" }}>
										Amount:
									</Typography>
									<TextField
										disabled={earlyLimit && earlyLimit.isZero() ? true : false}
										color="secondary"
										fullWidth
										variant="filled"
										value={withdrawDisplay}
										onChange={(e) => {
											let num = Number(e.target.value)
											if (e.target.value.charAt(0) !== "." && isNaN(num)) {
												setWithdrawDisplay(e.target.value)
												setImmediateError("Amount must be a number")
											}

											if (e.target.value.charAt(0) === "-") {
												setWithdrawDisplay(e.target.value)
												setImmediateError("Amount can't be negative")
												return
											}
											if (e.target.value === "") {
												setWithdrawDisplay(e.target.value)
												setWithdrawAmount(BigNumber.from(0))
												return
											}
											try {
												setWithdrawDisplay(e.target.value)
												const newValue = parseUnits(e.target.value, 18)
												setWithdrawAmount(newValue)
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
								<Box sx={{ display: "flex", justifyContent: "space-between" }}>
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<Typography variant="body1" sx={{ color: colors.lightNavyBlue2, fontWeight: 800, marginRight: "1rem" }}>
											Account Total:{" "}
										</Typography>

										<Box
											component="img"
											src={SupsToken}
											alt="token image"
											sx={{ height: ".75rem", paddingRight: ".25rem", alignSelf: "inherit" }}
										/>

										<Typography variant="body2" sx={{ color: colors.darkSkyBlue, fontWeight: 800 }}>
											{userSups ? supFormatter(userSups) : "--"}
										</Typography>
									</Box>
									<Button
										sx={{ ml: "auto", width: "fit-content" }}
										disabled={!xsynSups || xsynSups._hex === BigNumber.from(0)._hex}
										onClick={() => {
											if (maxLimit) {
												if (withdrawContractAmount && withdrawContractAmount.lt(maxLimit)) {
													setWithdrawAmount(withdrawContractAmount)
													setWithdrawDisplay(formatUnits(withdrawContractAmount, 18))
													return
												}
												setWithdrawAmount(maxLimit)
												setWithdrawDisplay(formatUnits(maxLimit, 18))
											}
										}}
									>
										<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="body1">
											Max: <b>{maxLimit ? supFormatter(maxLimit.toString()) : "--"}</b>
										</Typography>
									</Button>
								</Box>
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
										To:{` ${account ? AddressDisplay(account) : null}`}
									</Typography>
									{metaMaskState === MetaMaskState.NotInstalled ? (
										<WalletConnectIcon height={"1.2rem"} width={"1.2rem"} />
									) : (
										<MetaMaskIcon height={"1.2rem"} width={"1.2rem"} />
									)}
								</Box>
								<Box sx={{ display: "flex" }}>
									<Typography variant="h6" sx={{ color: colors.lightNavyBlue2, fontWeight: 800, marginRight: "1rem" }}>
										Wallet Total:{" "}
									</Typography>

									<Box component="img" src={SupsToken} alt="token image" sx={{ height: "1rem", paddingRight: ".5rem" }} />

									<Typography variant="h6" sx={{ color: colors.skyBlue, fontWeight: 800 }}>
										{supsWalletTotal ? formatUnits(supsWalletTotal, 18) : "--"}
									</Typography>
								</Box>
								<Box sx={{ display: "flex", alignSelf: "flex-end" }}>
									<Typography variant="body1" sx={{ color: colors.lightNavyBlue2, fontWeight: 800, marginRight: ".5rem" }}>
										Current Wallet Balance:
									</Typography>
									<Typography variant="body1" sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }}>
										{supBalance ? parseFloat(formatUnits(supBalance, 18)) : "--"}
									</Typography>
								</Box>
							</Box>
						</Box>
					</Box>
					<FancyButton
						disabled={
							!withdrawAmount || !xsynSups || withdrawAmount.gt(xsynSups) || currentTransferState !== "none" || immediateError !== undefined
						}
						borderColor={colors.skyBlue}
						sx={{ marginTop: "1.5rem", width: "50%" }}
						onClick={() => {
							setDialogOpen(true)
						}}
					>
						Withdraw $SUPS
					</FancyButton>
					<Typography color="error" variant="subtitle1" sx={immediateError ? { margin: "1rem" } : { display: "none" }}>
						{immediateError}
					</Typography>
				</Box>
			</Box>
			{/* CONFIRMATION DIALOG */}
			<Dialog open={dialogOpen} sx={{ backgroundColor: colors.darkNavyBackground }}>
				<Box sx={{ border: `4px ${colors.black2} solid` }}>
					<DialogTitle>
						<Typography variant="h3">Confirm Your Withdrawal Request</Typography>
					</DialogTitle>
					<DialogContent>
						<Typography variant="subtitle2">
							Please confirm your withdrawal of <b>{withdrawAmount ? formatUnits(withdrawAmount, 18) : null}</b> $SUPS from {user?.username} into
							wallet address: {account ? AddressDisplay(account) : null}.
						</Typography>
					</DialogContent>
					<DialogContent sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
						<Button
							variant="outlined"
							color="secondary"
							sx={{ borderRadius: "0", marginRight: "1rem" }}
							onClick={() => {
								//TODO: uncomment this after withdraw sups is available
								withdrawAttemptSignature()
								setDialogOpen(false)
							}}
						>
							Confirm
						</Button>
						<Button variant="contained" color="primary" sx={{ borderRadius: "0" }} onClick={() => setDialogOpen(false)}>
							Cancel
						</Button>
					</DialogContent>
				</Box>
			</Dialog>
		</>
	)
}
