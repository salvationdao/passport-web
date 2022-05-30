import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material"

export const LockedModal = ({
	remainingTime,
	open,
	unlocked_at,
	setClose,
}: {
	open: boolean
	unlocked_at: Date
	setClose: () => void
	remainingTime: string
}) => {
	return (
		<Dialog
			open={open}
			onClose={() => {
				setClose()
			}}
		>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color="primary"
			>
				Asset Preparing for Transport
			</DialogTitle>
			<DialogContent>
				<Typography variant="h5" color="error" marginBottom=".5rem">
					GABS WARNING:
				</Typography>
				<Typography>After beginning the transport process for your NFT, the asset is locked for five minutes.</Typography>
				<Typography variant={"subtitle1"}>Remaining: {remainingTime}</Typography>
			</DialogContent>
		</Dialog>
	)
}
