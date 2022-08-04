import { LoadingButton } from "@mui/lab"
import { Alert, Box, Slide, Stack, TextField, Typography } from "@mui/material"
import { useCallback, useState } from "react"
import { Redirect } from "react-router-dom"
import { SupremacyAuth } from "../../components/supremacy/auth"
import { AuthTypes, useAuth } from "../../containers/auth"
import { SignupRequestTypes } from "../../types/auth"

const searchParams = new URLSearchParams(window.location.search)
export const Signup: React.FC = () => {
	const { signupUser, signupRequest, emailCode } = useAuth()
	const [error, setError] = useState<string | null>(searchParams.get("err"))
	const tenant = searchParams.get("tenant")

	const errorCallback = useCallback((msg: string) => {
		setError(msg)
	}, [])

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			try {
				e.preventDefault()
				const data = new FormData(e.currentTarget)
				const username = data.get("username")?.toString()
				const password = data.get("password")?.toString()
				const confirmPassword = data.get("confirmPassword")?.toString()

				if (!signupRequest) {
					window.location.replace("/")
				} else {
					let userRequest: SignupRequestTypes | null = null
					switch (signupRequest.auth_type) {
						case AuthTypes.Email:
							if (password !== confirmPassword) {
								setError("Password does not match")
								return
							}
							userRequest = SignupRequestTypes.Email
							break
						case AuthTypes.Wallet:
							userRequest = SignupRequestTypes.Wallet
							break
						case AuthTypes.Google:
							userRequest = SignupRequestTypes.Google
							break
						case AuthTypes.Facebook:
							userRequest = SignupRequestTypes.Facebook
							break
						case AuthTypes.Twitter:
							userRequest = SignupRequestTypes.Twitter
							break
						default:
							userRequest = null
					}
					if (!userRequest) {
						setError("No request data found")
						return
					}
					if (!username) {
						setError("A username is required to proceed.")
					} else {
						await signupUser.action(
							{
								[userRequest]:
									userRequest === SignupRequestTypes.Email
										? {
												email: emailCode?.email,
												password,
												auth_type: AuthTypes.Email,
												tenant,
										  }
										: signupRequest,
								username,
								auth_type: signupRequest.auth_type,
							},
							errorCallback,
						)
					}
				}
			} catch (err: any) {
				console.error(err)
				setError(err)
			}
		},
		[signupRequest, signupUser, emailCode?.email, tenant, errorCallback],
	)

	if (!signupRequest) {
		return <Redirect to="/" />
	}

	return (
		<SupremacyAuth title={signupRequest?.auth_type !== AuthTypes.Email ? "Setup Display Name" : "Setup Account"}>
			<Slide in={true} direction="left">
				<Stack
					onSubmit={handleSubmit}
					component="form"
					display="flex"
					width="100%"
					maxWidth="30rem"
					marginTop="20px"
					justifyContent="space-between"
					gap="1.5rem"
				>
					<Typography>
						{signupRequest?.auth_type !== AuthTypes.Email ? "Please enter your user display name:" : "Please enter your account details:"}
					</Typography>
					<TextField variant="outlined" name="username" label="Username" fullWidth />
					{signupRequest?.auth_type === AuthTypes.Email && (
						<>
							<Box
								component="ul"
								sx={{
									"& li": {
										ml: "1rem",
										textAlign: "left",
									},
								}}
							>
								Password need to contain at least 8 characters and:
								<li>At least 1 number</li>
								<li>At least 1 lowercase letter</li>
								<li>At least 1 uppercase letter</li>
							</Box>
							<TextField variant="outlined" name="password" label="Password" type="password" fullWidth />
							<TextField variant="outlined" name="confirmPassword" label="Confirm Password" type="password" fullWidth />
						</>
					)}
					{error && (
						<Alert
							severity={"error"}
							sx={{
								minWidth: "300px",
							}}
						>
							{error.charAt(0).toUpperCase() + error.slice(1)}
						</Alert>
					)}
					<LoadingButton
						type="submit"
						loading={signupUser.loading}
						disabled={signupUser.loading}
						variant="contained"
						sx={{ p: ".5em 2em", fontSize: "1.2rem" }}
					>
						Submit
					</LoadingButton>
				</Stack>
			</Slide>
		</SupremacyAuth>
	)
}
