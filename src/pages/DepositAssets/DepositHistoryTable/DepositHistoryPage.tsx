import { Box, CircularProgress, Paper, Tab, Tabs, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"

import { AssetDepositTransaction, DepositTransaction } from "../../../types/types"
import { AssetDepositDesktopTransactionTable } from "./AssetDepositDesktopTransactionTable"
import { useAuth } from "../../../containers/auth"
import { usePassportCommandsUser } from "../../../hooks/usePassport"
import HubKey from "../../../keys"
import { Navbar } from "../../../components/home/navbar"
import { colors } from "../../../theme"

import { Route, Switch, useHistory, useLocation } from "react-router-dom"
import { DesktopDepositTransactionTable } from "../../deposit/desktopDepositTransactionTable"

export const DepositHistoryPage = () => {
	const history = useHistory()
	const location = useLocation()

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
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
						flexDirection: "column",
						overflow: "auto",
						width: "100%",
						borderRadius: 1.5,
						flexBasis: 0,
						flexGrow: 1,
					}}
				>
					<Tabs
						value={location.pathname}
						sx={{ ".MuiTab-root": { px: "2rem", py: "1.2rem" }, borderBottom: 1, borderColor: "divider" }}
						onChange={(_event, newValue) => history.push(newValue)}
					>
						<Tab label="SUPS Deposit History" value={"/deposit/history/sups"} />
						<Tab label="Asset Deposit History" value={"/deposit/history/assets"} />
					</Tabs>
					<Switch>
						<Route path="/deposit/history/sups">
							<SupDepositHistory />
						</Route>
						<Route path="/deposit/history/assets">
							<AssetDepositHistory />
						</Route>
					</Switch>
				</Paper>
			</Box>
		</Box>
	)
}

const SupDepositHistory = () => {
	const { state, send } = usePassportCommandsUser("/commander")
	const { user } = useAuth()

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
		<Box sx={{ padding: "1rem" }}>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					margin: "0 auto",
					paddingTop: "2rem",
				}}
			>
				<DesktopDepositTransactionTable transactions={depositTransactions} />

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
	)
}

const AssetDepositHistory = () => {
	const { user } = useAuth()
	const { state, send } = usePassportCommandsUser("/commander")

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
		<Box sx={{ padding: "1rem" }}>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					margin: "0 auto",
					paddingTop: "2rem",
				}}
			>
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
					<AssetDepositDesktopTransactionTable transactions={depositTransactions} />

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
	)
}
