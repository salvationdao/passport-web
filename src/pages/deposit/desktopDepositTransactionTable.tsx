import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Box, Button, Chip, styled, Typography, TypographyProps } from "@mui/material"
import React from "react"
import { supFormatter } from "../../helpers/items"
import { colors } from "../../theme"
import { DepositTransaction } from "../../types/types"

export interface DepositTransactionTableProps {
	transactions: DepositTransaction[]
}

export const DesktopDepositTransactionTable = ({ transactions }: DepositTransactionTableProps) => {
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
					<th align="left">Transaction Hash</th>
					<th align="right">Amount</th>
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
						<DepositTransactionEntry key={`${t}-${index}`} transaction={t} />
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
	// Transaction Hash
	"& > *:nth-of-type(1)": {
		minWidth: "150px",
		maxWidth: "150px",
	},
	// Amount
	"& > *:nth-of-type(2)": {},
	// Status
	"& > *:nth-of-type(3)": {},
	// Date
	"& > *:nth-of-type(4)": {},
})

const EntryData = styled((props: TypographyProps) => <Typography {...props} tabIndex={-1} />)({
	overflowX: "auto",
	display: "block",
	whiteSpace: "nowrap",
})

export interface DepositTransactionEntryProps {
	transaction: DepositTransaction
}

const DepositTransactionEntry = ({ transaction: entry }: DepositTransactionEntryProps) => {
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
					title={entry.tx_hash}
					onClick={() => navigator.clipboard.writeText(entry.tx_hash)}
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
						{entry.tx_hash}
					</EntryData>
				</Button>
			</td>
			<td align="right">
				<EntryData variant="caption">{supFormatter(entry.amount)} SUPS</EntryData>
			</td>
			<td align="center">
				<Chip label={entry.status} size="small" color={entry.status === "confirmed" ? "success" : "warning"} />
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
