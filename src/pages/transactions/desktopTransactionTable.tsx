import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Box, Button, styled, Typography, TypographyProps } from "@mui/material"
import { useAuth } from "../../containers/auth"
import { supFormatter } from "../../helpers/items"
import { colors, fonts } from "../../theme"
import { Transaction } from "../../types/types"

export interface TransactionTableProps {
	transactions: Transaction[]
}

export const DesktopTransactionTable = ({ transactions }: TransactionTableProps) => {
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
			{transactions.length > 0 && (
				<Box
					component="tbody"
					sx={{
						height: "100%",
					}}
				>
					{transactions.map((t, index) => (
						<TransactionEntry key={`${t}-${index}`} transaction={t} />
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
	transaction: Transaction
}

const TransactionEntry = ({ transaction }: TransactionEntryProps) => {
	const { user } = useAuth()

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
					title={transaction.transaction_reference}
					onClick={() => navigator.clipboard.writeText(transaction.transaction_reference)}
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
						{transaction.transaction_reference}
					</EntryData>
				</Button>
			</td>
			<td align="right">
				<EntryData variant="caption">{supFormatter(transaction.amount)} SUPS</EntryData>
			</td>
			<td align="left">
				<EntryData
					variant="caption"
					sx={{
						textTransform: "uppercase",
						whiteSpace: "initial",
					}}
				>
					{transaction.description}
				</EntryData>
			</td>
			<td align="left">
				<EntryData
					variant="caption"
					sx={{
						textTransform: "uppercase",
						fontFamily: transaction.to.username === user?.username ? fonts.bizmobold : fonts.bizmomedium,
						"&::after":
							transaction.to.username === user?.username
								? {
										content: '"(You)"',
										marginLeft: "1ch",
										color: colors.darkerGrey,
								  }
								: undefined,
					}}
				>
					{transaction.to.username}
				</EntryData>
			</td>
			<td align="left">
				<EntryData
					variant="caption"
					sx={{
						textTransform: "uppercase",
						fontFamily: transaction.from.username === user?.username ? fonts.bizmobold : fonts.bizmomedium,
						"&::after":
							transaction.from.username === user?.username
								? {
										content: '"(You)"',
										marginLeft: ".2rem",
										color: colors.darkerGrey,
								  }
								: undefined,
					}}
				>
					{transaction.from.username}
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
					{transaction.created_at.toLocaleString()}
				</EntryData>
			</td>
		</EntryRow>
	)
}
