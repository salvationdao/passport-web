import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { Alert, Box, Button, Paper, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../../containers/auth"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import HubKey from "../../keys"
import { colors } from "../../theme"

interface RecoveryCode {
	user_id: string
	recovery_code: string
}

export const TwoFactorAuthenticationRecoveryCode = () => {
	const { send } = usePassportCommandsUser("/commander")
	const [recoveryCode, setRecoveryCode] = useState<string[] | undefined>()
	const { id } = useParams<{ id: string }>()
	const { userID } = useAuth()
	const [error, setError] = useState<string>()

	useEffect(() => {
		send<RecoveryCode[]>(HubKey.UserTFARecoveryCodeGet)
			.then((data) => setRecoveryCode(data.map((r) => r.recovery_code)))
			.catch((e) => {
				typeof e === "string" ? setError(e) : setError("Issue getting recovery code, try again or contact support.")
			})

		if (id !== userID) {
			window.location.replace(`/profile/${userID}/edit`)
		}
	}, [send, id, userID])
	if (recoveryCode) console.log(JSON.stringify(recoveryCode.join("")))
	const download = () => {
		if (!recoveryCode) return
		var a = document.createElement("a")
		document.body.appendChild(a)
		const blob = new Blob([recoveryCode.join("\n")], { type: "text/plain" })
		const url = window.URL.createObjectURL(blob)
		a.href = url
		a.download = "recovery_code.txt"
		a.click()
		window.URL.revokeObjectURL(url)
	}

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
					Go back to profile page
				</Link>
			</Button>
			<Paper
				sx={{
					padding: "1.5rem",
					height: "100%",
					width: "100%",
					boxShadow: 2,
					display: "flex",
					flexDirection: "column",
					gap: "2rem",
					justifyContent: "center",
					alignItems: "center",
					position: "relative",
				}}
			>
				<Typography variant="h2">Two Factor Authentication Recovery Codes</Typography>
				<Typography sx={{ fontSize: "120%" }}>
					These are one-time use codes to recover your account in case you lose access to your device.
				</Typography>

				{recoveryCode && (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							width: "100%",
							marginTop: "8px",
							flexWrap: "wrap",
							gap: "2rem",
						}}
					>
						{recoveryCode.map((rc, i) => (
							<Typography
								sx={{
									background: colors.white,
									p: "1em",
									fontWeight: "bold",
									color: colors.black,
								}}
							>
								{rc}
							</Typography>
						))}
					</Box>
				)}
				<Button variant="contained" onClick={download} sx={{ px: "4em" }}>
					Download as text file
				</Button>
				{error && <Alert severity="error">{error}</Alert>}
			</Paper>
		</Box>
	)
}
