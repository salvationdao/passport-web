import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Box, Button, Chip, Skeleton, styled, Typography, TypographyProps } from "@mui/material"
import { useEffect, useState } from "react"
import { useAuth } from "../../containers/auth"
import { SocketState, useWebsocket } from "../../containers/socket"
import { supFormatter } from "../../helpers/items"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Transaction } from "../../types/types"
import { TransactionEntryProps, TransactionTableProps } from "./desktopTransactionTable"

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
					<EntryLabel>Status</EntryLabel>
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
					<EntryLabel>Status</EntryLabel>
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
						textAlign: "start",
						justifyContent: "start",
					}}
					endIcon={<ContentCopyIcon />}
					variant="text"
					onClick={() => navigator.clipboard.writeText(entry.transactionReference)}
				>
					<EntryData>{entry.transactionReference}</EntryData>
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
				<EntryLabel>Status</EntryLabel>
				<Box
					sx={{
						minWidth: "50%",
						textTransform: "capitalize",
					}}
				>
					<Chip label={entry.status} size="small" color={entry.status === "success" ? "success" : "error"} />
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

const EntryData = styled((props: TypographyProps) => <Typography variant="body2" {...props} />)({
	display: "inline-block",
	minWidth: "50%",
})
