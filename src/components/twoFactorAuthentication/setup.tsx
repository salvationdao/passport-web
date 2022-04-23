import { Alert, Box, Button, IconButton, Paper, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import QRCode from "react-qr-code"
import HubKey from "../../keys"
import { Logo } from "../logo"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import useCommands from "../../containers/ws/useCommands"

interface TFASecret {
	secret: string
	qrCodeStr: string
}

// TODO: fix 2fa stuff
export const TwoFactorAuthenticationSetup = () => {
	const { send } = useCommands()
	const [tfaSecret, setTFASecret] = useState<TFASecret>()
	const [showSecretCode, setShowSecretCode] = useState(false)
	const [passcode, setPasscode] = useState("")
	const [error, setError] = useState<string>()
	useEffect(() => {
		send<TFASecret>(HubKey.AuthGenerateTFA)
			.then((data) => setTFASecret(data))
			.catch((e) => {
				setError(e)
			})
	}, [send])

	const onCancel = () => {
		send(HubKey.AuthCancelTFA).catch((e) => {
			setError(e)
		})
	}

	const onSubmit = () => {
		send(HubKey.AuthTFAVerification, { passcode }).catch((e) => {
			setError(e)
		})
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
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
					}}
				>
					<IconButton aria-label="delete" size="small" onClick={onCancel}>
						<ArrowBackIcon fontSize="medium" />
					</IconButton>
					<Typography variant="h6">Two Factor Authentication Setup</Typography>
				</Box>

				<Typography variant="body2">
					Scan The following QR code with the two-factor authentication app on your mobile. If you can't use the QR code, click on the button and copy
					the code instead.
				</Typography>
				{tfaSecret && (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
							width: "100%",
							marginTop: "8px",
						}}
					>
						<Box sx={{ height: "300px", display: "flex", justifyContent: "center", alignItems: "center" }}>
							{showSecretCode ? <Typography variant="h6">{tfaSecret.secret}</Typography> : <QRCode value={tfaSecret.qrCodeStr} />}
						</Box>
						<Box m={1} />
						<Button variant="contained" onClick={() => setShowSecretCode((e) => !e)}>
							{showSecretCode ? "Show QR Code" : "Show Secret Code"}
						</Button>
					</Box>
				)}
				<Box display="flex" width="100%" marginTop="20px" justifyContent="space-between">
					<TextField variant="outlined" label="Passcode" fullWidth onChange={(e) => setPasscode(e.target.value)} />
					<Box m={2} />
					<Button variant="contained" onClick={onSubmit}>
						Submit
					</Button>
				</Box>
				{error && <Alert severity={"error"}>{error}</Alert>}
			</Paper>
		</Box>
	)
}
