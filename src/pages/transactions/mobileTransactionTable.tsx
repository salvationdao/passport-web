import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Box, Button, styled, Typography, TypographyProps } from "@mui/material"
import { useAuth } from "../../containers/auth"
import { supFormatter } from "../../helpers/items"
import { colors, fonts } from "../../theme"
import { TransactionEntryProps, TransactionTableProps } from "./desktopTransactionTable"

export const MobileTransactionTable = ({ transactions: transactionIDs }: TransactionTableProps) => {
	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					padding: ".5rem",
					borderBottom: `1px solid ${colors.navyBlue}`,
					"@media (max-width: 500px)": {
						display: "none",
					},
				}}
			>
				<EntryData>Label</EntryData>
				<EntryData>Data</EntryData>
			</Box>
			{transactionIDs.map((t, index) => (
				<TransactionEntry key={`${t}-${index}`} transaction={t} />
			))}
		</Box>
	)
}

const TransactionEntry = ({ transaction }: TransactionEntryProps) => {
	const { user } = useAuth()

	return (
		<EntryBox>
			<EntryDataRow>
				<EntryLabel>Transaction Ref.</EntryLabel>
				<Button
					sx={{
						justifyContent: "start",
						textAlign: "start",
					}}
					endIcon={<ContentCopyIcon />}
					variant="text"
					onClick={() => navigator.clipboard.writeText(transaction.transaction_reference)}
				>
					<EntryData
						sx={{
							overflowX: "hidden",
							maxWidth: "200px",
							textTransform: "uppercase",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{transaction.transaction_reference}
					</EntryData>
				</Button>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>Amount</EntryLabel>
				<EntryData>{supFormatter(transaction.amount)} SUPS</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>Description</EntryLabel>
				<EntryData>{transaction.description}</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>To</EntryLabel>
				<EntryData
					sx={{
						textTransform: "uppercase",
						fontFamily: transaction.to === user?.username ? fonts.bizmobold : fonts.bizmomedium,
						"&::after":
							transaction.to === user?.username
								? {
										content: '"(You)"',
										marginLeft: ".2rem",
										color: colors.darkerGrey,
								  }
								: undefined,
					}}
				>
					{transaction.to}
				</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>From</EntryLabel>
				<EntryData
					sx={{
						textTransform: "uppercase",
						fontFamily: transaction.from === user?.username ? fonts.bizmobold : fonts.bizmomedium,
						"&::after":
							transaction.from === user?.username
								? {
										content: '"(You)"',
										marginLeft: ".2rem",
										color: colors.darkerGrey,
								  }
								: undefined,
					}}
				>
					{transaction.from}
				</EntryData>
			</EntryDataRow>

			<EntryDataRow>
				<EntryLabel>Date</EntryLabel>
				<EntryData>{transaction.created_at.toLocaleString()}</EntryData>
			</EntryDataRow>
		</EntryBox>
	)
}

const EntryBox = styled("div")({
	display: "flex",
	flexDirection: "column",
	"&:nth-of-type(even)": {
		backgroundColor: "#160d45",
	},
})

const EntryDataRow = styled("div")({
	display: "flex",
	marginBottom: "1px",
	padding: ".5rem",
	"@media (max-width: 500px)": {
		flexDirection: "column",
	},
})

const EntryLabel = styled((props: TypographyProps) => <Typography variant="body2" {...props} />)({
	display: "inline-block",
	minWidth: "50%",
	color: colors.darkGrey,
})

const EntryData = styled(({ tabIndex, ...props }: TypographyProps) => <Typography tabIndex={-1} variant="body2" {...props} />)({
	display: "inline-block",
	minWidth: "50%",
})
