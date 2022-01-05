import { useForm } from "react-hook-form"
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material"
import { InputField } from "./form/inputField"
import { Alert } from '@mui/material';
import HubKey from "../keys"
import { useQuery } from "../hooks/useSend"

export const ForgotPasswordModal = (props: { isOpen: boolean; onClose: () => void }) => {
	const { isOpen, onClose } = props
	const { query: forgotPass, payload, error, loading } = useQuery<{ success: boolean }>(HubKey.AuthSendVerifyEmail)
	const { control, handleSubmit } = useForm<{ email: string }>()
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
						<InputField
							name="email"
							label="Email"
							type="email"
							control={control}
							rules={{
								required: "Email is required.",
								pattern: {
									value: /.+@.+\..+/,
									message: "Invalid email address",
								},
							}}
							placeholder="Your email"
							style={{ width: "300px" }}
							autoFocus
							disabled={loading}
						/>
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
    );
}
