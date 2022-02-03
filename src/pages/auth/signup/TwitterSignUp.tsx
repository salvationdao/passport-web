import { Box } from "@mui/material"
import React from "react"
import { TwitterIcon } from "../../../assets"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { ReactTwitterFailureResponse, ReactTwitterLoginResponse, TwitterLogin } from "../../../components/twitterLogin"
import { useAuth } from "../../../containers/auth"
import { OauthSignUpProps } from "../onboarding"

export const TwitterSignUp: React.FC<OauthSignUpProps> = ({ username, control, loading, onBack, onCheckUsername, setErrorMessage }) => {
	const { signUpTwitter } = useAuth()

	const onTwitterLogin = async (response: ReactTwitterLoginResponse) => {
		try {
			setErrorMessage(undefined)
			await signUpTwitter(response.token, response.verifier, username)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onTwitterLoginFailure = (error: ReactTwitterFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Twitter.")
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
				<TwitterLogin
					callback={onTwitterLogin}
					onFailure={onTwitterLoginFailure}
					render={(props) => (
						<FancyButton
							type="submit"
							title="Sign up with Twitter"
							onClick={async (event) => {
								if (!(await onCheckUsername())) return
								props.onClick(event)
							}}
							loading={props.isProcessing}
							startIcon={<TwitterIcon />}
							sx={{
								flexGrow: 1,
							}}
						>
							Sign up with Twitter
						</FancyButton>
					)}
				/>
			</Box>
		</Box>
	)
}
