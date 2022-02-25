import { Box, Chip, Paper, styled, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { GradientCardIconImagePath } from "../assets"
import { Navbar } from "../components/home/navbar"
import { Loading } from "../components/loading"
import { SearchBar } from "../components/searchBar"
import { useAuth } from "../containers/auth"
import { SocketState, useWebsocket } from "../containers/socket"
import HubKey from "../keys"
import { colors, fonts } from "../theme"
import { Transaction } from "../types/types"

export const TransactionsPage = () => {
	const history = useHistory()
	const { user } = useAuth()
	const { send, state } = useWebsocket()
	const [search, setSearch] = useState("")
	const [transactionIDs, setTransactionIDs] = useState<number[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (state !== SocketState.OPEN || !send || !user) return
		;(async () => {
			setLoading(true)
			try {
				const resp = await send<{ total: number; transactionIDs: number[] }>(HubKey.TransactionList, {
					pageSize: 10,
					search,
				})
				setTransactionIDs(resp.transactionIDs)
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
					<Box
						sx={{
							flex: "1",
							display: "flex",
							flexDirection: "column",
							width: "100%",
							maxWidth: "1000px",
							overflowX: "auto",
						}}
					>
						<Box
							component="table"
							sx={{
								borderCollapse: "collapse",
							}}
						>
							<Box
								component="thead"
								sx={{
									borderBottom: `1px solid ${colors.navyBlue}`,
									width: "100%",
								}}
							>
								<EntryRow>
									<th align="left">Transaction Ref.</th>
									<th align="left">Description</th>
									<th align="left">To</th>
									<th align="left">From</th>
									<th align="center">Status</th>
									<th align="right">Date</th>
								</EntryRow>
							</Box>
							{transactionIDs.length > 0 && (
								<Box
									component="tbody"
									sx={{
										height: "100%",
									}}
								>
									{transactionIDs.map((t, index) => (
										<TransactionEntry key={`${t}-${index}`} transactionID={t} />
									))}
								</Box>
							)}
						</Box>
						{transactionIDs.length === 0 && (
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
					</Box>
				</Paper>
			</Box>
		</Box>
	)
}

const EntryRow = styled("tr")({
	"& > *": {
		padding: ".5rem",
	},
	"& > *:nth-of-type(1)": {
		minWidth: "220px",
		maxWidth: "220px",
	},
	"& > *:nth-of-type(2)": {
		minWidth: "300px",
		maxWidth: "300px",
	},
	"& > *:nth-of-type(3)": {
		minWidth: "150px",
		maxWidth: "150px",
	},
	"& > *:nth-of-type(4)": {
		minWidth: "150px",
		maxWidth: "150px",
	},
	"& > *:nth-of-type(5)": {
		minWidth: "100px",
		maxWidth: "100px",
	},
	"& > *:nth-of-type(6)": {
		minWidth: "200px",
		maxWidth: "200px",
	},
})

const EntryData = styled(Typography)({
	overflowX: "auto",
	display: "block",
	whiteSpace: "nowrap",
})

interface TransactionEntryProps {
	transactionID: number
}

const TransactionEntry = ({ transactionID }: TransactionEntryProps) => {
	const { user } = useAuth()
	const { state, subscribe } = useWebsocket()
	const [entry, setEntry] = useState<Transaction>()
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (state !== SocketState.OPEN || !subscribe || !user) return

		try {
			return subscribe<Transaction>(
				HubKey.TransactionSubscribe,
				(payload) => {
					setEntry(payload)
				},
				{ transactionID },
			)
		} catch (e) {
			if (typeof e === "string") {
				setError(e)
			} else if (e instanceof Error) {
				setError(e.message)
			}
		}
	}, [subscribe, state, user, transactionID])

	if (error)
		return (
			<EntryRow
				sx={{
					"&:nth-of-type(even)": {
						backgroundColor: "#160d45",
					},
				}}
			>
				<td align="left">An error occurred while loading this entry</td>
				<td align="left"></td>
				<td align="left"></td>
				<td align="left"></td>
				<td align="center"></td>
				<td align="right"></td>
			</EntryRow>
		)

	if (!entry)
		return (
			<EntryRow
				sx={{
					"&:nth-of-type(even)": {
						backgroundColor: "#160d45",
					},
				}}
			>
				<td align="left">Loading transaction entry...</td>
				<td align="left"></td>
				<td align="left"></td>
				<td align="left"></td>
				<td align="center"></td>
				<td align="right"></td>
			</EntryRow>
		)

	return (
		<EntryRow
			sx={{
				"&:nth-of-type(even)": {
					backgroundColor: "#160d45",
				},
			}}
		>
			<td align="left">
				<EntryData
					variant="caption"
					sx={{
						textTransform: "uppercase",
					}}
				>
					{entry.transactionReference}
				</EntryData>
			</td>
			<td align="left">
				<EntryData
					variant="caption"
					sx={{
						textTransform: "uppercase",
					}}
				>
					{entry.description}
				</EntryData>
			</td>
			<td align="left">
				<EntryData
					variant="caption"
					sx={{
						textTransform: "uppercase",
						fontFamily: entry.to.username === user?.username ? fonts.bizmobold : fonts.bizmomedium,
						"&::after":
							entry.to.username === user?.username
								? {
										content: '"(You)"',
										marginLeft: "1ch",
								  }
								: undefined,
					}}
				>
					{entry.to.username}
				</EntryData>
			</td>
			<td align="left">
				<EntryData
					variant="caption"
					sx={{
						textTransform: "uppercase",
						fontFamily: entry.from.username === user?.username ? fonts.bizmobold : fonts.bizmomedium,
						"&::after":
							entry.from.username === user?.username
								? {
										content: '"(You)"',
										marginLeft: ".2rem",
										color: colors.darkerGrey,
								  }
								: undefined,
					}}
				>
					{entry.from.username}
				</EntryData>
			</td>
			<td align="center">
				<Chip label={entry.status} size="small" color={entry.status === "success" ? "success" : "error"} />
			</td>
			<td align="right">
				<EntryData
					variant="caption"
					sx={{
						display: "block",
						textAlign: "end",
						textTransform: "uppercase",
					}}
				>
					{entry.created_at.toLocaleString()}
				</EntryData>
			</td>
		</EntryRow>
	)
}
