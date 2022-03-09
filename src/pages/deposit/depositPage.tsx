import { Box, Paper, Typography } from "@mui/material"
import { BigNumber } from "ethers"
import React, { useEffect, useState } from "react"
import Coin from "../../assets/images/gradient/coin.png"
import { DepositSups } from "../../components/depositSups"
import { GradientCircleThing } from "../../components/home/gradientCircleThing"
import { Navbar } from "../../components/home/navbar"
import { ConnectWalletOverlay } from "../../components/transferStatesOverlay/connectWalletOverlay"
import { SwitchNetworkOverlay } from "../../components/transferStatesOverlay/switchNetworkOverlay"
import { TransactionResultOverlay } from "../../components/transferStatesOverlay/transactionResultOverlay"
import { useAuth } from "../../containers/auth"
import { useWeb3 } from "../../containers/web3"
import { supFormatter } from "../../helpers/items"
import { transferStateType } from "../../types/types"

export const DepositPage = () => {
	const { signer } = useWeb3()
	const { user } = useAuth()

	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")

	//TODO: set this transferstate to "none" when depositSUPs functionality becomes available
	const [currentTransferState, setCurrentTransferState] = useState<transferStateType>("unavailable")
	const [loading, setLoading] = useState<boolean>(false)
	const [connectedWalletAddress, setConnectedWalletAddress] = useState("")
	const [error, setError] = useState<string>("")
	const [depositAmount, setDepositAmount] = useState<BigNumber>()

	useEffect(() => {
		if (!signer) return
		;(async () => {
			try {
				const acc = await signer.getAddress()

				setConnectedWalletAddress(`${acc.substring(0, 6)}...${acc.substring(acc.length - 4, acc.length)}`)
			} catch (e) {
				setConnectedWalletAddress("")
			}
		})()
	})

	return (
		<div>
			<Navbar sx={{ marginBottom: "2rem" }} />
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexWrap: "wrap",
					padding: "0 3rem",
					"@media (max-width: 630px)": {
						flexDirection: "column",
						alignItems: "stretch",
					},
				}}
			>
				<Paper
					sx={{
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						height: "85vh",
						position: "relative",
					}}
				>
					<GradientCircleThing sx={{ position: "absolute", height: "100%", display: { xs: "none", xl: "block" } }} hideInner />
					<Box
						component="img"
						src={Coin}
						alt="Image of a Safe"
						sx={{
							height: "12rem",
							marginBottom: "1.5rem",
							marginTop: { xs: "1.5rem", xl: "-10rem" },
						}}
					/>

					<Typography variant="h2" sx={{ textTransform: "uppercase", marginBottom: "1rem" }}>
						Deposit $Sups
					</Typography>
					{
						//this is a place holder for the actual withdraw sups functionality, it does nothing but look ok
					}
					<SwitchNetworkOverlay />
					<ConnectWalletOverlay walletIsConnected={!!connectedWalletAddress} />
					<TransactionResultOverlay
						currentTransferState={currentTransferState}
						setCurrentTransferState={setCurrentTransferState}
						currentTransferHash={currentTransferHash}
						confirmationMessage={`Depositing ${
							depositAmount ? supFormatter(depositAmount.toString()) : "NONE"
						} $SUPS from wallet address: ${connectedWalletAddress} to Alpha Citizen ${user?.username}.`}
						error={error}
						loading={loading}
					/>
					<Box
						sx={{
							width: "80%",
							maxWidth: "750px",
							position: "relative",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<DepositSups
							setCurrentTransferState={setCurrentTransferState}
							currentTransferState={currentTransferState}
							setCurrentTransferHash={setCurrentTransferHash}
							connectedWalletAddress={connectedWalletAddress}
							depositAmount={depositAmount}
							setDepositAmount={setDepositAmount}
							setLoading={setLoading}
							setError={setError}
						/>
					</Box>
				</Paper>
			</Box>
		</div>
	)
}
