import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Link, Paper, Stack, styled, Tooltip, Typography } from "@mui/material"
import { User } from "@sentry/react"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useHistory, useParams } from "react-router-dom"
import { PrivacyPolicy, TermsAndConditions } from "../../../assets"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { Loading } from "../../../components/loading"
import { useAuth } from "../../../containers/auth"
import { usePassportCommandsUser } from "../../../hooks/usePassport"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { LockButton, lockOptions, LockOptionsProps } from "../Locking/LockButton"
import { LockModal } from "../Locking/LockModal"
import { ChangePasswordModal } from "./ChangePasswordModal"

export const ProfileEditPage: React.FC = () => {
	const { username } = useParams<{ username: string }>()
	const history = useHistory()
	const { loading: authLoading } = useAuth()
	const { user } = useAuth()
	const [newUsername, setNewUsername] = useState<string | undefined>(user?.username)
	const [displayResult, setDisplayResult] = useState<boolean>(false)
	const [successful, setSuccessful] = useState<boolean>(false)

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
			<ProfileEdit setNewUsername={setNewUsername} setDisplayResult={setDisplayResult} setSuccessful={setSuccessful} />
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					width: "100%",
					maxWidth: "600px",
					marginTop: "auto",
				}}
			>
				<Link href={TermsAndConditions} target="_blank">
					Privacy Policy
				</Link>
				<Link href={PrivacyPolicy} target="_blank">
					Terms And Conditions
				</Link>
			</Box>
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
							{successful ? "Your account has successfully been updated! ." : "Something went wrong, please try again."}
						</Typography>
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
}

