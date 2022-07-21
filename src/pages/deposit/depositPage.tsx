import { Box, Paper, Typography } from "@mui/material"
import { BigNumber } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import { useEffect, useState } from "react"
import Coin from "../../assets/images/gradient/coin.png"
import { DepositSups } from "../../components/depositSups"
import { Navbar } from "../../components/home/navbar"
import { ConnectWalletOverlay } from "../../components/transferStatesOverlay/connectWalletOverlay"
import { SwitchNetworkOverlay } from "../../components/transferStatesOverlay/switchNetworkOverlay"
import { TransactionResultOverlay } from "../../components/transferStatesOverlay/transactionResultOverlay"
import { API_ENDPOINT_HOSTNAME, BINANCE_CHAIN_ID } from "../../config"
import { useWeb3 } from "../../containers/web3"
import { AddressDisplay } from "../../helpers/web3"
import { transferStateType } from "../../types/types"
import { useAuth } from "../../containers/auth"

interface CanEnterResponse {
	can_withdraw: boolean
}

export const DepositPage = () => {
	const { user } = useAuth()
	const { account, changeChain, currentChainId } = useWeb3()

	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")

	const [currentTransferState, setCurrentTransferState] = useState<transferStateType>("unavailable")
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>("")
	const [depositAmount, setDepositAmount] = useState<BigNumber>(BigNumber.from("0"))

	useEffect(() => {
		try {
			;(async () => {
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/withdraw/check`)
				const body = (await resp.clone().json()) as CanEnterResponse
				if (body.can_withdraw) {
					setCurrentTransferState("none")
					return
				}
			})()
		} catch (e) {
			console.error(e)
		}
	}, [])

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100%",
			}}
		>
			<Navbar />
			<Box
				sx={{
					display: "flex",
					flex: 1,
					m: "0 2rem 2rem 2rem",
				}}
			>
				<Paper
					sx={{
						display: "flex",
						flex: 1,
						flexDirection: "column",
						alignItems: "center",
						padding: "1rem",
						overflow: "auto",
						borderRadius: 1.5,
						gap: "1rem",
						justifyContent: "center",
						position: "relative",
					}}
				>
					<Box
						component="img"
						src={Coin}
						alt="Image of a Safe"
						sx={{
							height: "12rem",
						}}
					/>
					<SwitchNetworkOverlay currentChainId={currentChainId} changeChain={changeChain} newChainID={BINANCE_CHAIN_ID} />
					<ConnectWalletOverlay walletIsConnected={!!account} />
					<TransactionResultOverlay
						currentTransferState={currentTransferState}
						setCurrentTransferState={setCurrentTransferState}
						currentTransferHash={currentTransferHash}
						confirmationMessage={`Depositing ${formatUnits(depositAmount, 18)} $SUPS from wallet address: ${
							account ? AddressDisplay(account) : null
						} to ${user && user.username}.`}
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
		</Box>
	)
}
