import RefreshIcon from "@mui/icons-material/Refresh"
import { Box, CircularProgress, IconButton, Paper, Typography, useMediaQuery } from "@mui/material"
import { useCallback, useEffect, useState } from "react"

import { AssetDepositTransaction } from "../../../types/types"
import { AssetDepositDesktopTransactionTable } from "./AssetDepositDesktopTransactionTable"
import { useAuth } from "../../../containers/auth"
import { usePassportCommandsUser } from "../../../hooks/usePassport"
import HubKey from "../../../keys"
import { Navbar } from "../../../components/home/navbar"
import { colors } from "../../../theme"
import { AssetDepositMobileTransactionTable } from "./AssetDepositMobileTransactionTable"

export const AssetDepositTransactionPage = () => {
	const { user } = useAuth()
	const { state, send } = usePassportCommandsUser("/commander")
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	const [depositTransactions, setDepositTransactions] = useState<AssetDepositTransaction[]>([])
	const [dtLoading, setDTLoading] = useState(false)
	const [dtError, setDTError] = useState<string>()

	const fetchDepositTransactions = useCallback(async () => {
		setDTLoading(true)
		try {
			const resp = await send<{
				total: number
				transactions: AssetDepositTransaction[]
			}>(HubKey.Asset1155DepositList)

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
		;(async () => {
			await fetchDepositTransactions()
		})()
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
						<Typography variant="h2">Recent Asset Deposit History</Typography>
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
								<AssetDepositDesktopTransactionTable transactions={depositTransactions} />
							</Box>
						) : (
							<AssetDepositMobileTransactionTable transactions={depositTransactions} />
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
			</Paper>
		</Box>
	)
}
