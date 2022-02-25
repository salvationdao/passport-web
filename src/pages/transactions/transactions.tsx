import { Box, Paper, styled, Typography, useMediaQuery } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { GradientCardIconImagePath } from "../../assets"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { SearchBar } from "../../components/searchBar"
import { useAuth } from "../../containers/auth"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { DesktopTransactionTable } from "./desktopTransactionTable"
import { MobileTransactionTable } from "./mobileTransactionTable"

export const TransactionsPage = () => {
	const history = useHistory()
	const { user } = useAuth()
	const { send, state } = useWebsocket()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	// Transaction data
	const [search, setSearch] = useState("")
	const [condensedTransactions, setCondensedTransactions] = useState<{ id: string; groupID: string }[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (state !== SocketState.OPEN || !send || !user) return
		;(async () => {
			setLoading(true)
			try {
				const resp = await send<{ total: number; transactions: { id: string; groupID: string }[] }>(HubKey.TransactionList, {
					pageSize: 10,
					search,
				})
				setCondensedTransactions(resp.transactions)
			} catch (e) {
				if (typeof e === "string") {
					setError(e)
				} else if (e instanceof Error) {
					setError(e.message)
				}
			} finally {
				setLoading(false)
			}
		})()
	}, [send, state, search, user])

	useEffect(() => {
		if (user) return

		const userTimeout = setTimeout(() => {
			history.push("/login")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (loading) return <Loading />

	if (!user) {
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<Navbar
				sx={{
					marginBottom: "2rem",
				}}
			/>
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
						src={GradientCardIconImagePath}
						alt="Transactions icon"
						sx={{
							width: "100%",
							maxWidth: "200px",
						}}
					/>
					<Typography
						variant="h1"
						sx={{
							marginBottom: "2rem",
							textTransform: "uppercase",
							fontFamily: fonts.bizmosemi_bold,
						}}
					>
						Transactions
					</Typography>
					<Box
						sx={{
							alignSelf: "center",
							width: "100%",
							maxWidth: "600px",
							marginBottom: "2rem",
						}}
					>
						<SearchBar
							label="Search"
							placeholder={`Search your transaction history...`}
							value={search}
							onChange={(value: string) => {
								setSearch(value)
							}}
							fullWidth
						/>
					</Box>
					<TransactionGroup>
						{isWiderThan1000px ? (
							<DesktopTransactionTable transactions={condensedTransactions} />
						) : (
							<MobileTransactionTable transactions={condensedTransactions} />
						)}
						{condensedTransactions.length === 0 && (
							<Box
								sx={{
									flex: 1,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Typography variant="subtitle2" color={colors.darkerGrey}>
									{!loading && error ? error : "No transaction history"}
								</Typography>
							</Box>
						)}
					</TransactionGroup>
				</Paper>
			</Box>
		</Box>
	)
}

const TransactionGroup = styled("div")({
	flex: "1",
	alignSelf: "stretch",
	display: "flex",
	flexDirection: "column",
	overflowX: "auto",
	"&:not(:last-child)": {
		marginBottom: "2rem",
	},
})
