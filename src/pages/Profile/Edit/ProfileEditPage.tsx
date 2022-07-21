import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, styled, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useHistory, useParams } from "react-router-dom"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { Loading } from "../../../components/loading"
import { ENVIRONMENT } from "../../../config"
import { useAuth } from "../../../containers/auth"
import { usePassportCommandsUser } from "../../../hooks/usePassport"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { User } from "../../../types/types"
import { LockButton, lockOptions, LockOptionsProps } from "../Locking/LockButton"
import { LockModal } from "../Locking/LockModal"
import { ChangePasswordModal } from "./ChangePasswordModal"
import { Facebook } from "./ManageConnections/Facebook"
import { Google } from "./ManageConnections/Google"
import { Twitter } from "./ManageConnections/Twitter"
import { Wallet } from "./ManageConnections/Wallet"
import { RemoveTFAModal } from "./RemoveTFAModal"

export const ProfileEditPage: React.FC = () => {
	const { username } = useParams<{ username: string }>()
	const history = useHistory()
	const { loading: authLoading } = useAuth()
	const { user } = useAuth()
	const [newUsername, setNewUsername] = useState<string | undefined>(user?.username)
	const [displayResult, setDisplayResult] = useState<boolean>(false)
	const [successful, setSuccessful] = useState<boolean>(false)
	const [verifyMessage, setVerifyMessage] = useState<string | undefined>()

	const [loadingText, setLoadingText] = useState<string>()

	useEffect(() => {
		if (user?.username === username || user?.username === newUsername) return

		if (authLoading) {
			setLoadingText("Loading. Please wait...")
			return
		}
		let userTimeout: NodeJS.Timeout
		if (!user) {
			setLoadingText("You need to be logged in to view this page. Redirecting to login page...")
			userTimeout = setTimeout(() => {
				history.push("/login")
			}, 2000)
		} else if (user.username !== username && user.username !== newUsername) {
			setLoadingText("You do not have permission view this page. Redirecting to profile page...")
			userTimeout = setTimeout(() => {
				history.push(`/profile/${user.username}/game-assets`)
			}, 2000)
		}

		return () => {
			if (!userTimeout) return
			clearTimeout(userTimeout)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, history, authLoading])

	if (!user || (user.username !== username && user.username !== newUsername)) {
		return <Loading text={loadingText} />
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				padding: "0 3rem",
				flex: 1,
				marginBottom: "3rem",
			}}
		>
			<ProfileEdit
				setNewUsername={setNewUsername}
				setDisplayResult={setDisplayResult}
				setSuccessful={setSuccessful}
				setVerifyMessage={setVerifyMessage}
			/>

			<Dialog open={displayResult} onClose={() => setDisplayResult(false)}>
				<Box sx={{ border: `4px solid ${colors.darkNavyBackground}`, padding: ".5rem", maxWidth: "500px" }}>
					<DialogTitle sx={{ display: "flex", width: "100%", alignItems: "center" }}>
						{successful ? (
							<CheckCircleOutlineIcon sx={{ fontSize: "2.5rem" }} color="success" />
						) : (
							<ErrorOutlineIcon sx={{ fontSize: "2.5rem" }} color="error" />
						)}
						<Typography variant="h2" sx={{ padding: "1rem" }}>
							{successful ? "Success!" : "Error"}
						</Typography>
					</DialogTitle>
					<DialogContent>
						<Typography
							sx={{
								marginBottom: ".5rem",
							}}
						>
							{successful ? "Your account has successfully been updated!" : "Something went wrong, please try again."}
						</Typography>

						{successful && verifyMessage && (
							<Typography sx={{ my: "1rem", fontSize: "110%" }}>
								<b>{verifyMessage}</b>
							</Typography>
						)}
						{!successful && (
							<Box
								sx={{
									fontSize: ".8em",
									color: colors.darkGrey,
								}}
							>
								Your username must:
								<Box
									component="ul"
									sx={{
										margin: 0,
									}}
								>
									<li>be between 3 and 15 characters long</li>
									<li>not contain any special characters (excluding underscores)</li>
								</Box>
								<br />
								Your mobile number must:
								<Box
									component="ul"
									sx={{
										margin: 0,
									}}
								>
									<li>contain international country code</li>
								</Box>
								<br />
								Your mobile number must:
								<Box
									component="ul"
									sx={{
										margin: 0,
									}}
								>
									<li>contain international country code</li>
								</Box>
							</Box>
						)}
					</DialogContent>
					<DialogActions>
						<Button size="large" variant="contained" onClick={() => setDisplayResult(false)}>
							Close
						</Button>
					</DialogActions>
				</Box>
			</Dialog>
		</Box>
	)
}

interface UserInput {
	mobile_number?: string
	email?: string
	new_username?: string
	first_name?: string
	last_name?: string
	new_password?: string
	current_password?: string // required if changing password
	avatar_id?: string
	organisation_id?: string
	two_factor_authentication_activated: boolean
}

