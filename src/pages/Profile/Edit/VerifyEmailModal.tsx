import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { Alert, Box, Divider, Modal, Stack, TextField, Typography } from "@mui/material"
import React, { useState } from "react"
import { FancyButton } from "../../../components/fancyButton"
import { useAuth } from "../../../containers/auth"
import { useSnackbar } from "../../../containers/snackbar"
import { colors } from "../../../theme"

interface IChangePasswordModalProps {
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	updateUserHandler: (errCallback?: (err: any) => void) => Promise<void>
	open: boolean
}

export const VerifyEmailModal: React.FC<IChangePasswordModalProps> = ({ open, setOpen, updateUserHandler }) => {
	const { displayMessage } = useSnackbar()
	const [error, setError] = useState<string | null>(null)
	const [code, setCode] = useState("")
	const { verifyCode, emailCode } = useAuth()
	const [loading, setLoading] = useState(false)

	const errorCallback = (msg: string) => {
		setError(msg)
	}

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!code || !emailCode) {
			setError("No code has been set.")
			return
		}

		if (!emailCode.token) {
			setError("No code has been set.")
			return
		}
		// Validate code
		const success = await verifyCode.action(emailCode?.token, code.toLowerCase())

		if (!success) {
			setError("Incorrect code. Please try again.")
		} else {
			try {
				setLoading(true)
				await updateUserHandler(errorCallback)
				setOpen(false)
				displayMessage("Success! You have verified your email.", "success")
			} catch (e: any) {
				let errMsg = "Something went wrong, please try again."
				if (e.message) {
					errMsg = e.message
				}
				setError(errMsg)
			} finally {
				setLoading(false)
			}
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
								Verify email
							</Typography>
						</Box>
						<Divider />
						<Typography variant="body2">Please check your email for a digit code to verify the update.</Typography>
						<TextField
							sx={{ mt: "1rem" }}
							placeholder="Enter code"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							inputProps={{
								style: {
									margin: "1rem auto",
									padding: "0 1rem",
									width: `${10 * 1.5}ch`,
									background: `repeating-linear-gradient(90deg, dimgrey 0, 
									 "dimgrey"
									}1ch, transparent 0, transparent 1.6ch) 0 100%/ 10ch 2px no-repeat`,
									font: `2.4ch Nostromo Regular Medium`,
									letterSpacing: ".6ch",
									textAlign: "center",
								},
								maxLength: 5,
								spellCheck: false,
							}}
							onFocus={() => {
								if (error) {
									setError(null)
								}
							}}
							InputProps={{ disableUnderline: true }}
						/>
						{formatError && (
							<Alert severity="error">
								<span style={{ textTransform: "capitalize" }}>{firstWordError}</span>&nbsp;
								{formatError.join(" ")}
							</Alert>
						)}
					</Stack>

					<Stack spacing=".5rem" sx={{ justifyContent: "center", mt: "1rem" }}>
						<FancyButton
							size="small"
							variant="outlined"
							loading={loading}
							submit
							sx={{ backgroundColor: colors.neonPink, fontSize: "1rem" }}
						>
							Submit
						</FancyButton>
						<Typography
							component="span"
							sx={{ alignSelf: "center", fontSize: ".8rem", cursor: "pointer" }}
							onClick={() => setOpen(false)}
						>
							Cancel
						</Typography>
					</Stack>
				</Box>
			</Box>
		</Modal>
	)
}
