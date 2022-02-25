import { Box, Chip, styled, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useAuth } from "../../containers/auth"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Transaction } from "../../types/types"

export interface TransactionTableProps {
	transactions: { id: string; groupID: string }[]
}

export const DesktopTransactionTable = ({ transactions }: TransactionTableProps) => {
	return (
		<Box
			component="table"
			sx={{
				borderCollapse: "collapse",
			}}
		>
			<EntryHeader>
				<EntryRow>
					<th align="left">Transaction Ref.</th>
					<th align="left">Description</th>
					<th align="left">To</th>
					<th align="left">From</th>
					<th align="center">Status</th>
					<th align="right">Date</th>
				</EntryRow>
			</EntryHeader>
			{transactions.length > 0 && (
				<Box
					component="tbody"
					sx={{
						height: "100%",
					}}
				>
					{transactions.map((t, index) => (
						<TransactionEntry key={`${t.id}-${index}`} transactionID={t.id} />
					))}
				</Box>
			)}
		</Box>
	)
}

const EntryHeader = styled("thead")({
	borderBottom: `1px solid ${colors.navyBlue}`,
	width: "100%",
})

const EntryRow = styled("tr")({
	"& > *": {
		padding: ".5rem",
	},
	// Transaction Ref.
	"& > *:nth-of-type(1)": {
		minWidth: "220px",
		maxWidth: "220px",
	},
	// Description
	"& > *:nth-of-type(2)": {},
	// To
	"& > *:nth-of-type(3)": {},
	// From
	"& > *:nth-of-type(4)": {},
	// Status
	"& > *:nth-of-type(5)": {},
	// Date
	"& > *:nth-of-type(6)": {},
})

const EntryData = styled(Typography)({
	overflowX: "auto",
	display: "block",
	whiteSpace: "nowrap",
})

export interface TransactionEntryProps {
	transactionID: string
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
						whiteSpace: "initial",
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
