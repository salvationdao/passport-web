import HCaptcha from "@hcaptcha/react-hcaptcha"
import { LoadingButton } from "@mui/lab"
import { Alert, Box, Checkbox, FormControlLabel, Slide, Stack, TextField, Typography } from "@mui/material"
import { useCallback, useState } from "react"
import { Redirect } from "react-router-dom"
import { SupremacyAuth } from "../../components/supremacy/auth"
import { CAPTCHA_KEY } from "../../config"
import { AuthTypes, useAuth } from "../../containers/auth"
import { SignupRequestTypes } from "../../types/auth"

const searchParams = new URLSearchParams(window.location.search)

export const Signup: React.FC = () => {
	const { signupUser, signupRequest, emailCode, captchaToken, setCaptchaToken } = useAuth()
	const [error, setError] = useState<string | null>(searchParams.get("err"))
	const [signupLoading, setSignupLoading] = useState(false)
	const tenant = searchParams.get("tenant")
	const redirectURL = searchParams.get("redirectURL")
	const captchaSearchParams = new URLSearchParams(window.location.search)
	const captchaRequired = captchaSearchParams.get("captcha") === "true"

	const errorCallback = useCallback((msg: string) => {
		setError(msg)
	}, [])

	const handleSubmit = useCallback(
		async (e: React.FormEvent<HTMLFormElement>) => {
			try {
				setSignupLoading(true)
				e.preventDefault()
				const data = new FormData(e.currentTarget)
				const username = data.get("username")?.toString()
				const password = data.get("password")?.toString()
				const confirmPassword = data.get("confirmPassword")?.toString()
				const acceptsMarketing = data.get("acceptsMarketing")?.valueOf() === "on"
				console.log(data.get("acceptsMarketing")?.valueOf())

				if (signupRequest) {
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
												redirect_url: redirectURL,
												accepts_marketing: acceptsMarketing.toString(),
										  }
										: signupRequest,
								username,
								auth_type: signupRequest.auth_type,
								captcha_token: captchaToken,
							},
							errorCallback,
						)
					}
				}
			} catch (err: any) {
				console.error(err)
				setError(typeof err === "string" ? err : "Something went wrong, please try again.")
			} finally {
				setSignupLoading(false)
			}
		},
		[signupRequest, signupUser, captchaToken, emailCode?.email, tenant, errorCallback, redirectURL],
	)

	if (!signupRequest) {
		return <Redirect to="/" />
	}

	let title = "Setup Account"
	if (signupRequest?.auth_type !== AuthTypes.Email) title = "Setup Display Name"

	return (
		<SupremacyAuth title={title}>
			<Slide in={true} direction="left">
				<Stack
					onSubmit={handleSubmit}
					component="form"
					display="flex"
					width="100%"
					maxWidth="25rem"
					marginTop="20px"
					justifyContent="space-between"
					gap="1.5rem"
					onChange={() => {
						setError(null)
					}}
				>
					<Typography variant="h2" sx={{ fontSize: "1rem" }}>
						{signupRequest?.auth_type !== AuthTypes.Email ? "Please enter your user display name:" : "Please enter your account details:"}
					</Typography>
					<TextField type="text" variant="outlined" name="username" label="Enter Username" fullWidth />
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
							<FormControlLabel
								control={<Checkbox />}
								label="I would like to receive updates, special offers and newsletters from Supremacy."
								name="acceptsMarketing"
							/>
						</>
					)}
					{captchaRequired && (
						<Box>
							{!captchaToken && (
								<Typography variant="h2" sx={{ fontSize: "1rem" }}>
									Please verify you are human
								</Typography>
							)}
							<br />
							<HCaptcha
								size="normal"
								theme="dark"
								sitekey={CAPTCHA_KEY}
								onVerify={setCaptchaToken}
								onExpire={() => setCaptchaToken(undefined)}
							/>
						</Box>
					)}
					{(!captchaRequired || (captchaRequired && !!captchaToken)) && (
						<LoadingButton
							type="submit"
							loading={signupLoading}
							disabled={signupLoading}
							variant="contained"
							sx={{ p: ".5em 2em", fontSize: "1.2rem" }}
						>
							Submit
						</LoadingButton>
					)}

					{error && (
						<Alert
							severity={"error"}
							sx={{
								minWidth: "300px",
								textAlign: "left",
							}}
						>
							{error.charAt(0).toUpperCase() + error.slice(1)}
						</Alert>
					)}
				</Stack>
			</Slide>
		</SupremacyAuth>
	)
}
