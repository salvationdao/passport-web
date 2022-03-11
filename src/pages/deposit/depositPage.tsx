import { Box, Paper, Typography } from "@mui/material"
import React, { useState } from "react"
import Coin from "../../assets/images/gradient/coin.png"
import { DepositSups } from "../../components/depositSups"
import { GradientCircleThing } from "../../components/home/gradientCircleThing"
import { Navbar } from "../../components/home/navbar"
import { ConnectWalletOverlay } from "../../components/transferStatesOverlay/connectWalletOverlay"
import { SwitchNetworkOverlay } from "../../components/transferStatesOverlay/switchNetworkOverlay"
import { TransactionResultOverlay } from "../../components/transferStatesOverlay/transactionResultOverlay"
import { useAuth } from "../../containers/auth"
import { useWeb3 } from "../../containers/web3"
import { AddressDisplay } from "../../helpers/web3"
import { transferStateType } from "../../types/types"

export const DepositPage = () => {
	const { account } = useWeb3()
	const { user } = useAuth()

	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")

	//TODO: set this transferstate to "none" when depositSUPs functionality becomes available
	const [currentTransferState, setCurrentTransferState] = useState<transferStateType>("unavailable")
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>("")
	const [depositAmount, setDepositAmount] = useState<string>()

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
						height: "100vh",
						position: "relative",
					}}
				>
					<GradientCircleThing
						sx={{ position: "absolute", height: "100%", maxHeight: "950px", maxWidth: "950px", display: { xs: "none", xl: "block" } }}
						hideInner
					/>
					<Box
						component="img"
						src={Coin}
						alt="Image of a Safe"
						sx={{
							height: "12rem",
							marginBottom: "1.5rem",
							marginTop: { xs: "1.5rem", xl: "-8rem" },
						}}
					/>
					<SwitchNetworkOverlay />
					<ConnectWalletOverlay walletIsConnected={!!account} />
					<TransactionResultOverlay
						currentTransferState={currentTransferState}
						setCurrentTransferState={setCurrentTransferState}
						currentTransferHash={currentTransferHash}
						confirmationMessage={`Depositing ${depositAmount} $SUPS from wallet address: ${account ? AddressDisplay(account) : null} to ${
							user?.username
						}.`}
						error={error}
						loading={loading}
					/>

					<Typography variant="h2" sx={{ textTransform: "uppercase", marginBottom: "3rem" }}>
						Deposit $Sups
					</Typography>

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
