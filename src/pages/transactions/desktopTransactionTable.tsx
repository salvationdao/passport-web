import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Box, Button, styled, Typography, TypographyProps } from "@mui/material"
import { useEffect, useState } from "react"
import { supFormatter } from "../../helpers/items"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Transaction } from "../../types/types"
import useCommands from "../../containers/ws/useCommands"
import { useAuth } from "../../containers/auth"

export interface TransactionTableProps {
	transactionIDs: string[]
}

export const DesktopTransactionTable = ({ transactionIDs }: TransactionTableProps) => {
	return (
		<Box
			component="table"
			sx={{
				width: "100%",
				borderCollapse: "collapse",
			}}
		>
			<EntryHeader>
				<EntryRow>
					<th align="left">Transaction Ref.</th>
					<th align="right">Amount</th>
					<th align="left">Description</th>
					<th align="left">To</th>
					<th align="left">From</th>
					<th align="right">Date</th>
				</EntryRow>
			</EntryHeader>
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
		minWidth: "150px",
		maxWidth: "150px",
	},
	// Amount
	"& > *:nth-of-type(2)": {},
	// Description
	"& > *:nth-of-type(3)": {},
	// To
	"& > *:nth-of-type(4)": {},
	// From
	"& > *:nth-of-type(5)": {
		textTransform: "capitalize",
	},
	// Status
	"& > *:nth-of-type(6)": {},
	// Date
	"& > *:nth-of-type(7)": {},
})

const EntryData = styled((props: TypographyProps) => <Typography {...props} tabIndex={-1} />)({
	overflowX: "auto",
	display: "block",
	whiteSpace: "nowrap",
})

export interface TransactionEntryProps {
	transactionID: string
}

const TransactionEntry = ({ transactionID }: TransactionEntryProps) => {
	const { user } = useAuth()
	const { state, send } = useCommands()
	const [entry, setEntry] = useState<Transaction>()
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (state !== WebSocket.OPEN || !user) return

		try {
			send<Transaction>(HubKey.TransactionSubscribe, { transaction_id: transactionID }).then((payload) => {
				if (!payload) return
				setEntry(payload)
			})
		} catch (e) {
			if (typeof e === "string") {
				setError(e)
			} else if (e instanceof Error) {
				setError(e.message)
			}
		}
	}, [state, user, transactionID, send])

	if (error)
		return (
			<EntryRow
				sx={{
					"&:nth-of-type(odd)": {
						backgroundColor: "#160d45",
					},
				}}
			>
				<td align="left">An error occurred while loading this entry</td>
				<td align="right"></td>
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
					"&:nth-of-type(odd)": {
						backgroundColor: "#160d45",
					},
				}}
			>
				<td align="left">Loading transaction entry...</td>
				<td align="right"></td>
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
				"&:nth-of-type(odd)": {
					backgroundColor: "#160d45",
				},
			}}
		>
			<td align="left">
				<Button
					title={entry.transaction_reference}
					onClick={() => navigator.clipboard.writeText(entry.transaction_reference)}
					endIcon={<ContentCopyIcon />}
					variant="text"
					fullWidth
				>
					<EntryData
						variant="caption"
						sx={{
							overflowX: "hidden",
							textTransform: "uppercase",
							textOverflow: "ellipsis",
						}}
					>
						{entry.transaction_reference}
					</EntryData>
				</Button>
			</td>
			<td align="right">
				<EntryData variant="caption">{supFormatter(entry.amount)} SUPS</EntryData>
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
										color: colors.darkerGrey,
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
