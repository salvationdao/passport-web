import { Box } from "@mui/material"
import React from "react"
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { GoogleIcon } from "../../../assets"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { useAuth } from "../../../containers/auth"
import { OauthSignUpProps } from "../onboarding"

export const GoogleSignUp: React.FC<OauthSignUpProps> = ({ username, control, loading, onBack, onCheckUsername, setErrorMessage }) => {
	const { signUpGoogle } = useAuth()

	const onGoogleLogin = async (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
		try {
			setErrorMessage(undefined)

			if (!!response.code) {
				setErrorMessage(`Couldn't connect to Google: ${response.code}`)
				return
			}
			setErrorMessage(undefined)
			const r = response as GoogleLoginResponse
			await signUpGoogle(r.tokenId, username)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onGoogleLoginFailure = (error: Error) => {
		setErrorMessage(error.message)
	}

	return (
		<Box
			component="form"
			onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
			sx={{
				"& > *:not(:last-child)": {
					marginBottom: "1rem",
				},
			}}
		>
			<InputField
				name="username"
				label="Username"
				control={control}
				rules={{ required: "Username is required" }}
				disabled={loading}
				variant="filled"
				autoFocus
				fullWidth
			/>
			<Box
				sx={{
					display: "flex",
					"& > *:not(:last-child)": {
						marginRight: ".5rem",
					},
				}}
			>
				<FancyButton type="button" onClick={onBack}>
					Back
				</FancyButton>
				<GoogleLogin
					clientId="467953368642-8cobg822tej2i50ncfg4ge1pm4c5v033.apps.googleusercontent.com"
					onSuccess={onGoogleLogin}
					onFailure={onGoogleLoginFailure}
					cookiePolicy={"single_host_origin"}
					render={(props) => (
						<FancyButton
							type="submit"
							onClick={async () => {
								if (!(await onCheckUsername())) return
								props.onClick()
							}}
							loading={props.disabled}
							disabled={props.disabled}
							title="Sign up with Google"
							startIcon={<GoogleIcon />}
							sx={{
								flexGrow: 1,
							}}
						>
							Sign up with Google
						</FancyButton>
					)}
				/>
			</Box>
		</Box>
	)
}
