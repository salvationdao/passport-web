import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { Alert, Box, Divider, Modal, Stack, TextField, Typography } from "@mui/material"
import React from "react"
import { FancyButton } from "../../../components/fancyButton"
import { useAuth } from "../../../containers/auth"
import { colors } from "../../../theme"

interface IChangePasswordModalProps {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	setSuccessfull: React.Dispatch<React.SetStateAction<boolean>>
	setDisplayResult: React.Dispatch<React.SetStateAction<boolean>>
	open: boolean
	isNew?: boolean
}

export const ChangePasswordModal: React.FC<IChangePasswordModalProps> = ({ open, setOpen, setSuccessfull, setDisplayResult, isNew }) => {
	const { changePassword, newPassword } = useAuth()
	const [error, setError] = React.useState<string | null>(null)

	const errorCallback = (msg: string) => {
		setError(msg)
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const data = new FormData(event.currentTarget)
		const password = data.get("password")?.toString()
		const password2 = data.get(isNew ? "confirmPassword" : "newPassword")?.toString()
		if (!password || !password2) {
			return
		}
		if (password2 !== password) {
			if (isNew) {
				setError("Password does not match")
				return
			}
		}

		if (isNew) {
			await newPassword.action(password, errorCallback)
		} else {
			await changePassword.action(password, password2, errorCallback)
		}
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
					backgroundColor: colors.black2,
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
								{isNew ? "Setup Password" : "Change Password"}
							</Typography>
						</Box>
						<Divider />
						<Typography variant="body2">
							{isNew ? "Setting up" : "Changing"} your password will disconnect user from all other sessions.
						</Typography>
						<Box
							component="ul"
							sx={{
								"& li": {
									ml: "1rem",
									textAlign: "left",
								},
							}}
						>
							Password need to contain at least 8 characters and:
							<li>At least 1 number</li>
							<li>At least 1 lowercase letter</li>
							<li>At least 1 uppercase letter</li>
						</Box>
						<Typography variant="body2">Please enter your {!isNew && "current password and"}&nbsp;new password:</Typography>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label={isNew ? "Password" : "Current Password"}
							type="password"
							id="password"
							autoComplete="current-password"
							inputProps={{ minLength: 8 }}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name={isNew ? "confirmPassword" : "newPassword"}
							label={isNew ? "Confirm Password" : "New Password"}
							type="password"
							id={isNew ? "confirmPassword" : "newPassword"}
							inputProps={{ minLength: 8 }}
							onChange={() => {
								if (error) {
									setError(null)
								}
							}}
						/>
						{formatError && (
							<Alert severity="error">
								<span style={{ textTransform: "capitalize" }}>{firstWordError}</span>&nbsp;
								{formatError.join(" ")}
							</Alert>
						)}
					</Stack>

					<Stack direction="row" spacing="1rem" sx={{ alignSelf: "flex-end", mt: "1rem" }}>
						<FancyButton size="small" variant="outlined" onClick={() => setOpen(false)}>
							Cancel
						</FancyButton>

						<FancyButton
							size="small"
							variant="outlined"
							loading={isNew ? newPassword.loading : changePassword.loading}
							submit
							sx={{ backgroundColor: colors.neonPink }}
						>
							Submit
						</FancyButton>
					</Stack>
				</Box>
			</Box>
		</Modal>
	)
}
