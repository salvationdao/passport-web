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
import { API_ENDPOINT_HOSTNAME, BINANCE_CHAIN_ID, ETHEREUM_CHAIN_ID } from "../../config"
import { useWeb3 } from "../../containers/web3"
import { AddressDisplay } from "../../helpers/web3"
import { transferStateType } from "../../types/types"
import { useAuth } from "../../containers/auth"
import { FancyButton } from "../../components/fancyButton"

interface CheckCanDepositResp {
	deposits_enabled_eth: boolean
	deposits_enabled_bsc: number
}

export const DepositPage = () => {
	const { user } = useAuth()
	const { account, changeChain, currentChainId } = useWeb3()
	const [chain, setChain] = useState<string>()
	const [checkCanDepositResp, setCheckCanDepositResp] = useState<CheckCanDepositResp>()
	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")
	const [currentTransferState, setCurrentTransferState] = useState<transferStateType>("unavailable")
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>("")
	const [depositAmount, setDepositAmount] = useState<BigNumber>(BigNumber.from("0"))

	useEffect(() => {
		;(async () => {
			try {
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/deposit/check`)
				if (resp.status === 200) {
					const body: CheckCanDepositResp = await resp.json()
					setCheckCanDepositResp(body)
					if (body.deposits_enabled_eth || body.deposits_enabled_bsc) setCurrentTransferState("none")
					// if there is only one chain with deposits enabled, set the chain id to that
					if (body.deposits_enabled_eth && !body.deposits_enabled_bsc) setChain(ETHEREUM_CHAIN_ID)
					if (!body.deposits_enabled_eth && body.deposits_enabled_bsc) setChain(BINANCE_CHAIN_ID)
				} else {
					setError("Unable to get deposit details, please try again or contract support.")
				}
			} catch (e) {
				console.error(e)
				setError(typeof e === "string" ? e : "Unable to get deposit details, please try again or contract support.")
			} finally {
				setLoading(false)
			}
		})()
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
					<ConnectWalletOverlay walletIsConnected={!!account} />
					{chain && (
						<TransactionResultOverlay
							chain={chain}
							currentTransferState={currentTransferState}
							setCurrentTransferState={setCurrentTransferState}
							currentTransferHash={currentTransferHash}
							confirmationMessage={`Depositing ${formatUnits(depositAmount, 18)} $SUPS from wallet address: ${
								account ? AddressDisplay(account) : null
							} to ${user && user.username}.`}
							error={error}
							loading={loading}
						/>
					)}

					<Typography variant="h2" sx={{ textTransform: "uppercase", marginBottom: "3rem" }}>
						Deposit $Sups
					</Typography>
					{checkCanDepositResp && !chain && (
						<Box sx={{ display: "flex", flexDirection: "column", gap: "1rem", width: "400px" }}>
							{checkCanDepositResp.deposits_enabled_eth && (
								<FancyButton onClick={() => setChain(ETHEREUM_CHAIN_ID)}>Deposit Sups on Ethereum </FancyButton>
							)}
							{checkCanDepositResp.deposits_enabled_bsc && (
								<FancyButton onClick={() => setChain(BINANCE_CHAIN_ID)}>Deposit Sups Binance</FancyButton>
							)}
							{!checkCanDepositResp.deposits_enabled_eth && !checkCanDepositResp.deposits_enabled_bsc && (
								<Typography>Deposits are currently unavailable, please try again later.</Typography>
							)}
						</Box>
					)}
					{chain && <SwitchNetworkOverlay currentChainId={currentChainId} changeChain={changeChain} newChainID={chain} />}
					{chain && (
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
								chain={chain}
								setCurrentTransferState={setCurrentTransferState}
								currentTransferState={currentTransferState}
								setCurrentTransferHash={setCurrentTransferHash}
								depositAmount={depositAmount}
								setDepositAmount={setDepositAmount}
								setLoading={setLoading}
								setError={setError}
							/>
						</Box>
					)}
				</Paper>
			</Box>
		</Box>
	)
}
