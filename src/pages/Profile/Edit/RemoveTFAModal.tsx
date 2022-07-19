import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { Box, Divider, Modal, Stack, Typography } from "@mui/material"
import React, { useCallback, useState } from "react"
import { FancyButton } from "../../../components/fancyButton"
import { useAuth } from "../../../containers/auth"
import { useSnackbar } from "../../../containers/snackbar"
import { usePassportCommandsUser } from "../../../hooks/usePassport"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { User } from "../../../types/types"

interface RemoveTFAModalProps {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	setDisplayResult: React.Dispatch<React.SetStateAction<boolean>>
	setSuccessful: React.Dispatch<React.SetStateAction<boolean>>
	open: boolean
}

export const RemoveTFAModal = ({ open, setOpen, setDisplayResult, setSuccessful }: RemoveTFAModalProps) => {
	const { displayMessage } = useSnackbar()
	const { send } = usePassportCommandsUser("/commander")
	const { setUser } = useAuth()
	const [loading, setLoading] = useState(false)

	const handleSubmit = useCallback(async () => {
		setLoading(true)
		try {
			const resp = await send<User>(HubKey.UserTFACancel)
			if (!resp.id) {
				throw resp
			}
			setUser(resp)
		} catch (err) {
			console.error(err)
			displayMessage("Failed to remove Two-Factor authentication.", "error")
		} finally {
			setOpen(false)
			setLoading(false)
			setSuccessful(true)
			setDisplayResult(true)
		}
	}, [displayMessage, send, setSuccessful, setDisplayResult, setOpen, setUser])

	return (
		<Modal open={open} onClose={() => setOpen(false)}>
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
							<Typography variant="h2" sx={{ fontSize: "1.4rem", textTransform: "uppercase", alignSelf: "flex-end" }}>
								Remove Two-Factor Authentication
							</Typography>
						</Box>
						<Divider />

						<Typography variant="body2" sx={{ fontSize: "120%" }}>
							You are about to remove two-factor authentication from your account.
							<br /> Click cancel to go back to profile page.
						</Typography>
					</Stack>

					<Stack direction="row" spacing="1rem" sx={{ alignSelf: "flex-end", mt: "1rem" }}>
						<FancyButton size="small" variant="outlined" onClick={() => setOpen(false)}>
							Cancel
						</FancyButton>

						<FancyButton
							loading={loading}
							size="small"
							variant="outlined"
							sx={{ backgroundColor: colors.neonPink }}
							onClick={handleSubmit}
						>
							Confirm
						</FancyButton>
					</Stack>
				</Box>
			</Box>
		</Modal>
	)
}
