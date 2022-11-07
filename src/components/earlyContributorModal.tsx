import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"

import { FancyButton } from "./fancyButton"

interface EarlyContributorModalProps {
	open: boolean
	onClose: () => void
	signedSAFT: () => Promise<boolean | "" | undefined>
}

export const EarlyContributorModal = ({ open, onClose, signedSAFT }: EarlyContributorModalProps) => {
	return (
		<Dialog open={open} onClose={onClose} maxWidth={"xl"}>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Are you sure?
			</DialogTitle>

			<DialogContent sx={{ paddingTop: "1.5rem !important", minWidth: "400px" }}>
				<Typography>Declining this agreement will prevent your account from withdrawing</Typography>
			</DialogContent>
			<DialogActions sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "row-reverse" }}>
				<FancyButton
					onClick={async () => {
						const signed = await signedSAFT()
						if (!signed) {
							return
						}
						window.location.reload()
					}}
				>
					I understand
				</FancyButton>
				<FancyButton onClick={() => onClose()}>Back</FancyButton>
			</DialogActions>
		</Dialog>
	)
}
