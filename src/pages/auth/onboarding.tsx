import UploadIcon from "@mui/icons-material/Upload"
import { Alert, Avatar, Box, BoxProps, Button, Link, Snackbar, styled, Typography, useTheme } from "@mui/material"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useMutation } from "react-fetching-library"
import { Control, useForm } from "react-hook-form"
import { Link as RouterLink, Route, Switch, useHistory, useRouteMatch } from "react-router-dom"
import { DiscordIcon, FacebookIcon, GoogleIcon, MetaMaskIcon, TwitchIcon, TwitterIcon, XSYNLogo } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { InputField } from "../../components/form/inputField"
import { GradientCircleThing, PhaseTypes } from "../../components/home/gradientCircleThing"
import { Loading } from "../../components/loading"
import { Transition, TransitionState } from "../../components/transition"
import { AuthContainer, useAuth } from "../../containers/auth"
import { useWebsocket } from "../../containers/socket"
import { fetching } from "../../fetching"
import { formatBytes } from "../../helpers"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { User } from "../../types/types"
import { DiscordSignUp } from "./signup/DiscordSignUp"
import { EmailSignUp } from "./signup/EmailSignUp"
import { FacebookSignUp } from "./signup/FacebookSignUp"
import { GoogleSignUp } from "./signup/GoogleSignUp"
import { MetaMaskSignUp } from "./signup/MetaMaskSignUp"
import { TwitchSignUp } from "./signup/TwitchSignUp"
import { TwitterSignUp } from "./signup/TwitterSignUp"

export interface SignUpInput {
	username: string
	firstName?: string
	lastName?: string
	email?: string
	password?: string
}

export type ConnectionType = "email" | "metamask" | "google" | "facebook" | "twitch" | "twitter" | "discord"

export const Onboarding: React.FC = () => {
	return (
		<>
			<Route path={`/onboarding/upload`} component={PassportReady} />
			<Route path={`/onboarding`} component={SignUp} />
		</>
	)
}

/**
 * Onboarding Page to Sign up New Users
 */
