import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Box, Button, Chip, styled, Typography, TypographyProps } from "@mui/material"
import { supFormatter } from "../../helpers/items"
import { colors } from "../../theme"
import { DepositTransactionEntryProps, DepositTransactionTableProps } from "./desktopDepositTransactionTable"

export const MobileDepositTransactionTable = ({ transactions }: DepositTransactionTableProps) => {
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
			{transactions.map((t, index) => (
				<DepositTransactionEntry key={`${t}-${index}`} transaction={t} />
			))}
		</Box>
	)
}

const DepositTransactionEntry = ({ transaction: entry }: DepositTransactionEntryProps) => {
	return (
		<EntryBox>
			<EntryDataRow>
				<EntryLabel>Transaction Hash</EntryLabel>
				<Button
					sx={{
						justifyContent: "start",
						textAlign: "start",
					}}
					endIcon={<ContentCopyIcon />}
					variant="text"
					onClick={() => navigator.clipboard.writeText(entry.tx_hash)}
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
						{entry.tx_hash}
					</EntryData>
				</Button>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>Amount</EntryLabel>
				<EntryData>{supFormatter(entry.amount)} SUPS</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>Status</EntryLabel>
				<Box
					sx={{
						minWidth: "50%",
						textTransform: "capitalize",
					}}
				>
					<Chip label={entry.status} size="small" color={entry.status === "confirmed" ? "success" : "warning"} />
				</Box>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>Date</EntryLabel>
				<EntryData>{entry.created_at.toLocaleString()}</EntryData>
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
