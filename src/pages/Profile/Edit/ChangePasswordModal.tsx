import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { Box, Divider, Modal, Stack, TextField, Typography } from "@mui/material"
import React from "react"
import { FancyButton } from "../../../components/fancyButton"
import { useAuth } from "../../../containers/auth"
import { colors } from "../../../theme"

interface IChangePasswordModalProps {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	setSuccessfull: React.Dispatch<React.SetStateAction<boolean>>
	setDisplayResult: React.Dispatch<React.SetStateAction<boolean>>
	open: boolean
	new?: boolean
}

export const ChangePasswordModal: React.FC<IChangePasswordModalProps> = ({ open, setOpen, setSuccessfull, setDisplayResult }) => {
	const { changePassword } = useAuth()
	const [error, setError] = React.useState<string | null>(null)

	const errorCallback = (msg: string) => {
		setError(msg)
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const password = data.get("password")?.toString()
		const newPassword = data.get("newPassword")?.toString()
		if (!password || !newPassword) {
			return
		}
		if (newPassword !== password) {
			setError("Password does not match")
			return
		}

		await changePassword.action(password, newPassword, errorCallback)
		if (!error) {
			setSuccessfull(true)
			setDisplayResult(true)
			setOpen(false)
		}
	}
	const formatError = error?.split(" ")
	let firstWordError = ""
	if (formatError) {
		firstWordError = formatError[0]
	}
	formatError?.shift()

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
					component="form"
					onSubmit={handleSubmit}
				>
					<Stack spacing={2}>
						<Box sx={{ display: "flex" }}>
							<WarningAmberIcon color="warning" sx={{ fontSize: "3rem", mr: "1rem" }} />
							<Typography variant="h5" sx={{ fontSize: "2rem", textTransform: "uppercase", alignSelf: "flex-end" }}>
								Change Password
							</Typography>
						</Box>
						<Divider />
						<Typography variant="body2">Changing your password will disconnect user from all other sessions.</Typography>
						<Typography variant="body2">Please enter your current password and new password:</Typography>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							inputProps={{ minLength: 8 }}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="newPassword"
							label="New Password"
							type="password"
							id="newPassword"
							inputProps={{ minLength: 8 }}
							onChange={() => {
								if (error) {
									setError(null)
								}
							}}
						/>
						{formatError && (
							<Box sx={{ display: "flex" }}>
								<Typography
									component="span"
									variant="caption"
									sx={{ color: colors.errorRed, width: "fit-content", textAlign: "left", textTransform: "capitalize" }}
								>
									{firstWordError}&nbsp;
								</Typography>
								<Typography
									component="span"
									variant="caption"
									sx={{ color: colors.errorRed, width: "fit-content", textAlign: "left" }}
								>
									{formatError.join(" ")}
								</Typography>
							</Box>
						)}
					</Stack>

					<Stack direction="row" spacing="1rem" sx={{ alignSelf: "flex-end", mt: "1rem" }}>
						<FancyButton size="small" variant="outlined" onClick={() => setOpen(false)}>
							Cancel
						</FancyButton>

						<FancyButton
							size="small"
							variant="outlined"
							loading={changePassword.loading}
							submit
							sx={{ backgroundColor: colors.neonPink }}
						>
							Confirm
						</FancyButton>
					</Stack>
				</Box>
			</Box>
		</Modal>
	)
}
