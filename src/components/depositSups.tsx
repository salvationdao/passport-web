import { Box, Button, TextField, Typography } from "@mui/material"
import { BigNumber, ethers } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import React, { useEffect, useState } from "react"
import { MetaMaskIcon, WalletConnectIcon } from "../assets"
import Arrow from "../assets/images/arrow.png"
import SupsToken from "../assets/images/sup-token.svg"
import { useAuth } from "../containers/auth"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { supFormatter } from "../helpers/items"
import { useSecureSubscription } from "../hooks/useSecureSubscription"
import HubKey from "../keys"
import { colors } from "../theme"
import { FancyButton } from "./fancyButton"
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import { SocketState, useWebsocket } from "../containers/socket"
import { SUPS_CONTRACT_ADDRESS } from "../config"
import { useSnackbar } from "../containers/snackbar"
import { transferStateType } from "../types/types"

//TODO: after transfer on blockchain, give user ON WORLD game tokens

interface DepositSupsProps {
	setCurrentTransferHash: React.Dispatch<React.SetStateAction<string>>
	setCurrentTransferState: React.Dispatch<React.SetStateAction<transferStateType>>
	currentTransferState: string
	connectedWalletAddress: string
	depositAmount: BigNumber | undefined
	setDepositAmount: React.Dispatch<React.SetStateAction<BigNumber | undefined>>
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	setError: React.Dispatch<React.SetStateAction<string>>
}

export const DepositSups = ({
	setCurrentTransferState,
	currentTransferState,
	setCurrentTransferHash,
	connectedWalletAddress,
	depositAmount,
	setDepositAmount,
	setLoading,
	setError,
}: DepositSupsProps) => {
	const { metaMaskState, supBalance, provider, sendTransferToPurchaseAddress } = useWeb3()
	const { payload: userSups } = useSecureSubscription<string>(HubKey.UserSupsSubscribe)
	const { user } = useAuth()
	const { state } = useWebsocket()

	const [xsynSups, setXsynSups] = useState<BigNumber>(BigNumber.from(0))
	const [supsTotal, setSupsTotal] = useState<BigNumber>()

	useEffect(() => {
		if (userSups) {
			setXsynSups(BigNumber.from(userSups))
		}
	}, [userSups])

	useEffect(() => {
		handleTotalAmount()
	}, [depositAmount, xsynSups])

	const handleTotalAmount = () => {
		if (depositAmount && xsynSups) {
			const totalSups = depositAmount.add(xsynSups)
			setSupsTotal(totalSups)
			return
		}
		if (!xsynSups && depositAmount) {
			setSupsTotal(depositAmount)
			return
		}
		if (xsynSups && !depositAmount) {
			setSupsTotal(xsynSups)
			return
		}
		setSupsTotal(BigNumber.from(0))
	}

	async function handleDeposit() {
		setLoading(true)
		if (!depositAmount || !user || !provider) return

		try {
			setCurrentTransferState("waiting")
			if (state !== SocketState.OPEN) return
			const tx = await sendTransferToPurchaseAddress(SUPS_CONTRACT_ADDRESS, depositAmount)
			setCurrentTransferState("confirm")
			await tx.wait()
			setCurrentTransferHash(tx.hash)
		} catch (e: any) {
			//checking metamask Signature
			if (e.code && typeof e.message === "string") {
				setError(e.message)
			}
			if (typeof e === "string") {
				setError(e)
			}
			setCurrentTransferState("error")
		} finally {
			setLoading(false)
		}
	}

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
								From:{` ${connectedWalletAddress}`}
							</Typography>
							{metaMaskState === MetaMaskState.NotInstalled ? (
								<WalletConnectIcon height={"1.2rem"} width={"1.2rem"} />
							) : (
								<MetaMaskIcon height={"1.2rem"} width={"1.2rem"} />
							)}
						</Box>
						<Box sx={{ display: "flex" }}>
							<Typography variant="h6" sx={{ color: colors.lightNavyBlue2, fontWeight: 800, marginRight: ".5rem", alignSelf: "center" }}>
								Amount:
							</Typography>
							<TextField
								color="secondary"
								fullWidth
								variant="filled"
								type="number"
								value={depositAmount ? parseInt(ethers.utils.formatUnits(depositAmount, 18)) : ""}
								onChange={(e) => {
									if (e.target.value === "") {
										setDepositAmount(undefined)
										return
									}
									const parseValue = ethers.utils.parseUnits(e.target.value, 18)
									const bigValue = BigNumber.from(parseValue)
									setDepositAmount(bigValue)
								}}
								sx={{
									"& .MuiFilledInput-input": {
										backgroundColor: colors.inputBg,
										padding: ".5rem",
									},
									input: { color: colors.skyBlue, fontSize: "1.2rem", fontWeight: 800, lineHeight: 0.5 },
								}}
								inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
							/>
						</Box>
						<Button
							sx={{ ml: "auto", width: "fit-content" }}
							disabled={!supBalance || supBalance._hex === BigNumber.from(0)._hex}
							onClick={() => {
								if (supBalance) {
									setDepositAmount(supBalance)
								}
							}}
						>
							<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="body1">
								Max: <b>{supBalance ? parseFloat(formatUnits(supBalance, 18)).toPrecision(4) : "--"}</b>
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
					disabled={!depositAmount || !supBalance || depositAmount.gt(supBalance) || currentTransferState !== "none"}
					borderColor={colors.skyBlue}
					sx={{ marginTop: "1.5rem", width: "50%" }}
					onClick={() => {
						//TODO: uncomment this after deposit sups
						//handleDeposit()
					}}
				>
					Deposit SUPS
				</FancyButton>
			</Box>

			{/* public sale overlay */}
			{/* <Box
				sx={{
					position: "absolute",
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					padding: "1rem",
				}}
			>
				<Typography variant="h3" sx={{ textTransform: "uppercase", textAlign: "center", lineHeight: "1.6" }} color={colors.darkGrey}>
					Withdrawing of $SUPs will be available after the token sale
				</Typography>
			</Box> */}
		</Box>
	)
}
