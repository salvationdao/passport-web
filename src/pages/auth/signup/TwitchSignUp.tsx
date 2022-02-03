import { Box } from "@mui/material"
import React from "react"
import { TwitchIcon } from "../../../assets"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { ReactTwitchFailureResponse, ReactTwitchLoginResponse, TwitchLogin } from "../../../components/twitchLogin"
import { useAuth } from "../../../containers/auth"
import { OauthSignUpProps } from "../onboarding"

export const TwitchSignUp: React.FC<OauthSignUpProps> = ({ username, control, loading, onBack, onCheckUsername, setErrorMessage }) => {
	const { signUpTwitch } = useAuth()

	const onTwitchLogin = async (response: ReactTwitchLoginResponse) => {
		try {
			setErrorMessage(undefined)
			await signUpTwitch(response.token, username)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onTwitchLoginFailure = (error: ReactTwitchFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Twitch.")
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
				<TwitchLogin
					callback={onTwitchLogin}
					onFailure={onTwitchLoginFailure}
					render={(props) => (
						<FancyButton
							type="submit"
							title="Sign up with Twitch"
							onClick={async (event) => {
								if (!(await onCheckUsername())) return
								props.onClick(event)
							}}
							loading={props.isProcessing}
							startIcon={<TwitchIcon />}
							sx={{
								flexGrow: 1,
							}}
						>
							Sign up with Twitch
						</FancyButton>
					)}
				/>
			</Box>
		</Box>
	)
}
