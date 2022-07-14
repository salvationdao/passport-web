import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { LoadingButton } from "@mui/lab"
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import QRCode from "react-qr-code"
import { Link, useHistory, useParams } from "react-router-dom"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { User } from "../../types/types"

interface TFASecret {
	secret: string
	qr_code_str: string
}

export const TwoFactorAuthenticationSetup = () => {
	const { send } = usePassportCommandsUser("/commander")
	const { id } = useParams<{ id: string }>()
	const { userID, setUser } = useAuth()
	const history = useHistory()
	const [tfaSecret, setTFASecret] = useState<TFASecret>()
	const [showSecretCode, setShowSecretCode] = useState(false)
	const [passcode, setPasscode] = useState("")
	const [error, setError] = useState<string>()
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		send<TFASecret>(HubKey.UserTFAGenerate)
			.then((data) => setTFASecret(data))
			.catch((e) => {
				setError(e)
			})

		if (id !== userID) {
			window.location.replace(`/profile/${userID}/edit`)
		}
	}, [send, userID, id])

	const onCancel = useCallback(() => {
		send(HubKey.UserTFACancel).catch((e) => {
			setError(e)
		})
		setTFASecret(undefined)
		window.location.replace(`/profile/${id}/edit`)
	}, [send, id])

	const onSubmit = useCallback(async () => {
		try {
			setLoading(true)
			const resp = await send<User>(HubKey.UserTFAVerification, { passcode })
			if (!resp.id) {
				throw resp
			}
			// Trigger loading
			setTFASecret(undefined)
			setUser(resp)
			history.push(`/tfa/${id}/recovery-code`)
		} catch (err: any) {
			console.error(err)
			setError(err)
		} finally {
			setPasscode("")
			setLoading(false)
		}
	}, [send, passcode, history, id, setUser])

	if (!tfaSecret) {
		return <Loading />
	}

	// get 2fa secret
	return (
		<Box
			sx={{
				minHeight: "100%",
				width: "100%",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
				gap: "2rem",
				p: "10%",
			}}
		>
			<Button
				onClick={onCancel}
				sx={{
					"&>*": {
						textDecoration: "unset",
						color: colors.skyBlue,
						display: "flex",
						gap: "1rem",
					},
					mr: "auto",
				}}
			>
				<Link to={`/profile/${userID}/edit`}>
					<ArrowBackIcon fontSize="medium" />
					Cancel
				</Link>
			</Button>
			<Paper
				sx={{
					padding: "1.5rem",
					height: "100%",
					width: "calc(100% - 10%)",
					boxShadow: 2,
					display: "flex",
					flexDirection: "column",
					gap: "1rem",
					justifyContent: "center",
					alignItems: "center",
					position: "relative",
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: "100%",
					}}
				>
					<Typography variant="h1">Two Factor Authentication Setup</Typography>
				</Box>

				<Typography sx={{ maxWidth: "600px" }}>
					Scan the following QR code with the two-factor authentication app on your mobile. If you can't use the QR code, click on the
					button and copy the code instead.
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
						<Box
							sx={{
								height: "300px",
								width: "300px",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							{showSecretCode ? (
								<Typography variant="h6">{tfaSecret.secret}</Typography>
							) : (
								<Box sx={{ background: "white", padding: "16px" }}>
									<QRCode value={tfaSecret.qr_code_str} />
								</Box>
							)}
						</Box>
						<Box m={1} />
						<Button variant="contained" sx={{ background: colors.darkerGrey }} onClick={() => setShowSecretCode((e) => !e)}>
							{showSecretCode ? "Show QR Code" : "Show Secret Code"}
						</Button>
					</Box>
				)}
				<Stack sx={{ mt: "2rem" }}>
					<Typography component="h2" sx={{ fontSize: "1.2rem" }}>
						Enter Passcode from authenticator app:
					</Typography>
					<Box
						component="form"
						onSubmit={onSubmit}
						display="flex"
						width="90%"
						maxWidth="400px"
						marginTop="20px"
						justifyContent="space-between"
						gap="1rem"
					>
						<TextField variant="outlined" label="Passcode" fullWidth onChange={(e) => setPasscode(e.target.value)} />

						<LoadingButton loading={loading} variant="contained" sx={{ px: "2em" }}>
							Submit
						</LoadingButton>
					</Box>
				</Stack>
				{error && (
					<Alert
						severity={"error"}
						sx={{
							minWidth: "300px",
						}}
					>
						{error}
					</Alert>
				)}
			</Paper>
		</Box>
	)
}
