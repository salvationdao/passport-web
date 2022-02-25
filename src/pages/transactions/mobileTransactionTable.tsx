import { Box, Skeleton, styled, Typography, TypographyProps } from "@mui/material"
import { useEffect, useState } from "react"
import { useAuth } from "../../containers/auth"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Transaction } from "../../types/types"
import { TransactionEntryProps, TransactionTableProps } from "./desktopTransactionTable"

export const MobileTransactionTable = ({ transactions }: TransactionTableProps) => {
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
				<TransactionEntry key={`${t.id}-${index}`} transactionID={t.id} />
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
				<EntryData>{entry.transactionReference}</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>Description</EntryLabel>
				<EntryData>{entry.description}</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>To</EntryLabel>
				<EntryData>{entry.to.username}</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>From</EntryLabel>
				<EntryData>{entry.from.username}</EntryData>
			</EntryDataRow>
			<EntryDataRow>
				<EntryLabel>Status</EntryLabel>
				<EntryData>{entry.status}</EntryData>
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
