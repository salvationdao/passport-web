import { Box } from "@mui/material"
import React from "react"
import { DiscordIcon } from "../../../assets"
import { DiscordLogin, ReactDiscordFailureResponse, ReactDiscordLoginResponse } from "../../../components/discordLogin"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { useAuth } from "../../../containers/auth"
import { OauthSignUpProps } from "../onboarding"

export const DiscordSignUp: React.FC<OauthSignUpProps> = ({ username, control, loading, onBack, onCheckUsername, setErrorMessage }) => {
	const { signUpDiscord } = useAuth()

	const onDiscordLogin = async (response: ReactDiscordLoginResponse) => {
		try {
			setErrorMessage(undefined)
			await signUpDiscord(response.code, username)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		}
	}
	const onDiscordLoginFailure = (error: ReactDiscordFailureResponse) => {
		setErrorMessage(error.status || "Failed to login with Discord.")
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
				<DiscordLogin
					callback={onDiscordLogin}
					onFailure={onDiscordLoginFailure}
					render={(props) => (
						<FancyButton
							type="submit"
							title="Sign up with Discord"
							onClick={async (event) => {
								if (!(await onCheckUsername())) return
								props.onClick(event)
							}}
							loading={props.isProcessing}
							startIcon={<DiscordIcon />}
							sx={{
								flexGrow: 1,
							}}
						>
							Sign up with Discord
						</FancyButton>
					)}
				/>
			</Box>
		</Box>
	)
}