interface ProfileEditProps {
	setNewUsername: React.Dispatch<React.SetStateAction<string | undefined>>
	setDisplayResult: React.Dispatch<React.SetStateAction<boolean>>
	setSuccessful: React.Dispatch<React.SetStateAction<boolean>>
	setVerifyMessage: React.Dispatch<React.SetStateAction<string | undefined>>
}

const ProfileEdit = ({ setNewUsername, setDisplayResult, setSuccessful, setVerifyMessage }: ProfileEditProps) => {
	const token = localStorage.getItem("token")
	const { user } = useAuth()
	const { send } = usePassportCommandsUser("/commander")
	const history = useHistory()
	const [lockOption, setLockOption] = useState<LockOptionsProps>()
	const [lockOpen, setLockOpen] = useState<boolean>(false)
	const [openChangePassword, setOpenChangePassword] = useState(false)

	// TFA
	const [loadingSetupBtn, setLoadingSetupBtn] = useState(false)

	// Setup form
	const { control, handleSubmit, reset, formState } = useForm<UserInput>()
	const { isDirty } = formState

	//const { mutate: upload } = useMutation(fetching.mutation.fileUpload)
	const [submitting, setSubmitting] = useState(false)
	const [changePassword, setChangePassword] = useState(false)

	//const [avatar, setAvatar] = useState<File>()
	//const [avatarChanged, setAvatarChanged] = useState(false)

	const onSaveForm = handleSubmit(async (data) => {
		if (!user) return
		const { new_username, new_password, ...input } = data
		setSubmitting(true)
		try {
			// let avatarID: string | undefined = user.avatar_id
			// if (avatarChanged) {
			// 	if (!!avatar) {
			// 		// Upload avatar
			// 		const r = await upload({ file: avatar, public: true })
			// 		if (r.error || !r.payload) {
			// 			displayMessage("Failed to upload image, please try again.", "error")
			// 			setSubmitting(false)
			// 			return
			// 		}
			// 		avatarID = r.payload.id
			// 	} else {
			// 		// Remove avatar
			// 		avatarID = undefined
			// 	}
			// }

			const payload = {
				...input,
				user_agent: window.navigator.userAgent,
				new_username: user.username !== new_username ? new_username : undefined,
				new_password: changePassword ? new_password : undefined,
				//avatar_id: avatarID,
			}

			const resp = await send<User>(HubKey.UserUpdate, {
				id: user.id,
				...payload,
			})

			if (resp) {
				setDisplayResult(true)
				setSuccessful(true)
				setChangePassword(false)
				setDisplayResult(true)
				setNewUsername(new_username)

				if (payload.email !== user.email) {
					setVerifyMessage(`An email was sent to ${payload.email}, please verify this email to change your current email.`)
				} else {
					setTimeout(() => {
						history.push(`/profile`)
					}, 3000)
				}
			}
		} catch (e) {
			setDisplayResult(true)
			setSuccessful(false)
			setVerifyMessage(undefined)
		} finally {
			setSubmitting(false)
		}
	})

	// const onAvatarChange = (file?: File) => {
	// 	if (!avatarChanged) setAvatarChanged(true)
	// 	if (!file) {
	// 		setAvatar(undefined)
	// 	} else {
	// 		setAvatar(file)
	// 	}
	// }

	// Load defaults
	useEffect(() => {
		if (!user) return
		reset({
			email: user.email || "",
			new_username: user.username,
			first_name: user.first_name,
			last_name: user.last_name,
			organisation_id: user.organisation?.id,
			mobile_number: user.mobile_number,
			two_factor_authentication_activated: user.two_factor_authentication_activated,
			current_password: "",
			new_password: "",
		})

		// Get avatar as file
		// if (!!user.avatar_id)
		// 	fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${user.avatar_id}?token=${encodeURIComponent(token || "")}`).then((r) =>
		// 		r.blob().then((b) => setAvatar(new File([b], "avatar.jpg", { type: b.type }))),
		// 	)
	}, [user, reset, token])

	if (!user) {
		return <Loading />
	}

	return (
		<Paper
			sx={{
				width: "100%",
				maxWidth: "800px",
				marginBottom: "2rem",
				padding: "2rem",
				flex: 1,
			}}
		>
			<Box
				component="form"
				onSubmit={onSaveForm}
				sx={{
					display: "flex",
					height: "100%",
					overflow: "auto",
					flexDirection: "column",
					gap: "1rem",
					// marginBottom: "3rem",
					"& > *:not(:last-child)": {
						marginBottom: "1rem",
					},
				}}
			>
				<Typography id="profile" variant="h1" component="h2">
					Edit Profile
				</Typography>

				{/* Temporarily removed for public sale */}
				{/* <Section>
					<Typography variant="subtitle1">Avatar</Typography>
					<ImageUpload
						label="Upload Avatar"
						file={avatar}
						onChange={onAvatarChange}
						avatarPreview
						sx={{
							"& .MuiAvatar-root": {
								width: "10rem",
								height: "10rem",
								marginBottom: "1rem",
							},
						}}
					/>
				</Section> */}

				<Section>
					<Typography variant="subtitle1">User Details</Typography>
					<Box
						sx={{
							display: "flex",
							flex: 1,
							height: "100%",
							flexWrap: "wrap",
							gap: "0.5rem",
						}}
					>
						<InputField
							label="Username"
							name="new_username"
							control={control}
							rules={{
								required: "Username cannot be empty",
							}}
							disabled={submitting}
							sx={{ minWidth: "180px", flex: "1 0 48%" }}
						/>

						<InputField
							label="First Name"
							name="first_name"
							control={control}
							disabled={submitting}
							sx={{ minWidth: "180px", flex: "1 0 48%" }}
						/>
						<InputField
							label="Last Name"
							name="last_name"
							control={control}
							disabled={submitting}
							sx={{ minWidth: "180px", flex: "1 0 48%" }}
						/>

						<InputField
							label="Mobile Number"
							name="mobile_number"
							control={control}
							disabled={submitting}
							sx={{ minWidth: "180px", flex: "1 0 48%" }}
						/>
						{ENVIRONMENT === "develop" && (
							<InputField
								name="email"
								label="Email"
								type="email"
								fullWidth
								control={control}
								rules={{
									required: changePassword && "Email must be provided if you are changing your password.",
									pattern: {
										value: /.+@.+\..+/,
										message: "Invalid email address",
									},
								}}
								disabled={submitting}
								sx={{ minWidth: "180px", flex: "1 0 48%" }}
							/>
						)}
					</Box>
					<Button
						sx={{
							mb: "1rem",
						}}
						type="submit"
						//add this to disabled when avatar change is ready: && !avatarChanged
						disabled={(!isDirty && !changePassword) || submitting}
						variant="contained"
						color="primary"
						startIcon={<FontAwesomeIcon icon={["fas", "save"]} />}
					>
						Save
					</Button>
				</Section>

				{/* ------------- Manage Connections ------------------ */}
				{ENVIRONMENT === "develop" && (
					<>
						<Stack spacing=".5rem">
							<Typography variant="h6">Manage Connections</Typography>
							<Box sx={{ display: "flex", gap: "1rem" }}>
								<Wallet />
								<Facebook />
								<Google />
								<Twitter />
							</Box>
						</Stack>
						{/* -------------------------- Two Factor Authentication--------------------------------- */}
						<Stack spacing=".5rem">
							<Typography variant="h6">Two-Factor Authentication</Typography>

							<Box sx={{ display: "flex", gap: ".5rem", flexWrap: "wrap", width: "100%" }}>
								<FancyButton
									loading={loadingSetupBtn}
									filled
									borderColor={user.two_factor_authentication_is_set ? colors.darkGrey : undefined}
									sx={{
										width: "calc(50% - .25rem)",
										fontSize: "105%",
									}}
									size="small"
									onClick={async () => {
										setLoadingSetupBtn(true)
										if (!user?.two_factor_authentication_is_set) {
											history.push(`/tfa/${user?.username}/setup`)
											return
										}
									}}
								>
									{user.two_factor_authentication_is_set ? "Remove Two-Factor Authentication" : "Setup Two-Factor Authentication"}
								</FancyButton>
								<FancyButton
									filled
									borderColor={colors.skyBlue}
									disabled={!user.two_factor_authentication_is_set}
									sx={{
										width: "calc(50% - .25rem)",
										fontSize: "105%",
									}}
									size="small"
									onClick={() => {
										history.push(`/tfa/${user?.username}/recovery-code`)
									}}
								>
									Get Recovery Code
								</FancyButton>
							</Box>
						</Stack>
					</>
				)}

				{/* -------------------------- Account admin --------------------------------- */}
				<Stack spacing=".5rem">
					<Typography variant="h6">Security</Typography>

					<Box sx={{ display: "flex", gap: ".5rem", flexWrap: "wrap", width: "100%" }}>
						{ENVIRONMENT === "develop" && (
							<FancyButton
								tooltip={"Change your password"}
								sx={{ minWidth: "15rem", width: "calc(50% - .25rem)" }}
								size="small"
								onClick={() => setOpenChangePassword(true)}
							>
								{user.has_password ? "Change Password" : "Set Password"}
							</FancyButton>
						)}
						{lockOptions.map((option) => (
							<LockButton key={option.type} option={option} setLockOption={setLockOption} setOpen={setLockOpen} />
						))}
					</Box>
				</Stack>
			</Box>

			<ChangePasswordModal
				open={openChangePassword}
				setOpen={setOpenChangePassword}
				setSuccessfull={setSuccessful}
				setDisplayResult={setDisplayResult}
				isNew={!user.has_password}
			/>
			{lockOption && <LockModal option={lockOption} setOpen={setLockOpen} open={lockOpen} />}
			{loadingSetupBtn && user.two_factor_authentication_is_set && (
				<RemoveTFAModal
					open={loadingSetupBtn && user.two_factor_authentication_is_set}
					setOpen={setLoadingSetupBtn}
					setSuccessful={setSuccessful}
					setDisplayResult={setDisplayResult}
				/>
			)}
		</Paper>
	)
}

const Section = styled("div")({
	display: "flex",
	flexDirection: "column",
	"& > *:not(:last-child)": {
		marginBottom: ".5rem",
	},
})
