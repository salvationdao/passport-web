import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Box, Button, Skeleton, styled, Typography, TypographyProps } from "@mui/material"
import { useEffect, useState } from "react"
import { supFormatter } from "../../helpers/items"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Transaction } from "../../types/types"
import { TransactionEntryProps, TransactionTableProps } from "./desktopTransactionTable"
import { useCommands } from "../../containers/ws/useCommands"
import { useAuth } from "../../containers/auth"

export const MobileTransactionTable = ({ transactionIDs }: TransactionTableProps) => {
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
				<TransactionEntry key={`${t}-${index}`} transactionID={t} />
			))}
		</Box>
	)
}

const TransactionEntry = ({ transactionID }: TransactionEntryProps) => {
	const { user } = useAuth()
	const { state, send } = useCommands({ URI: "/public/commander" })
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
			<EntryBox
				sx={{
					display: "flex",
					flexDirection: "column",
					"&:nth-of-type(even)": {
						backgroundColor: "#160d45",
					},
				}}
			>
				<EntryDataRow>
					<EntryLabel>Transaction Ref.</EntryLabel>
					<EntryData color={colors.darkerGrey}>{error}</EntryData>
				</EntryDataRow>
				<EntryDataRow>
					<EntryLabel>Amount</EntryLabel>
					<EntryData color={colors.darkerGrey}>{error}</EntryData>
				</EntryDataRow>
				<EntryDataRow>
					<EntryLabel>Description</EntryLabel>
					<EntryData color={colors.darkerGrey}>{error}</EntryData>
				</EntryDataRow>
				<EntryDataRow>
					<EntryLabel>To</EntryLabel>
					<EntryData color={colors.darkerGrey}>{error}</EntryData>
				</EntryDataRow>
				<EntryDataRow>
					<EntryLabel>From</EntryLabel>
					<EntryData color={colors.darkerGrey}>{error}</EntryData>
				</EntryDataRow>
				<EntryDataRow>
					<EntryLabel>Date</EntryLabel>
					<EntryData color={colors.darkerGrey}>{error}</EntryData>
				</EntryDataRow>
			</EntryBox>
		)

	if (!entry)
		return (
			<Skeleton
				sx={{
					display: "flex",
					flexDirection: "column",
					maxWidth: "initial",
					borderRadius: 0,
					transform: "none",
					"&:nth-of-type(even)": {
						backgroundColor: "#160d45",
					},
				}}
			>
				<EntryDataRow>
					<EntryLabel>Transaction Ref.</EntryLabel>
					<EntryData color={colors.darkerGrey}>Loading entry...</EntryData>
				</EntryDataRow>
				<EntryDataRow>
					<EntryLabel>Amount</EntryLabel>
					<EntryData color={colors.darkerGrey}>Loading entry...</EntryData>
				</EntryDataRow>
				<EntryDataRow>
					<EntryLabel>Description</EntryLabel>
					<EntryData color={colors.darkerGrey}>Loading entry...</EntryData>
				</EntryDataRow>
				<EntryDataRow>
					<EntryLabel>To</EntryLabel>
					<EntryData color={colors.darkerGrey}>Loading entry...</EntryData>
				</EntryDataRow>
				<EntryDataRow>
					<EntryLabel>From</EntryLabel>
					<EntryData color={colors.darkerGrey}>Loading entry...</EntryData>
				</EntryDataRow>
				<EntryDataRow>
					<EntryLabel>Date</EntryLabel>
					<EntryData color={colors.darkerGrey}>Loading entry...</EntryData>
				</EntryDataRow>
			</Skeleton>
		)

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
					onClick={() => navigator.clipboard.writeText(entry.transaction_reference)}
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
						{entry.transaction_reference}
					</EntryData>
				</Button>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>Amount</EntryLabel>
				<EntryData>{supFormatter(entry.amount)} SUPS</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>Description</EntryLabel>
				<EntryData>{entry.description}</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>To</EntryLabel>
				<EntryData
					sx={{
						textTransform: "uppercase",
						fontFamily: entry.to.username === user?.username ? fonts.bizmobold : fonts.bizmomedium,
						"&::after":
							entry.to.username === user?.username
								? {
										content: '"(You)"',
										marginLeft: ".2rem",
										color: colors.darkerGrey,
								  }
								: undefined,
					}}
				>
					{entry.to.username}
				</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>From</EntryLabel>
				<EntryData
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
