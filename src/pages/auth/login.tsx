import { Box, Link, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { MetaMaskIcon, WalletConnectIcon, XSYNLogo } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { InputField } from "../../components/form/inputField"
import { Loading } from "../../components/loading"
import { MetaMaskLogin } from "../../components/loginMetaMask"
import { AuthContainer, useAuth } from "../../containers/auth"
import { useSidebarState } from "../../containers/sidebar"
import { useSnackbar } from "../../containers/snackbar"
import { fonts } from "../../theme"

interface LogInInput {
	email: string
	password: string
}

export const LoginPage: React.FC = () => {
	const history = useHistory()
	const { user, recheckAuth } = useAuth()
	const { setSidebarOpen } = useSidebarState()
	const { displayMessage } = useSnackbar()

	const { loginPassword } = AuthContainer.useContainer()

	const { control, handleSubmit, reset } = useForm<LogInInput>()
	const [loading, setLoading] = useState(false)
	const [showEmailLogin, setShowEmailLogin] = useState(false)

	const onMetaMaskLoginFailure = (error: string) => {
		displayMessage(error, "error")
	}

	// Email login
	const onEmailLogin = handleSubmit(async (input) => {
		try {
			setLoading(true)
			await loginPassword(input.email, input.password)
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setLoading(false)
		}
	})

	useEffect(() => {
		setSidebarOpen(false)
	}, [setSidebarOpen])

	useEffect(() => {
		if (!user) return

		const userTimeout = setTimeout(() => {
			history.push("/profile")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<Loading text="Loading. Please wait..." />
			</Box>
		)
	}
	if (user) {
		if (recheckAuth) {
			return (
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						minHeight: "100vh",
					}}
				>
					<Loading text="You are already logged in, redirecting to your profile..." />
				</Box>
			)
		}
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
			>
				<Loading text="You have successfully logged in, redirecting to your profile..." />
			</Box>
		)
	}

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
				minHeight: "100vh",
				padding: "3rem",
			}}
		>
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
					fontSize: "2rem",
					textTransform: "uppercase",
					textAlign: "center",
				}}
			>
				Connect Passport
			</Typography>
			<Box
				sx={{
					width: "100%",
					maxWidth: "400px",
				}}
			>
				{showEmailLogin ? (
					<>
						<Box
							component="form"
							onSubmit={onEmailLogin}
							sx={{
								"& > *:not(:last-child)": {
									marginBottom: "1rem",
								},
							}}
						>
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
								autoFocus
								variant="standard"
								disabled={loading}
							/>
							<InputField
								name="password"
								label="Password"
								type="password"
								control={control}
								placeholder="Password"
								fullWidth
								variant="standard"
								disabled={loading}
								rules={{
									required: "Password is required",
								}}
							/>
							<Box
								sx={{
									display: "flex",
									"& > *:not(:last-child)": {
										marginRight: ".5rem",
									},
								}}
							>
								<FancyButton
									type="button"
									onClick={() => {
										reset(undefined, {
											keepValues: true,
										})
										setShowEmailLogin(false)
									}}
								>
									Back
								</FancyButton>
								<FancyButton
									type="submit"
									color="primary"
									loading={loading}
									sx={{
										flexGrow: 1,
									}}
								>
									Log In
								</FancyButton>
							</Box>
						</Box>
						<Typography variant="subtitle1" marginTop="1rem">
							Don't have an account?{" "}
							<Link component={RouterLink} to="/signup">
								Sign up here
							</Link>
						</Typography>
					</>
				) : (
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<MetaMaskLogin
							onFailure={onMetaMaskLoginFailure}
							render={(props) => (
								<>
									<FancyButton
										onClick={props.onClick}
										loading={props.isProcessing}
										title="Connect Wallet to account"
										sx={{
											marginBottom: "1rem",
											padding: "1rem",
											borderRadius: ".5rem",
										}}
										startIcon={
											typeof (window as any).ethereum === "undefined" || typeof (window as any).web3 === "undefined" ? (
												<WalletConnectIcon />
											) : (
												<MetaMaskIcon />
											)
										}
									>
										Connect Wallet to account
									</FancyButton>
									<Typography sx={{ textAlign: "center" }}>{props.errorMessage}</Typography>
								</>
							)}
						/>
					</Box>
				)}
			</Box>
		</Box>
	)
}
