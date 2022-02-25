import { Box, Paper, Skeleton, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
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

	if (loading) return <Loading />

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
							display: "flex",
							flexDirection: "column",
							width: "100%",
							maxWidth: "1000px",
						}}
					>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns:
									"minmax(150px, 1fr) minmax(300px, 2fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)",
								gap: "1rem",
								padding: ".5rem .5rem",
								borderBottom: `1px solid ${colors.navyBlue}`,
								"& > *": {
									overflowX: "auto",
									whiteSpace: "nowrap",
								},
							}}
						>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Transaction #
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Transaction Description
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									To
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									From
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Status
								</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Date
								</Typography>
							</Box>
						</Box>

						{transactionIDs.map((t, index) => (
							<TransactionEntry key={`${t}-${index}`} transactionID={t} />
						))}
					</Box>
				</Paper>
			</Box>
		</Box>
	)
}

interface TransactionEntryProps {
	transactionID: number
}

const TransactionEntry = ({ transactionID }: TransactionEntryProps) => {
	const { user } = useAuth()
	const { state, subscribe } = useWebsocket()
	const [entry, setEntry] = useState<Transaction>()
	const [search, setSearch] = useState("")
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
	}, [subscribe, state, user])

	if (error)
		return (
			<Box
				sx={{
					padding: ".5rem .5rem",
					"&:nth-of-type(even)": {
						backgroundColor: "#160d45",
					},
				}}
			>
				<Typography
					variant="caption"
					sx={{
						textTransform: "uppercase",
					}}
				>
					{error}
				</Typography>
			</Box>
		)

	if (!entry)
		return (
			<Skeleton
				sx={{
					maxWidth: "unset",
					padding: ".5rem .5rem",
					borderRadius: 0,
					transform: "none",
					"&:nth-of-type(even)": {
						backgroundColor: "#160d45",
					},
				}}
			>
				<Typography
					variant="caption"
					sx={{
						textTransform: "uppercase",
					}}
				>
					Loading transaction entry...
				</Typography>
			</Skeleton>
		)

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "minmax(150px, 1fr) minmax(300px, 2fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr)",
				gap: "1rem",
				padding: ".5rem .5rem",
				"&:nth-of-type(even)": {
					backgroundColor: "#160d45",
				},
				"& > *": {
					overflowX: "auto",
					whiteSpace: "nowrap",
				},
			}}
		>
			<Box>
				<Typography
					variant="caption"
					sx={{
						textTransform: "uppercase",
					}}
				>
					{entry.transactionReference}
				</Typography>
			</Box>
			<Box>
				<Typography
					variant="caption"
					sx={{
						textTransform: "uppercase",
					}}
				>
					{entry.description}
				</Typography>
			</Box>
			<Box>
				<Typography
					variant="caption"
					sx={{
						textTransform: "uppercase",
					}}
				>
					{entry.to.username}
				</Typography>
			</Box>
			<Box>
				<Typography
					variant="caption"
					sx={{
						textTransform: "uppercase",
					}}
				>
					{entry.from.username}
				</Typography>
			</Box>
			<Box>
				<Typography
					variant="caption"
					sx={{
						textTransform: "uppercase",
					}}
				>
					{entry.status}
				</Typography>
			</Box>
			<Box>
				<Typography
					variant="caption"
					sx={{
						textTransform: "uppercase",
					}}
				>
					{entry.created_at.toLocaleString()}
				</Typography>
			</Box>
		</Box>
	)
}
