import { Box } from "@mui/material"
import React from "react"
import { FacebookIcon } from "../../../assets"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "../../../components/facebookLogin"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { useAuth } from "../../../containers/auth"
import { OauthSignUpProps } from "../onboarding"

export const FacebookSignUp: React.FC<OauthSignUpProps> = ({ username, control, loading, onBack, onCheckUsername, setErrorMessage }) => {
	const { signUpFacebook } = useAuth()

	const onFacebookLogin = async (response: any) => {
		try {
			setErrorMessage(undefined)

			if (!!response && !!response.status) {
				setErrorMessage(`Couldn't connect to Facebook: ${response.status}`)
				return
			}
			const r = response as ReactFacebookLoginInfo
			await signUpFacebook(r.accessToken, username)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onFacebookLoginFailure = (error: ReactFacebookFailureResponse) => {
		setErrorMessage(error.status || "Failed to signup with Facebook.")
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
				<FacebookLogin
					callback={onFacebookLogin}
					onFailure={onFacebookLoginFailure}
					render={(props) => (
						<FancyButton
							type="submit"
							title="Sign Up with Facebook"
							onClick={async (event) => {
								if (!(await onCheckUsername())) return
								props.onClick(event)
							}}
							loading={!props.isSdkLoaded || props.isProcessing}
							startIcon={<FacebookIcon />}
							sx={{
								flexGrow: 1,
							}}
						>
							Sign Up with Facebook
						</FancyButton>
					)}
				/>
			</Box>
		</Box>
	)
}
