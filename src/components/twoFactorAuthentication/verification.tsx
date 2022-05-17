import { Box, Button, Paper, TextField, Typography } from "@mui/material"
import { red } from "@mui/material/colors"
import { useState } from "react"
import HubKey from "../../keys"
import { Logo } from "../logo"
import { useCommands } from "../../containers/ws/useCommands"

export const TwoFactorAuthenticationVerification = () => {
	const { send } = useCommands({ URI: "/public/commander" })
	const [code, setCode] = useState("")
	const [errMessage, setErrMessage] = useState("")

	const [isRecovery, setIsRecovery] = useState(false)

	const onSubmit = () => {
		if (isRecovery) {
			send(HubKey.AuthTFARecovery, { recoveryCode: code }).catch((e) => setErrMessage(e))
			return
		}
		send(HubKey.AuthTFAVerification, { passcode: code }).catch((e) => setErrMessage(e))
	}
	// get 2fa secret
	return (
		<Box
			sx={{
				minHeight: "100%",
				width: "100%",
				backgroundColor: "primary.main",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
			}}
		>
			<Logo />
			<Paper
				sx={{
					padding: "1.5rem",
					width: "70%",
					maxWidth: "600px",
					boxShadow: 2,
				}}
			>
				<Typography sx={{ marginBottom: "5px" }} variant="h6">
					{isRecovery ? "Recovery Process" : "Two Factor Authentication Verification"}
				</Typography>

				<Box display="flex" width="100%" marginTop="20px" justifyContent="space-between">
					<TextField
						variant="outlined"
						label={isRecovery ? "Recovery Code" : "Passcode"}
						fullWidth
						onChange={(e) => setCode(e.target.value)}
						helperText={
							<Typography variant="caption" color={red[300]}>
								{errMessage}
							</Typography>
						}
					/>
					<Box m={2} />
					<Button variant="contained" onClick={onSubmit}>
						Submit
					</Button>
				</Box>
				<Box m={1} />
				<Button color="primary" onClick={() => setIsRecovery((e) => !e)}>
					{isRecovery ? "Back to two-factor authentication" : "Lost your device? Click here to enter recovery code"}
				</Button>
			</Paper>
		</Box>
	)
}
