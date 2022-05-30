import { Alert, Box, Button, Paper, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import HubKey from "../../keys"
import { Logo } from "../logo"
import { usePassportCommandsUser } from "../../hooks/usePassport"

export const TwoFactorAuthenticationRecoveryCode = () => {
	const { send } = usePassportCommandsUser("/commander")
	const [recoveryCode, setRecoveryCode] = useState<string[]>([])
	const [clickDownload, setClickDownload] = useState(false)
	const [error, setError] = useState<string>()

	useEffect(() => {
		send<string[]>(HubKey.AuthTFARecoveryCodeGet)
			.then((data) => setRecoveryCode(data))
			.catch((e) => {
				typeof e === "string" ? setError(e) : setError("Issue getting recovery code, try again or contact support.")
			})
	}, [send])

	const download = () => {
		if (recoveryCode.length === 0) return
		setClickDownload(true)
		var a = document.createElement("a")
		document.body.appendChild(a)
		const blob = new Blob([recoveryCode.join("\n")], { type: "txt" })
		const url = window.URL.createObjectURL(blob)
		a.href = url
		a.download = "recovery_code.txt"
		a.click()
		window.URL.revokeObjectURL(url)
	}

	const next = () => send(HubKey.AuthTFARecoveryCodeSet)

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
					Two Factor Authentication Recovery Code
				</Typography>
				{error && <Alert severity="error">{error}</Alert>}

				{recoveryCode.length > 0 && (
					<Box
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							width: "100%",
							marginTop: "8px",
							flexWrap: "wrap",
						}}
					>
						{recoveryCode.map((rc, i) => (
							<Box
								key={i}
								sx={{
									width: "50%",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									padding: "2px 0",
								}}
							>
								<Typography variant="subtitle1">{rc}</Typography>
							</Box>
						))}
					</Box>
				)}
				<Box display="flex" width="100%" marginTop="20px" justifyContent="space-between">
					<Button variant="contained" onClick={download}>
						Download
					</Button>
					<Button variant="contained" disabled={!clickDownload} onClick={next}>
						Next
					</Button>
				</Box>
			</Paper>
		</Box>
	)
}
