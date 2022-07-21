import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"
import { useForm } from "react-hook-form"
import { useQuery } from "../hooks/useSend"
import HubKey from "../keys"

export const ForgotPasswordModal = (props: { isOpen: boolean; onClose: () => void }) => {
	const { isOpen, onClose } = props
	const { query: forgotPass, payload, error, loading } = useQuery<{ success: boolean }>(HubKey.AuthSendVerifyEmail)
	const { handleSubmit } = useForm<{ email: string }>()
	const success = !!payload && !error

	const onSubmit = handleSubmit(({ email }) => {
		forgotPass({ email, forgotPassword: true })
	})

	return (
		<Dialog onClose={() => onClose()} open={isOpen}>
			<DialogTitle>Forgot Password</DialogTitle>
			<DialogContent>
				{success === true && <Alert>Email Sent!</Alert>}

				{!success && (
					<form onSubmit={onSubmit}>
						<TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" autoFocus />
					</form>
				)}

				{!!error && <Alert severity="error">{error}</Alert>}
			</DialogContent>
			<DialogActions>
				{success ? (
					<Button variant="contained" color="primary" onClick={onClose}>
						OK
					</Button>
				) : (
					<Button variant="contained" color="primary" disabled={loading} onClick={onSubmit}>
						Send Password Reset Email
					</Button>
				)}
			</DialogActions>
		</Dialog>
	)
}
