import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { Alert, Box, Button, Paper, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useAuth } from "../../containers/auth"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { TwoFactorAuthenticationCheck } from "./check"

interface RecoveryCode {
	user_id: string
	recovery_code: string
	used_at: string
}

interface ITwoFactorAuthenticationRecoveryCodeProps {
	disableVerification?: boolean
}

export const TwoFactorAuthenticationRecoveryCode: React.FC<ITwoFactorAuthenticationRecoveryCodeProps> = ({ disableVerification }) => {
	const { send } = usePassportCommandsUser("/commander")
	const [recoveryCode, setRecoveryCode] = useState<RecoveryCode[] | undefined>()
	const { username } = useParams<{ username: string }>()
	const { user } = useAuth()
	const [error, setError] = useState<string>()
	const [verified, setVerified] = useState(false)

	useEffect(() => {
		send<RecoveryCode[]>(HubKey.UserTFARecoveryCodeGet)
			.then((data) => setRecoveryCode(data))
			.catch((e) => {
				typeof e === "string" ? setError(e) : setError("Issue getting recovery code, try again or contact support.")
			})

		if (username !== user?.username && !disableVerification) {
			window.location.replace(`/profile/${username}/edit`)
		}
	}, [send, username, user?.username, disableVerification])
	const download = useCallback(() => {
		if (!recoveryCode) return
		const a = document.createElement("a")
		document.body.appendChild(a)
		const recoverCodeStr: string[] = []
		recoveryCode.forEach((r) => {
			if (!r.used_at) {
				recoverCodeStr.push(r.recovery_code)
			}
		})
		const blob = new Blob([recoverCodeStr.join("\n")], { type: "text/plain" })
		const url = window.URL.createObjectURL(blob)
		a.href = url
		a.download = "recovery_code.txt"
		a.click()
		window.URL.revokeObjectURL(url)
	}, [recoveryCode])

	if (!verified && !disableVerification) {
		return <TwoFactorAuthenticationCheck setVerified={setVerified} />
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
				<Link to={`/profile/${username}/edit`}>
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
								key={`recove-code-${i}`}
								sx={{
									background: rc.used_at ? colors.darkerGrey : colors.white,
									p: "1em",
									fontWeight: "bold",
									color: rc.used_at ? colors.darkGrey : colors.black,
									textDecoration: rc.used_at ? "line-through" : "unset",
								}}
							>
								{rc.recovery_code}
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
