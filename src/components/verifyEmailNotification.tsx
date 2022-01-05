import { Button, Alert } from "@mui/material"
import { AuthContainer } from "../containers"
import { useQuery } from "../hooks/useSend"
import HubKey from "../keys"

export const VerifyEmailNotification = () => {
	const { user } = AuthContainer.useContainer()
	const { query: resendVerifyEmail, payload, error, loading } = useQuery<{ success: boolean }>(HubKey.AuthSendVerifyEmail)

	return (
		<Button
			onClick={() => {
				if (!user || loading) return
				resendVerifyEmail({
					email: user.email,
					newAccount: true,
				})
			}}
			variant="contained"
			sx={{
				backgroundColor: "#4CAF50",
				color: "white",
				width: "50%",
				clipPath: "polygon(0 0, 100% 0, 90% 100%, 10% 100%)",

				lineHeight: "14px",
				position: "absolute",
				top: "0",
				left: "25%",
				paddingTop: "5px",
				paddingBottom: "5px",
				paddingLeft: "40px",
				paddingRight: "40px",

				fontSize: "0.9rem",
				"@media only screen and (max-width: 560px)": {
					fontSize: "0.75rem",
				},

				":hover": { backgroundColor: "#5fc363" },
				":focus": { backgroundColor: "#6fd473" },
			}}
		>
			{!loading && !payload && "Your email address is not verified. Click here to re-send verification email."}
			{loading && "Sending..."}
			{!!payload && payload.success && "Verification email sent"}
			{!!error && <Alert severity="error">{error}</Alert>}
		</Button>
	)
}
