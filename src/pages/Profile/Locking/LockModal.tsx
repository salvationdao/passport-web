import { Box, Divider, Modal, Stack, Typography } from "@mui/material"
import React, { useCallback } from "react"
import { FancyButton } from "../../../components/fancyButton"
import { useSnackbar } from "../../../containers/snackbar"
import { usePassportCommandsUser } from "../../../hooks/usePassport"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { LockOptionsProps } from "./LockButton"

interface LockModalProps {
	option: LockOptionsProps
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	open: boolean
}

export const LockModal = ({ open, option, setOpen }: LockModalProps) => {
	const { displayMessage } = useSnackbar()
	const { send } = usePassportCommandsUser("/commander")

	const lockRequest = useCallback(
		async (type: string) => {
			try {
				const resp = await send<boolean>(HubKey.UserLock, {
					type,
				})
				if (resp) displayMessage(`Successfully locked ${type}.`, "success")
			} catch (e) {
				displayMessage(typeof e === "string" ? e : `Could not lock ${type}, try again or contact support.`, "error")
			}
		},
		[displayMessage, send],
	)

	return (
		<Modal open={open && option?.title !== ""} onClose={() => setOpen(false)}>
			<Box
				sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					maxWidth: "50rem",
					boxShadow: 6,
					backgroundColor: colors.darkerNavyBackground,
				}}
			>
				<Box
					sx={{
						px: "3.2rem",
						py: "2.4rem",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<Stack spacing={2}>
						<Box sx={{ display: "flex" }}>
							<WarningAmberIcon color="warning" sx={{ fontSize: "3rem", mr: "1rem" }} />
							<Typography
								variant="h5"
								sx={{ fontSize: "2rem", textTransform: "uppercase", alignSelf: "flex-end" }}
							>{`Locking ${option?.type}`}</Typography>
						</Box>
						<Divider />

						<Typography variant="body2">{option?.title}</Typography>

						<Typography variant="body2">
							If your account has been compromised, locking your account can help mitigate the damage an unauthorised user can do.
						</Typography>
						<Typography variant="body2">In order to get your unlock your account, you will have to contact support directly.</Typography>
					</Stack>

					<Stack direction="row" spacing="1rem" sx={{ alignSelf: "flex-end", mt: "1rem" }}>
						<FancyButton size="small" variant="outlined" onClick={() => setOpen(false)}>
							Cancel
						</FancyButton>

						<FancyButton
							size="small"
							variant="outlined"
							sx={{ backgroundColor: colors.neonPink }}
							onClick={() => {
								if (!option) return
								lockRequest(option.type)
								setOpen(false)
							}}
						>
							Confirm
						</FancyButton>
					</Stack>
				</Box>
			</Box>
		</Modal>
	)
}
