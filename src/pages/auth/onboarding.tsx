import UploadIcon from "@mui/icons-material/Upload"
import { Avatar, Box, BoxProps, Button, styled, Typography, useTheme } from "@mui/material"
import { useCallback, useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { useMutation } from "react-fetching-library"
import { useForm } from "react-hook-form"
import { useHistory, useLocation } from "react-router-dom"
import { FancyButton } from "../../components/fancyButton"
import { InputField } from "../../components/form/inputField"
import { Loading } from "../../components/loading"
import { Transition, TransitionState } from "../../components/transition"
import { useAuth } from "../../containers/auth"
import { useSidebarState } from "../../containers/sidebar"
import { useSnackbar } from "../../containers/snackbar"
import { fetching } from "../../fetching"
import { formatBytes } from "../../helpers"
import HubKey from "../../keys"
import { User } from "../../types/types"
import { usePassportCommandsUser } from "../../hooks/usePassport"

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

enum Step {
	YourPassportIsReadyStep,
	LetsSetUpYourProfileStep,
	UsernameStep,
	UploadStep,
	SuccessStep,
}

export const PassportReady: React.FC = () => {
	const history = useHistory()
	const { search } = useLocation()
	const skipUsername = new URLSearchParams(search).get("skip_username") === "true"
	const { user, loading: authLoading } = useAuth()
	const { displayMessage } = useSnackbar()

	// Username form
	const { control, handleSubmit, reset } = useForm<{
		username: string
	}>()

	// Image uploads
	const uploadCircleRef = useRef<HTMLDivElement | null>(null)
	const [loading, setLoading] = useState(false)
	const { send } = usePassportCommandsUser("/commander")
	const { setSidebarOpen } = useSidebarState()
	const { mutate: upload } = useMutation(fetching.mutation.fileUpload)
	const [file, setFile] = useState<File>()
	const maxFileSize = 1e7

	// Steps
	const [step, setStep] = useState<Step>(Step.YourPassportIsReadyStep)

	const onSubmitAvatar = async () => {
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
				avatarID,
			})

			// On success
			if (resp) {
				setStep(Step.SuccessStep)
			}
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setLoading(false)
		}
	}

	const onRemoveImage = () => {
		setFile(undefined)
	}

	const onDrop = useCallback(
		(files: File[]) => {
			if (files.length <= 0) return
			const file = files[0]
			if (!!maxFileSize && file.size > maxFileSize) {
				displayMessage("File is larger than the max file size: " + formatBytes(maxFileSize), "error")
				return
			}

			setFile(file)
		},
		[displayMessage],
	)
	const { getRootProps, getInputProps, isDragActive, isFocused } = useDropzone({ onDrop, disabled: step !== Step.UploadStep || loading })

	useEffect(() => {
		let timeout2: NodeJS.Timeout
		const timeout = setTimeout(() => {
			setStep(Step.LetsSetUpYourProfileStep)
			timeout2 = setTimeout(() => {
				if (skipUsername) {
					setStep(Step.UploadStep)
				} else {
					setStep(Step.UsernameStep)
				}
			}, 2000)
		}, 2000)

		return () => {
			if (timeout2) clearTimeout(timeout2)
			clearTimeout(timeout)
		}
	}, [skipUsername])

	useEffect(() => {
		setSidebarOpen(false)
	}, [setSidebarOpen])

	useEffect(() => {
		if (!user) return
		reset({
			username: user.username,
		})
	}, [user, reset])

	useEffect(() => {
		if (step !== Step.SuccessStep || loading) return
		const timeout = setTimeout(() => {
			history.push("/profile")
		}, 300)

		return () => {
			clearTimeout(timeout)
		}
	}, [step, loading, history])

	useEffect(() => {
		if (user) return

		const userTimeout = setTimeout(() => {
			history.push("/login")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (authLoading) {
		return <Loading text="Loading. Please wait..." />
	}
	if (!user) {
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
	}

	return (
		<Box
			sx={{
				overflow: "hidden",
				position: "relative",
				minHeight: "100%",
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
						<MiddleText show={step === Step.LetsSetUpYourProfileStep}>{"Let's set up your profile"}</MiddleText>
						<FadeTransition
							show={step === Step.UsernameStep && !loading}
							component="form"
							onSubmit={handleSubmit(async (input) => {
								setLoading(true)
								try {
									const resp = await send<User>(HubKey.UserUsernameUpdate, {
										username: input.username,
									})

									// On success
									if (resp) {
										setStep(Step.UploadStep)
									}
								} catch (e) {
									displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
								} finally {
									setLoading(false)
								}
							})}
							sx={{
								position: "absolute",
								top: "50%",
								left: "50%",
								transform: "translate(-50%, -50%)",
								display: "flex",
								flexDirection: "column",
							}}
						>
							<Typography
								variant="h1"
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
								label="Current Username"
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
									marginBottom: "1rem",
								}}
								type="submit"
								color="primary"
							>
								Change Username
							</FancyButton>
							<Button
								onClick={() => setStep(Step.UploadStep)}
								variant="text"
								sx={{
									alignSelf: "center",
								}}
							>
								Skip this step
							</Button>
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
								<Button onClick={() => onSubmitAvatar()} variant="contained">
									Submit Profile Image
								</Button>
							</FadeTransition>
						</Box>
					</FadeTransition>
				</Box>
			</FadeTransition>
		</Box>
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
