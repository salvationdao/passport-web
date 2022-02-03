import { Box } from "@mui/material"
import React from "react"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { LoginMetaMask } from "../../../components/loginMetaMask"
import { OauthSignUpProps } from "../onboarding"

export const MetaMaskSignUp: React.FC<OauthSignUpProps> = ({ username, control, loading, onBack, onCheckUsername, setErrorMessage }) => {
	const onMetaMaskLoginFailure = (error: string) => {
		setErrorMessage(error)
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
				<LoginMetaMask
					type="submit"
					signUp={{
						username,
					}}
					onClick={async () => {
						if (!(await onCheckUsername())) {
							return false
						}
						return true
					}}
					onFailure={onMetaMaskLoginFailure}
					sx={{
						flexGrow: 1,
					}}
				/>
			</Box>
		</Box>
	)
}