const SignUp = () => {
	const { path, url } = useRouteMatch()
	const history = useHistory()

	const { user } = useAuth()

	const [loading, setLoading] = useState<boolean>(false)
	const [errorMessage, setErrorMessage] = useState<string>()

	const { control, handleSubmit, watch, trigger, reset } = useForm<SignUpInput>()
	const username = watch("username")
	const password = watch("password")

	// For gradient circle animations
	const [animationPhase, setAnimationPhase] = useState<PhaseTypes>("default")

	const validUsername = useCallback(async (): Promise<boolean> => {
		// check username isn't empty
		return await trigger("username")
	}, [trigger])

	const onBack = () => {
		// Reset errors, but persist form values
		reset(undefined, {
			keepValues: true,
		})
		history.goBack()
		setAnimationPhase("default")
	}

	const onNext = (route: string) => {
		history.push(route)
		setAnimationPhase("small")
	}

	useEffect(() => {
		if (!user) return

		const userTimeout = setTimeout(() => {
			history.push("/onboarding/upload")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (user) {
		return <Loading text="Loading" />
	}

	return (
		<>
			<Snackbar
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
					phase={animationPhase}
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
					<Switch>
						<Route exact path={path}>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									"& > *:not(:last-child)": {
										marginBottom: "1rem",
									},
								}}
							>
								<FancyButton
									type="button"
									borderColor={colors.metamaskOrange}
									onClick={() => onNext("/onboarding/metamask")}
									startIcon={<MetaMaskIcon />}
								>
									Sign up with MetaMask
								</FancyButton>
								<FancyButton type="button" borderColor={colors.white} onClick={() => onNext("/onboarding/google")} startIcon={<GoogleIcon />}>
									Sign up with Google
								</FancyButton>
								<FancyButton
									type="button"
									borderColor={colors.facebookBlue}
									onClick={() => onNext("/onboarding/facebook")}
									startIcon={<FacebookIcon />}
								>
									Sign up with Facebook
								</FancyButton>
								<FancyButton
									type="button"
									borderColor={colors.twitchPurple}
									onClick={() => onNext("/onboarding/twitch")}
									startIcon={<TwitchIcon />}
								>
									Sign up with Twitch
								</FancyButton>
								<FancyButton
									type="button"
									borderColor={colors.twitterBlue}
									onClick={() => onNext("/onboarding/twitter")}
									startIcon={<TwitterIcon />}
								>
									Sign up with Twitter
								</FancyButton>
								<FancyButton
									type="button"
									borderColor={colors.discordGrey}
									onClick={() => onNext("/onboarding/discord")}
									startIcon={<DiscordIcon />}
								>
									Sign up with Discord
								</FancyButton>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
									}}
								>
									<Box
										component="span"
										sx={(theme) => ({
											minHeight: "2px",
											width: "100%",
											marginRight: "1rem",
											backgroundColor: theme.palette.primary.main,
										})}
									/>
									Or
									<Box
										component="span"
										sx={(theme) => ({
											minHeight: "2px",
											width: "100%",
											marginLeft: "1rem",
											backgroundColor: theme.palette.primary.main,
										})}
									/>
								</Box>
								<FancyButton borderColor={colors.white} filled onClick={() => onNext("/onboarding/email")}>
									Email Signup
								</FancyButton>
							</Box>
						</Route>
						<Route
							path={`/onboarding/metamask`}
							render={(props) => (
								<MetaMaskSignUp
									username={username}
									control={control}
									loading={loading}
									onBack={onBack}
									onCheckUsername={validUsername}
									setErrorMessage={setErrorMessage}
									{...props}
								/>
							)}
						/>
						<Route
							path={`/onboarding/google`}
							render={(props) => (
								<GoogleSignUp
									username={username}
									control={control}
									loading={loading}
									onBack={onBack}
									onCheckUsername={validUsername}
									setErrorMessage={setErrorMessage}
									{...props}
								/>
							)}
						/>
						<Route
							path={`/onboarding/facebook`}
							render={(props) => (
								<FacebookSignUp
									username={username}
									control={control}
									loading={loading}
									onBack={onBack}
									onCheckUsername={validUsername}
									setErrorMessage={setErrorMessage}
									{...props}
								/>
							)}
						/>
						<Route
							path={`/onboarding/twitch`}
							render={(props) => (
								<TwitchSignUp
									username={username}
									control={control}
									loading={loading}
									onBack={onBack}
									onCheckUsername={validUsername}
									setErrorMessage={setErrorMessage}
									{...props}
								/>
							)}
						/>
						<Route
							path={`/onboarding/twitter`}
							render={(props) => (
								<TwitterSignUp
									username={username}
									control={control}
									loading={loading}
									onBack={onBack}
									onCheckUsername={validUsername}
									setErrorMessage={setErrorMessage}
									{...props}
								/>
							)}
						/>
						<Route
							path={`/onboarding/discord`}
							render={(props) => (
								<DiscordSignUp
									username={username}
									control={control}
									loading={loading}
									onBack={onBack}
									onCheckUsername={validUsername}
									setErrorMessage={setErrorMessage}
									{...props}
								/>
							)}
						/>
						<Route
							path={`/onboarding/email`}
							render={(props) => (
								<EmailSignUp
									username={username}
									password={password}
									handleSubmit={handleSubmit}
									trigger={trigger}
									control={control}
									loading={loading}
									onBack={onBack}
									onCheckUsername={validUsername}
									setErrorMessage={setErrorMessage}
									setLoading={setLoading}
									{...props}
								/>
							)}
						/>
					</Switch>
					<Typography
						variant="subtitle1"
						sx={{
							marginTop: "1rem",
						}}
					>
						Already have an account?{" "}
						<Link component={RouterLink} to="/login">
							Login here
						</Link>
					</Typography>
				</Box>
			</Box>
		</>
	)
}

export interface OauthSignUpProps {
	username: string
	control: Control<SignUpInput, object>
	loading: boolean
	onBack: () => void
	onCheckUsername: () => Promise<boolean>
	setErrorMessage: React.Dispatch<React.SetStateAction<string | undefined>>
}

interface PasswordRequirementProps extends BoxProps {
	fulfilled: boolean
}

export const PasswordRequirement: React.FC<PasswordRequirementProps> = ({ fulfilled, sx, ...props }) => {
	const theme = useTheme()
	return (
		<Box
			component="li"
			sx={{
				...sx,
				color: fulfilled ? theme.palette.secondary.main : "inherit",
			}}
			{...props}
		/>
	)
}

