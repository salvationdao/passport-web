import * as React from "react"
import { AuthContainer, VerificationType } from "../containers/auth"
import { useForm } from "react-hook-form"
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"
import { InputField } from "../components/form/inputField"
import HubKey from "../keys"
import { useQuery } from "../hooks/useSend"

export const VerificationComplete = () => {
	const { user, hideVerifyComplete, verifyCompleteType } = AuthContainer.useContainer()

	const { query: update, payload, loading, error } = useQuery(HubKey.UserUpdate)
	const { control, handleSubmit, trigger } = useForm<{ password: string }>()

	const onSubmit = handleSubmit((input) => {
		if (!user || !trigger()) return
		update({ id: user.id, newPassword: input.password })
	})

	React.useEffect(() => {
		if (!error && !!payload) hideVerifyComplete()
	}, [payload, error, hideVerifyComplete])

	return (
		<form onSubmit={onSubmit}>
			<Dialog open={verifyCompleteType !== undefined}>
				<DialogTitle>Verification Complete</DialogTitle>
				<DialogContent>
					<Typography variant="h6">
						{verifyCompleteType === VerificationType.EmailVerification ? "Thanks for verifying your email address." : "Set your new password."}
					</Typography>
					{verifyCompleteType === VerificationType.ForgotPassword && (
						<div>
							<InputField
								name="password"
								label="New Password"
								type="password"
								control={control}
								rules={{ required: "Please enter a new password." }}
								placeholder="Enter new password"
								style={{ width: "300px" }}
								autoFocus
								disabled={loading}
							/>
						</div>
					)}
					{!error && !!payload && <Alert>Your password has been updated.</Alert>}
				</DialogContent>
				<DialogActions>
					{error && <Alert severity="error">{(payload as any)?.message || "An error occurred"}</Alert>}
					{verifyCompleteType === VerificationType.ForgotPassword && (
						<Button variant="contained" color="primary" onClick={onSubmit} disabled={loading}>
							Save
						</Button>
					)}
					{verifyCompleteType === VerificationType.EmailVerification &&
					<Button onClick={() => hideVerifyComplete()}>Close</Button>}
				</DialogActions>
			</Dialog>
		</form>
	)
}
