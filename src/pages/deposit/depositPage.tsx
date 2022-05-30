import RefreshIcon from "@mui/icons-material/Refresh"
import { Box, CircularProgress, IconButton, Paper, Typography, useMediaQuery } from "@mui/material"
import { BigNumber } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import { useCallback, useEffect, useState } from "react"
import Coin from "../../assets/images/gradient/coin.png"
import { DepositSups } from "../../components/depositSups"
import { Navbar } from "../../components/home/navbar"
import { ConnectWalletOverlay } from "../../components/transferStatesOverlay/connectWalletOverlay"
import { SwitchNetworkOverlay } from "../../components/transferStatesOverlay/switchNetworkOverlay"
import { TransactionResultOverlay } from "../../components/transferStatesOverlay/transactionResultOverlay"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { useWeb3 } from "../../containers/web3"
import { AddressDisplay } from "../../helpers/web3"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { DepositTransaction, transferStateType } from "../../types/types"
import { DesktopDepositTransactionTable } from "./desktopDepositTransactionTable"
import { MobileDepositTransactionTable } from "./mobileDepositTransactionTable"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import { useAuth } from "../../containers/auth"

interface CanEnterResponse {
	can_withdraw: boolean
}

export const DepositPage = () => {
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
	const { user } = useAuth()
	const { state, send } = usePassportCommandsUser("/commander")
	const { account, changeChain, currentChainId } = useWeb3()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")

	const [currentTransferState, setCurrentTransferState] = useState<transferStateType>("unavailable")
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>("")
	const [depositAmount, setDepositAmount] = useState<BigNumber>(BigNumber.from("0"))

	// Recent deposit transaction history
	const [depositTransactions, setDepositTransactions] = useState<DepositTransaction[]>([])
	const [dtLoading, setDTLoading] = useState(false)
	const [dtError, setDTError] = useState<string>()

	const fetchDepositTransactions = useCallback(async () => {
		setDTLoading(true)
		try {
			const resp = await send<{
				total: number
				transactions: DepositTransaction[]
			}>(HubKey.SupsDepositList)

			setDepositTransactions(resp.transactions)
		} catch (e) {
			if (typeof e === "string") {
				setDTError(e)
			} else if (e instanceof Error) {
				setDTError(e.message)
			}
		} finally {
			setDTLoading(false)
		}
	}, [send])

	useEffect(() => {
		if (state !== WebSocket.OPEN || !send || !user) return
		fetchDepositTransactions()
	}, [user, state, send, fetchDepositTransactions])

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100%",
			}}
		>
			<Navbar sx={{ marginBottom: "2rem" }} />
			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					padding: "0 3rem",
					marginBottom: "3rem",
				}}
			>
				<Paper
					sx={{
						flexGrow: 1,
						position: "relative",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "100%",
						maxWidth: "1700px",
						margin: "0 auto",
						padding: "2rem",
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
					<SwitchNetworkOverlay currentChainId={currentChainId} changeChain={changeChain} />
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
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						width: "100%",
						maxWidth: "1700px",
						margin: "0 auto",
						paddingTop: "2rem",
					}}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						<Typography variant="h2">Recent Deposit History</Typography>
						<Box
							sx={{
								minHeight: "2rem",
								minWidth: "2rem",
							}}
						/>
						<IconButton onClick={() => fetchDepositTransactions()}>
							<RefreshIcon />
						</IconButton>
					</Box>
					<Box
						sx={{
							flex: "1",
							overflowX: "auto",
							display: "flex",
							alignSelf: "stretch",
							flexDirection: "column",
							minWidth: 0,
							"&:not(:last-child)": {
								marginBottom: "2rem",
							},
						}}
					>
						{isWiderThan1000px ? (
							<Box
								sx={{
									overflowX: "auto",
								}}
							>
								<DesktopDepositTransactionTable transactions={depositTransactions} />
							</Box>
						) : (
							<MobileDepositTransactionTable transactions={depositTransactions} />
						)}
						{depositTransactions.length === 0 && (
							<Box
								sx={{
									flex: 1,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									padding: "1rem",
									minHeight: "200px",
								}}
							>
								{dtLoading ? (
									<CircularProgress />
								) : (
									<Typography variant="subtitle2" color={colors.darkerGrey}>
										{dtError ? dtError : `No recent deposit history.`}
									</Typography>
								)}
							</Box>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
