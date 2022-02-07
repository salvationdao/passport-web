import { Alert, Box, Snackbar, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { XSYNLogo } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { InputField } from "../../components/form/inputField"
import { GradientCircleThing } from "../../components/home/gradientCircleThing"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"
import { useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { fonts } from "../../theme"
import { RegisterResponse } from "../../types/auth"
import { PasswordRequirement } from "./onboarding"

interface SignUpInput {
	username: string
	firstName?: string
	lastName?: string
	email?: string
	password?: string
}

export const SignUpPage: React.FC = () => {
	const history = useHistory()
	const { send } = useWebsocket()
	const { setUser, user } = useAuth()

	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | undefined>()

	// Form
	const { control, handleSubmit, watch, trigger } = useForm<SignUpInput>()
	const password = watch("password")

	const [currentStep, setCurrentStep] = useState(0)

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

					history.push("/onboarding?skip_username=true")
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
				<FancyButton type="button" onClick={() => history.goBack()}>
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

	useEffect(() => {
		if (!user) return

		const userTimeout = setTimeout(() => {
			history.push("/")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (user) {
		return <Loading text="You are already logged in, redirecting to home page..." />
	}

	return (
		<>
			<Snackbar
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				open={!!errorMessage}
				autoHideDuration={3000}
				onClose={(_, reason) => {
					if (reason === "clickaway") {
						return
					}

					setErrorMessage(undefined)
				}}
				message={errorMessage}
			>
				<Alert severity="error">{errorMessage}</Alert>
			</Snackbar>
			<Box
				sx={{
					overflow: "hidden",
					position: "relative",
					minHeight: "100vh",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					flexDirection: "column",
					padding: "3rem",
				}}
			>
				<GradientCircleThing
					sx={{
						zIndex: -1,
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
					phase={"small"}
					disableAnimations
					hideInner
				/>
				<RouterLink to="/">
					<Box
						component={XSYNLogo}
						sx={{
							width: "100px",
							marginBottom: "1rem",
						}}
					/>
				</RouterLink>
				<Typography
					variant="h1"
					sx={{
						marginBottom: "1rem",
						fontFamily: fonts.bizmobold,
						fontSize: "3rem",
						textTransform: "uppercase",
					}}
				>
					Sign Up
				</Typography>
				<Box
					sx={{
						width: "100%",
						maxWidth: "400px",
					}}
				>
					{currentStep === 0 && renderStep0()}
					{currentStep === 1 && renderStep1()}
				</Box>
			</Box>
		</>
	)
}