const ProfileEdit = ({ setNewUsername, setDisplayResult, setSuccessful }: ProfileEditProps) => {
	const token = localStorage.getItem("token")
	const { user } = useAuth()
	const { send } = usePassportCommandsUser("/commander")
	const history = useHistory()
	const [lockOption, setLockOption] = useState<LockOptionsProps>()
	const [lockOpen, setLockOpen] = useState<boolean>(false)
	const [openChangePassword, setOpenChangePassword] = useState(false)

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
				setTimeout(() => {
					history.push(`/profile`)
				}, 3000)
			}
		} catch (e) {
			setDisplayResult(true)
			setSuccessful(false)
		} finally {
			setSubmitting(false)
		}
	})

	// This will be readded in when other connections are made available to the user
	// const removeWalletAddress = useCallback(async () => {
	// 	if (!user) return
	// 	try {
	// 		setSubmitting(true)
	// 		await send(HubKey.UserRemoveWallet, { id: user.id })
	// 	} catch (e) {
	// 		displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
	// 	} finally {
	// 		setSubmitting(false)
	// 	}
	// }, [user, send, displayMessage])

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
						<InputField
							label="Mobile Number"
							name="mobile_number"
							control={control}
							disabled={submitting}
							sx={{ minWidth: "180px", flex: "1 0 48%" }}
						/>
					</Box>
					<Button
						sx={{
							my: "1rem",
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
				<Stack spacing=".5rem">
					<Typography variant="h6">Account</Typography>

					<Box sx={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
						<Tooltip title="Change your password">
							<FancyButton
								sx={{ minWidth: "15rem", width: "calc(50% - .5rem)" }}
								size="small"
								onClick={() => setOpenChangePassword(true)}
							>
								{user.has_password ? "Change Password" : "Set Password"}
							</FancyButton>
						</Tooltip>
						{lockOptions.map((option) => (
							<LockButton key={option.type} option={option} setLockOption={setLockOption} setOpen={setLockOpen} />
						))}
					</Box>
				</Stack>

				{/* Temporarily removed for public sale */}
				{/* <Section>
					<Typography variant="subtitle1">Password</Typography>
					{changePassword && (
						<InputField
							disabled={submitting}
							control={control}
							name="currentPassword"
							rules={{ required: "Please enter current password." }}
							type="password"
							placeholder="Enter current password"
							label="Current password"
						/>
					)}

					{!changePassword && (
						<Button type="button" variant="contained" onClick={() => setChangePassword(true)}>
							Change Password
						</Button>
					)}
					{changePassword && (
						<>
							<InputField
								disabled={submitting}
								control={control}
								name="newPassword"
								rules={{ required: "Please enter a new password." }}
								type="password"
								placeholder="Enter a new password"
								label="New password"
							/>
							<Box>
								Your new password must:
								<ul>
									<PasswordRequirement fulfilled={!!password && password.length >= 8}>be 8 or more characters long</PasswordRequirement>
									<PasswordRequirement fulfilled={!!password && password.toUpperCase() !== password && password.toLowerCase() !== password}>
										contain <strong>upper</strong> &#38; <strong>lower</strong> case letters
									</PasswordRequirement> */}
				{/* eslint-disable-next-line */}
				{/* <PasswordRequirement fulfilled={!!password && /\d/.test(password)}>
										contain at least <strong>1 number</strong>
									</PasswordRequirement>
									<PasswordRequirement fulfilled={!!password && /[`!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(password)}>
										contain at least <strong>1 symbol</strong>
									</PasswordRequirement>
								</ul>
							</Box>
							<Button
								type="button"
								variant="contained"
								onClick={() => {
									reset(undefined, {
										keepValues: true,
									})
									setChangePassword(false)
								}}
							>
								Cancel Password Change
							</Button>
						</>
					)}
				</Section> */}
			</Box>

			<ChangePasswordModal
				open={openChangePassword}
				setOpen={setOpenChangePassword}
				setSuccessfull={setSuccessful}
				setDisplayResult={setDisplayResult}
				isNew={!user.has_password}
			/>
			{lockOption && <LockModal option={lockOption} setOpen={setLockOpen} open={lockOpen} />}

			{/* Temporarily removed for public sale */}
			{/* <Box
				sx={{
					display: "flex",
					flexDirection: "column",
					"& > *:not(:last-child)": {
						marginBottom: "1rem",
					},
				}}
			>
				<Typography id="connections" variant="h1" component="h2">
					Manage Connections
				</Typography>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
						gap: "1rem",
					}}
				>
					{user.publicAddress ? (
						<ConnectionButton
							onClick={async () => {
								await removeWalletAddress()
							}}
							title="Remove MetaMask"
							icon={
								typeof (window as any).ethereum === "undefined" || typeof (window as any).web3 === "undefined"
									? WalletConnectIcon
									: MetaMaskIcon
							}
							value={user.publicAddress}
							remove
						/>
					) : (
						<MetaMaskLogin
							onFailure={(error) => {
								displayMessage(error, "error")
							}}
							render={(props) => (
								<ConnectionButton
									onClick={props.onClick}
									title="Connect Wallet"
									icon={
										typeof (window as any).ethereum === "undefined" || typeof (window as any).web3 === "undefined"
											? WalletConnectIcon
											: MetaMaskIcon
									}
									value={user.publicAddress}
									disabled={!!user.publicAddress || props.isProcessing}
									loading={props.isProcessing}
								/>
							)}
						/>
					)}

					{user.twitterID ? (
						<ConnectionButton
							onClick={async () => {
								await removeTwitter(user.id, user.username)
							}}
							title="Remove Twitter"
							icon={TwitterIcon}
							value={user.twitterID}
							remove
						/>
					) : (
						<TwitterLogin
							callback={async (response) => {
								try {
									await addTwitter(response.token, response.verifier)
								} catch (e) {
									displayMessage(typeof e === "string" ? e : "Something went wrong, please try again", "error")
								}
							}}
							onFailure={(error) => {
								displayMessage(error.status || "Failed to connect account to Twitter.", "error")
							}}
							render={(props) => (
								<ConnectionButton
									onClick={props.onClick}
									icon={TwitterIcon}
									value={user.twitterID}
									disabled={!!user.twitterID || props.isProcessing}
									loading={props.isProcessing}
								/>
							)}
						/>
					)}

					{user.discordID ? (
						<ConnectionButton
							onClick={async () => {
								await removeDiscord(user.id, user.username)
							}}
							title="Remove Discord"
							icon={DiscordIcon}
							value={user.discordID}
							remove
						/>
					) : (
						<DiscordLogin
							callback={async (response) => {
								try {
									await addDiscord(response.code)
								} catch (e) {
									displayMessage(typeof e === "string" ? e : "Something went wrong, please try again", "error")
								}
							}}
							onFailure={(error) => {
								displayMessage(error.status || "Failed to connect account to Discord.", "error")
							}}
							render={(props) => (
								<ConnectionButton
									onClick={props.onClick}
									icon={DiscordIcon}
									value={user.discordID}
									disabled={!!user.discordID || props.isProcessing}
									loading={props.isProcessing}
								/>
							)}
						/>
					)}

					{user.facebookID ? (
						<ConnectionButton
							onClick={async () => {
								await removeFacebook(user.id, user.username)
							}}
							title="Remove Facebook"
							icon={FacebookIcon}
							value={user.facebookID}
							remove
						/>
					) : (
						<FacebookLogin
							callback={async (response: any) => {
								try {
									if (!!response && !!response.status) {
										displayMessage(`Couldn't connect to Facebook: ${response.status}`, "error")
										return
									}
									await addFacebook(response.accessToken)
								} catch (e) {
									displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
								}
							}}
							onFailure={(error) => {
								displayMessage(error.status || "Failed to connect account to Facebook.", "error")
							}}
							render={(props) => (
								<ConnectionButton
									onClick={props.onClick}
									icon={FacebookIcon}
									value={user.facebookID}
									disabled={!!user.facebookID || props.isProcessing || !props.isSdkLoaded}
									loading={props.isProcessing || !props.isSdkLoaded}
								/>
							)}
						/>
					)}

					{user.googleID ? (
						<ConnectionButton
							onClick={async () => {
								await removeGoogle(user.id, user.username)
							}}
							title="Remove Google"
							icon={GoogleIcon}
							value={user.googleID}
							remove
						/>
					) : (
						<GoogleLogin
							clientId="467953368642-8cobg822tej2i50ncfg4ge1pm4c5v033.apps.googleusercontent.com"
							buttonText="Login"
							onSuccess={async (response) => {
								try {
									if (!!response.code) {
										displayMessage(`Couldn't connect to Google: ${response.code}`, "error")
										return
									}
									const r = response as GoogleLoginResponse
									await addGoogle(r.tokenId)
								} catch (e) {
									displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
								}
							}}
							onFailure={(error) => {
								displayMessage(error.message, "error")
							}}
							cookiePolicy={"single_host_origin"}
							render={(props) => (
								<ConnectionButton
									onClick={props.onClick}
									icon={GoogleIcon}
									value={user.googleID}
									disabled={!!user.googleID || props.disabled}
									loading={props.disabled}
								/>
							)}
						/>
					)}

					{user.twitchID ? (
						<ConnectionButton
							onClick={async () => {
								await removeTwitch(user.id, user.username)
							}}
							title="Remove Twitch"
							icon={TwitchIcon}
							value={user.twitchID}
							remove
						/>
					) : (
						<TwitchLogin
							callback={async (response) => {
								try {
									await addTwitch(response.token)
								} catch (e) {
									displayMessage(typeof e === "string" ? e : "Something went wrong, please try again", "error")
								}
							}}
							onFailure={(error) => {
								displayMessage(error.status || "Failed to connect account to Twitch.", "error")
							}}
							render={(props) => (
								<ConnectionButton
									onClick={props.onClick}
									icon={TwitchIcon}
									value={user.twitchID}
									disabled={!!user.twitchID || props.isProcessing}
									loading={props.isProcessing}
								/>
							)}
						/>
					)}
				</Box>
			</Box> */}
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

// This will be readded in when other connections are made available to the user
// interface ConnectionButtonProps extends Omit<IconButtonProps, "children"> {
// 	icon: React.ElementType
// 	value?: string
// 	loading?: boolean
// 	remove?: boolean
// }

// const ConnectionButton = ({ icon, value, loading, remove, disabled, sx, ...props }: ConnectionButtonProps) => {
// 	if (remove) {
// 		return (
// 			<Box
// 				sx={{
// 					overflowX: "hidden",
// 					position: "relative",
// 					display: "flex",
// 					flexDirection: "column",
// 					alignItems: "center",
// 					justifyContent: "center",
// 					padding: "1rem",
// 					borderRadius: 0,
// 					border: `2px solid ${colors.skyBlue}`,
// 					...sx,
// 				}}
// 				tabIndex={-1}
// 			>
// 				<IconButton
// 					sx={{
// 						position: "absolute",
// 						top: 0,
// 						left: 0,
// 						right: 0,
// 						bottom: 0,
// 						opacity: 0,
// 						width: "100%",
// 						borderRadius: 0,
// 						transition: "opacity .2s ease-out",
// 						":hover": {
// 							opacity: 1,
// 						},
// 						":focus": {
// 							opacity: 1,
// 						},
// 						"::after": {
// 							content: '""',
// 							position: "absolute",
// 							top: 0,
// 							left: 0,
// 							right: 0,
// 							bottom: 0,
// 							backgroundColor: "rgba(0, 0, 0, .6)",
// 						},
// 					}}
// 					disabled={disabled || !!loading}
// 					{...props}
// 				>
// 					<Typography
// 						color={colors.white}
// 						sx={{
// 							zIndex: 1,
// 						}}
// 					>
// 						Remove Wallet
// 					</Typography>
// 				</IconButton>

// 				{!!loading && (
// 					<Box
// 						sx={{
// 							position: "absolute",
// 							top: 0,
// 							left: 0,
// 							right: 0,
// 							bottom: 0,
// 							display: "flex",
// 							alignItems: "center",
// 							justifyContent: "center",
// 							backgroundColor: "rgba(0, 0, 0, .6)",
// 						}}
// 					>
// 						<CircularProgress />
// 					</Box>
// 				)}
// 				<Box
// 					component={icon}
// 					sx={{
// 						marginBottom: ".5rem",
// 					}}
// 				/>
// 				<Typography>{value ? middleTruncate(value) : "Not Connected"}</Typography>
// 			</Box>
// 		)
// 	}

// 	return (
// 		<IconButton
// 			sx={{
// 				overflowX: "hidden",
// 				position: "relative",
// 				display: "flex",
// 				flexDirection: "column",
// 				alignItems: "center",
// 				justifyContent: "center",
// 				padding: "1rem",
// 				borderRadius: 0,
// 				border: `2px solid ${colors.skyBlue}`,
// 				...sx,
// 			}}
// 			disabled={disabled || !!loading}
// 			{...props}
// 		>
// 			{!!loading && (
// 				<Box
// 					sx={{
// 						position: "absolute",
// 						top: 0,
// 						left: 0,
// 						right: 0,
// 						bottom: 0,
// 						display: "flex",
// 						alignItems: "center",
// 						justifyContent: "center",
// 						backgroundColor: "rgba(0, 0, 0, .6)",
// 					}}
// 				>
// 					<CircularProgress />
// 				</Box>
// 			)}
// 			<Box
// 				component={icon}
// 				sx={{
// 					marginBottom: ".5rem",
// 				}}
// 			/>
// 			<Typography>{value ? middleTruncate(value) : "Not Connected"}</Typography>
// 		</IconButton>
// 	)
// }