interface PassportReadyProps {}

enum Step {
	YourPassportIsReadyStep,
	LetsSetUpYourProfileStep,
	UsernameStep,
	UploadStep,
	SuccessStep,
}

export const PassportReady: React.FC<PassportReadyProps> = () => {
	const uploadCircleRef = useRef<HTMLDivElement | null>(null)
	const { user } = AuthContainer.useContainer()
	const history = useHistory()

	// Username form
	const { control, handleSubmit, watch, trigger, reset } = useForm<{
		username: string
	}>()
	const username = watch("username")

	// Image uploads
	const [loading, setLoading] = useState(false)
	const { send } = useWebsocket()
	const { mutate: upload } = useMutation(fetching.mutation.fileUpload)
	const [errorMessage, setErrorMessage] = useState<string>()
	const [file, setFile] = useState<File>()
	const maxFileSize = 1e7

	// Steps
	const [step, setStep] = useState<Step>(Step.YourPassportIsReadyStep)

	const validUsername = useCallback(async (): Promise<boolean> => {
		// check username isn't empty
		return await trigger("username")
	}, [trigger])

	const onSubmit = async () => {
		if (!file || !user) return

		try {
			setLoading(true)
			// Upload avatar
			const r = await upload({ file, public: true })
			if (r.error || !r.payload) {
				throw new Error("Failed to upload image, please try again.")
			}

			// Update user
			const avatarID = r.payload.id
			const resp = await send<User>(HubKey.UserUpdate, {
				id: user.id,
				username,
				avatarID,
			})

			// On success
			if (resp) {
				setStep(Step.SuccessStep)
			}
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setLoading(false)
		}
	}

	const onRemoveImage = () => {
		setFile(undefined)
		setErrorMessage(undefined)
	}

	const onDrop = useCallback((files: File[]) => {
		if (files.length <= 0) return
		const file = files[0]
		if (!!maxFileSize && file.size > maxFileSize) {
			setErrorMessage("File is larger than the max file size: " + formatBytes(maxFileSize))
			return
		}

		setFile(file)
		setErrorMessage(undefined)
	}, [])
	const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({ onDrop, disabled: step !== Step.UploadStep || loading })

	useEffect(() => {
		let timeout2: NodeJS.Timeout
		const timeout = setTimeout(() => {
			setStep(Step.LetsSetUpYourProfileStep)
			timeout2 = setTimeout(() => {
				setStep(Step.UsernameStep)
			}, 2000)
		}, 2000)

		return () => {
			if (timeout2) clearTimeout(timeout2)
			clearTimeout(timeout)
		}
	}, [])

	useEffect(() => {
		if (step !== Step.SuccessStep || loading) return
		const timeout = setTimeout(() => {
			history.push("/profile")
		}, 300)

		return () => {
			clearTimeout(timeout)
		}
	}, [step, loading, history])

	return (
		<>
			<Snackbar
				open={!!errorMessage}
				autoHideDuration={6000}
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
				}}
			>
				<FadeTransition show={step < Step.SuccessStep || loading}>
					<Box
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							width: "100%",
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<FadeTransition show={step === Step.UploadStep && !loading} occupySpace>
							<Typography
								variant="h1"
								component="p"
								sx={{
									lineHeight: 1,
									fontSize: "3rem",
									textTransform: "uppercase",
									textAlign: "center",
								}}
							>
								Upload a profile image
							</Typography>
						</FadeTransition>
						<Box
							{...getRootProps()}
							ref={(r: HTMLDivElement) => {
								if (!r || step !== Step.SuccessStep) return
								uploadCircleRef.current = r
							}}
							sx={(theme) => ({
								position: "relative",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: step === Step.UploadStep && !loading ? (isDragActive ? "10rem" : "8rem") : "30rem",
								width: step === Step.UploadStep && !loading ? (isDragActive ? "10rem" : "8rem") : "30rem",
								borderRadius: "50%",
								border: `2px solid ${theme.palette.secondary.main}`,
								transition:
									"height .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), width .4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity .5s ease-out",
								cursor: step === Step.UploadStep && !loading ? "pointer" : "initial",
								"&:hover #UploadIcon": {
									opacity: step === Step.UploadStep && !loading ? 1 : 0,
								},
							})}
						>
							<input {...getInputProps()} />
							<Box
								id="UploadIcon"
								sx={{
									zIndex: 1,
									position: "absolute",
									top: 0,
									left: 0,
									right: 0,
									bottom: 0,
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									borderRadius: "50%",
									backgroundColor: "rgba(0, 0, 0, .6)",
									opacity: isDragActive || isFocused ? 1 : 0,
									transition: "opacity .2s ease-in",
									pointerEvents: "none",
								}}
							>
								<UploadIcon />
							</Box>
							{!!file && step === Step.UploadStep && !loading && (
								<Avatar
									src={URL.createObjectURL(file)}
									sx={{
										height: "95%",
										width: "95%",
									}}
								/>
							)}
							<MiddleText show={step === Step.YourPassportIsReadyStep}>Your passport is ready</MiddleText>
							<MiddleText show={step === Step.LetsSetUpYourProfileStep}>Let's set up your profile</MiddleText>
							<FadeTransition
								show={step === Step.UsernameStep}
								component="form"
								onSubmit={async (e: any) => {
									e.preventDefault()
									if (!(await validUsername())) return
									setStep(Step.UploadStep)
								}}
								sx={{
									position: "absolute",
									top: "50%",
									left: "50%",
									transform: "translate(-50%, -50%)",
								}}
							>
								<Typography
									variant="h1"
									component="p"
									sx={{
										lineHeight: 1,
										fontSize: "3rem",
										textTransform: "uppercase",
										textAlign: "center",
									}}
								>
									Enter your username
								</Typography>
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
								<FancyButton
									sx={{
										marginTop: "1rem",
									}}
									type="submit"
									color="primary"
								>
									Next
								</FancyButton>
							</FadeTransition>
							<MiddleText show={loading}>Loading...</MiddleText>
						</Box>
						<FadeTransition show={step === Step.UploadStep && !loading} occupySpace>
							<Typography
								variant="body1"
								sx={{
									lineHeight: 1,
									fontSize: "1rem",
									textTransform: "uppercase",
									textAlign: "center",
								}}
							>
								Drag an image here for your profile picture
							</Typography>
						</FadeTransition>
						<FadeTransition show={step === Step.UploadStep && !loading}>
							<Box
								sx={{
									display: "flex",
									"& > *:not(:last-child)": {
										marginRight: "1rem",
									},
								}}
							>
								<FadeTransition show={!file} occupySpace>
									<Button onClick={() => setStep(Step.SuccessStep)} variant="text">
										Or, skip this step
									</Button>
								</FadeTransition>
								<FadeTransition show={!!file} occupySpace>
									<Button onClick={() => onRemoveImage()} variant="text">
										Clear Image
									</Button>
								</FadeTransition>
								<FadeTransition show={!!file}>
									<Button onClick={() => onSubmit()} variant="contained">
										Submit Profile Image
									</Button>
								</FadeTransition>
							</Box>
						</FadeTransition>
					</Box>
				</FadeTransition>
			</Box>
		</>
	)
}

interface FadeTransitionProps extends BoxProps {
	show: boolean
	occupySpace?: boolean
}

const FadeTransition: React.FC<FadeTransitionProps> = ({ show, occupySpace, sx, ...props }) => {
	const duration = 200

	const transitionStyles: { [key in TransitionState]: any } = {
		entering: {
			opacity: 1,
		},
		exiting: {
			opacity: 0,
			visibilty: occupySpace ? "hidden" : "initial",
		},
	}

	return (
		<Transition show={show} timeout={duration}>
			{(state) => {
				return (
					<Box
						sx={{
							...sx,
							...transitionStyles[state],
							transition: `opacity ${duration}ms ease-in`,
						}}
						{...props}
					/>
				)
			}}
		</Transition>
	)
}

const MiddleText = styled(FadeTransition)({
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	textAlign: "center",
	whiteSpace: "nowrap",
	fontSize: "3rem",
	textTransform: "uppercase",
	"@media (max-width: 650px)": {
		whiteSpace: "initial",
	},
})
