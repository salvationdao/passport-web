import { useState } from "react"
import { AuthContainer } from "../containers/auth"
import { Alert, Box, Button } from "@mui/material"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "./facebookLogin"
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { ReactComponent as FacebookIcon } from "../assets/images/icons/facebook.svg"
import { ReactComponent as GoogleIcon } from "../assets/images/icons/google.svg"

export const LoginOAuth = ({ admin }: { admin?: boolean }) => {
	const { loginGoogle, loginFacebook } = AuthContainer.useContainer()

	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	// OAuth
	const onGoogleLogin = async (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
		if (!!response.code) {
			setErrorMessage(`Couldn't connect to Google: ${response.code}`)
			return
		}
		setErrorMessage(null)
		const r = response as GoogleLoginResponse
		const err = await loginGoogle(r.tokenId)
		if (!!err) setErrorMessage(err)
	}
	const onGoogleLoginFailure = (error: Error) => {
		setErrorMessage(error.message)
	}
	const onFacebookLogin = async (response: any) => {
		if (!!response && !!response.status) {
			setErrorMessage(`Couldn't connect to Facebook: ${response.status}`)
			return
		}
		setErrorMessage(null)
		const r = response as ReactFacebookLoginInfo
		const err = await loginFacebook(r.accessToken)
		if (!!err) setErrorMessage(err)
	}
	const onFacebookLoginFailure = (error: ReactFacebookFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Facebook.")
	}

	return (
		<>
			<Box
				sx={{
					marginTop: "2vh",
					display: "flex",
				}}
			>
				<FacebookLogin
					appId="577913423867745"
					fields="email"
					callback={onFacebookLogin}
					onFailure={onFacebookLoginFailure}
					render={(props) => (
						<Button
							sx={{ mr: "40px" }}
							title="Login with Facebook"
							onClick={props.onClick}
							disabled={props.isDisabled || !props.isSdkLoaded || props.isProcessing}
							startIcon={<FacebookIcon />}
							variant="contained"
						>
							Log in with Facebook
						</Button>
					)}
				/>
				<GoogleLogin
					clientId="593683501366-gk7ab1nnskc1tft14bk8ebsja1bce24v.apps.googleusercontent.com"
					buttonText="Login"
					onSuccess={onGoogleLogin}
					onFailure={onGoogleLoginFailure}
					cookiePolicy={"single_host_origin"}
					render={(props) => (
						<Button onClick={props.onClick} disabled={props.disabled} title="Login with Google" startIcon={<GoogleIcon />} variant="contained">
							Log in with Google
						</Button>
					)}
				/>
			</Box>
			{errorMessage && (
				<Alert severity="error" sx={{ mt: "20px", maxWidth: "600px" }}>
					{errorMessage}
				</Alert>
			)}
		</>
	)
}
