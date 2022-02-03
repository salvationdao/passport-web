import { Box } from "@mui/material"
import React, { useState } from "react"
import { UseFormHandleSubmit, UseFormTrigger } from "react-hook-form"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { useAuth } from "../../../containers/auth"
import { useWebsocket } from "../../../containers/socket"
import HubKey from "../../../keys"
import { RegisterResponse } from "../../../types/auth"
import { OauthSignUpProps, PasswordRequirement, SignUpInput } from "../onboarding"

export interface EmailSignUpProps extends OauthSignUpProps {
	password?: string
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	handleSubmit: UseFormHandleSubmit<SignUpInput>
	trigger: UseFormTrigger<SignUpInput>
}

export const EmailSignUp: React.FC<EmailSignUpProps> = ({ password, setLoading, handleSubmit, trigger, control, loading, onBack, setErrorMessage }) => {
	const [currentStep, setCurrentStep] = useState(0)
	const { send } = useWebsocket()
	const { setUser } = useAuth()

	const renderStep1 = () => (
		<Box
			component="form"
			onSubmit={handleSubmit(async (input) => {
				try {
					setLoading(true)
					setErrorMessage(undefined)

					const resp = await send<RegisterResponse>(HubKey.AuthRegister, input)
					setUser(resp.user)
					localStorage.setItem("token", resp.token)
				} catch (e) {
					setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
				} finally {
					setLoading(false)
				}
			})}
			sx={{
				"& > *:not(:last-child)": {
					marginBottom: "1rem",
				},
			}}
		>
			<InputField
				autoFocus
				name="password"
				label="Password"
				type="password"
				control={control}
				placeholder="Password"
				fullWidth
				variant="filled"
				disabled={loading}
				rules={{
					required: "Password is required",
				}}
			/>
			<Box>
				Your password must:
				<ul>
					<PasswordRequirement fulfilled={!!password && password.length >= 8}>be 8 or more characters long</PasswordRequirement>
					<PasswordRequirement fulfilled={!!password && password.toUpperCase() !== password && password.toLowerCase() !== password}>
						contain <strong>upper</strong> &#38; <strong>lower</strong> case letters
					</PasswordRequirement>
					<PasswordRequirement fulfilled={!!password && /\d/.test(password)}>
						contain at least <strong>1 number</strong>
					</PasswordRequirement>
					<PasswordRequirement fulfilled={!!password && /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)}>
						contain at least <strong>1 symbol</strong>
					</PasswordRequirement>
				</ul>
			</Box>
			<Box
				sx={{
					display: "flex",
					"& > *:not(:last-child)": {
						marginRight: ".5rem",
					},
				}}
			>
				<FancyButton type="button" onClick={() => setCurrentStep(0)}>
					Back
				</FancyButton>
				<FancyButton
					type="submit"
					disabled={loading}
					sx={{
						flexGrow: 1,
					}}
				>
					Create Account
				</FancyButton>
			</Box>
		</Box>
	)

	const renderStep0 = () => (
		<Box
			component="form"
			onSubmit={async (e: any) => {
				e.preventDefault()
				const isStepValid = await trigger()
				if (!isStepValid) return
				setCurrentStep(1)
			}}
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
			<InputField name="firstName" label="First Name" control={control} fullWidth variant="filled" disabled={loading} />
			<InputField name="lastName" label="Last Name" control={control} fullWidth variant="filled" disabled={loading} />
			<InputField
				name="email"
				label="Email"
				type="email"
				control={control}
				rules={{
					required: "Email is required",
					pattern: {
						value: /.+@.+\..+/,
						message: "Invalid email address",
					},
				}}
				fullWidth
				variant="filled"
				disabled={loading}
			/>
			<Box
				sx={{
					display: "flex",
					"& > *:not(:last-child)": {
						marginRight: ".5rem",
					},
				}}
			>
				<FancyButton type="button" onClick={() => onBack()}>
					Back
				</FancyButton>
				<FancyButton
					type="submit"
					disabled={loading}
					sx={{
						flexGrow: 1,
					}}
				>
					Next
				</FancyButton>
			</Box>
		</Box>
	)

	return (
		<>
			{currentStep === 0 && renderStep0()}
			{currentStep === 1 && renderStep1()}
		</>
	)
}
