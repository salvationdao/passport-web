import { Dialog, DialogActions, DialogTitle } from "@mui/material"
import { FancyButton } from "./fancyButton"

interface EarlyContributorModalProps {
	open: boolean
}

export const EarlyContributorErrorModal = ({ open }: EarlyContributorModalProps) => {
	return (
		<Dialog
			open={open}
			onClose={() => {
				window.location.reload()
			}}
			maxWidth={"xl"}
		>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Failed to sign message. Please try again!
			</DialogTitle>

			<DialogActions sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "row-reverse" }}>
				<FancyButton
					onClick={() => {
						window.location.reload()
					}}
				>
					Try Again
				</FancyButton>
			</DialogActions>
		</Dialog>
	)
}
