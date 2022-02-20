import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { Box, Button, CircularProgress, IconButton, IconButtonProps, Link, Paper, styled, Typography } from "@mui/material"
import { User } from "@sentry/react"
import { useCallback, useEffect, useState } from "react"
import { useMutation } from "react-fetching-library"
import GoogleLogin, { GoogleLoginResponse } from "react-google-login"
import { useForm } from "react-hook-form"
import { Link as RouterLink, useHistory, useParams } from "react-router-dom"
import { DiscordIcon, FacebookIcon, GoogleIcon, MetaMaskIcon, TwitchIcon, TwitterIcon } from "../../assets"
import { DiscordLogin } from "../../components/discordLogin"
import { FacebookLogin } from "../../components/facebookLogin"
import { ImageUpload } from "../../components/form/imageUpload"
import { InputField } from "../../components/form/inputField"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { MetaMaskLogin } from "../../components/loginMetaMask"
import { TwitchLogin } from "../../components/twitchLogin"
import { TwitterLogin } from "../../components/twitterLogin"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { useWebsocket } from "../../containers/socket"
import { MetaMaskState, useWeb3 } from "../../containers/web3"
import { fetching } from "../../fetching"
import { middleTruncate } from "../../helpers"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Organisation, Role } from "../../types/types"
import { PasswordRequirement } from "./../auth/onboarding"

export const ProfileEditPage: React.FC = () => {
	const { username } = useParams<{ username: string }>()
	const history = useHistory()
	const { user } = useAuth()

	const [loadingText, setLoadingText] = useState<string>()

	useEffect(() => {
		let userTimeout: NodeJS.Timeout
		if (!user) {
			setLoadingText("You need to be logged in to view this page. Redirecting to login page...")
			userTimeout = setTimeout(() => {
				history.push("/login")
			}, 2000)
		} else if (user.username !== username) {
			setLoadingText("You do not have permission view this page. Redirecting to profile page...")
			userTimeout = setTimeout(() => {
				history.push("/profile")
			}, 2000)
		}

		return () => {
			if (!userTimeout) return
			clearTimeout(userTimeout)
		}
	}, [user, history])

	if (!user || user.username !== username) {
		return <Loading text={loadingText} />
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<Navbar />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					padding: "0 3rem",
					marginBottom: "3rem",
				}}
			>
				<Box
					sx={{
						width: "100%",
						maxWidth: "800px",
						marginBottom: "1rem",
					}}
				>
					<Link
						variant="h5"
						underline="hover"
						sx={{
							display: "flex",
							alignItems: "center",
							textTransform: "uppercase",
						}}
						color={colors.white}
						component={"button"}
						onClick={() => history.goBack()}
					>
						<ChevronLeftIcon />
						Go Back
					</Link>
				</Box>
				<ProfileEdit />
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						width: "100%",
						maxWidth: "600px",
						marginTop: "auto",
					}}
				>
					<Link component={RouterLink} to="/privacy-policy">
						Privacy Policy
					</Link>
					<Link component={RouterLink} to="/terms-and-conditions">
						Terms And Conditions
					</Link>
				</Box>
			</Box>
		</Box>
	)
}

interface UserInput {
	email?: string
	newUsername?: string
	firstName?: string
	lastName?: string
	newPassword?: string
	/** Required if changing own password */
	currentPassword?: string
	avatarID?: string
	roleID?: string
	organisationID?: string
	publicAddress?: string

	organisation: Organisation
	role: Role
	twoFactorAuthenticationActivated: boolean
}

const ProfileEdit: React.FC = () => {
	const token = localStorage.getItem("token")
	const { metaMaskState, sign, account, connect } = useWeb3()
	const { user, addFacebook, addGoogle, addTwitch, addTwitter, addDiscord, removeFacebook, removeGoogle, removeTwitch, removeTwitter, removeDiscord } =
		useAuth()
	const { send } = useWebsocket()
	const { displayMessage } = useSnackbar()

	// Setup form
	const { control, handleSubmit, reset, watch, formState } = useForm<UserInput>()
	const { isDirty } = formState
	const password = watch("newPassword")

	const { mutate: upload } = useMutation(fetching.mutation.fileUpload)
	const [submitting, setSubmitting] = useState(false)
	const [changePassword, setChangePassword] = useState(false)

	const [avatar, setAvatar] = useState<File>()
	const [avatarChanged, setAvatarChanged] = useState(false)

	const onSaveForm = handleSubmit(async (data) => {
		if (!user) return
		setSubmitting(true)

		try {
			let avatarID: string | undefined = user.avatarID
			if (avatarChanged) {
				if (!!avatar) {
					// Upload avatar
					const r = await upload({ file: avatar, public: true })
					if (r.error || !r.payload) {
						displayMessage("Failed to upload image, please try again.", "error")
						setSubmitting(false)
						return
					}
					avatarID = r.payload.id
				} else {
					// Remove avatar
					avatarID = undefined
				}
			}

			const { newUsername, newPassword, ...input } = data
			const payload = {
				...input,
				newUsername: user.username !== newUsername ? newUsername : undefined,
				newPassword: changePassword ? newPassword : undefined,
				avatarID,
			}

			const resp = await send<User>(HubKey.UserUpdate, {
				id: user.id,
				...payload,
			})

			if (resp) {
				displayMessage("Profile successfully updated.", "success")
			}
			setChangePassword(false)
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	})

	const removeWalletAddress = useCallback(async () => {
		if (!user) return
		try {
			setSubmitting(true)
			await send(HubKey.UserRemoveWallet, { id: user.id })
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}, [user, send, displayMessage])

	const onAvatarChange = (file?: File) => {
		if (!avatarChanged) setAvatarChanged(true)
		if (!file) {
			setAvatar(undefined)
		} else {
			setAvatar(file)
		}
	}

	// Load defaults
	useEffect(() => {
		if (!user) return

		reset({
			email: user.email || "",
			newUsername: user.username,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			organisation: user.organisation,
			roleID: user.roleID,
			organisationID: user.organisation?.id,
			publicAddress: user.publicAddress || "",
			twoFactorAuthenticationActivated: user.twoFactorAuthenticationActivated,
			currentPassword: "",
			newPassword: "",
		})

		// Get avatar as file
		if (!!user.avatarID)
			fetch(`/api/files/${user.avatarID}?token=${encodeURIComponent(token || "")}`).then((r) =>
				r.blob().then((b) => setAvatar(new File([b], "avatar.jpg", { type: b.type }))),
			)
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
			}}
		>
			<Box
				component="form"
				onSubmit={onSaveForm}
				sx={{
					display: "flex",
					flexDirection: "column",
					marginBottom: "3rem",
					"& > *:not(:last-child)": {
						marginBottom: "1rem",
					},
				}}
			>
				<Typography id="profile" variant="h1" component="h2">
					Edit Profile
				</Typography>

				<Section>
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
				</Section>

				<Section>
					<Typography variant="subtitle1">User Details</Typography>
					<InputField
						label="Username"
						name="newUsername"
						control={control}
						rules={{
							required: "Username cannot be empty",
						}}
						disabled={submitting}
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
						<InputField label="First Name" name="firstName" control={control} disabled={submitting} fullWidth />
						<InputField label="Last Name" name="lastName" control={control} disabled={submitting} fullWidth />
					</Box>
					<InputField
						name="email"
						label="Email"
						type="email"
						control={control}
						rules={{
							required: changePassword && "Email must be provided if you are changing your password.",
							pattern: {
								value: /.+@.+\..+/,
								message: "Invalid email address",
							},
						}}
						disabled={submitting}
					/>
				</Section>

				<Section>
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
									</PasswordRequirement>
									{/* eslint-disable-next-line */}
									<PasswordRequirement fulfilled={!!password && /\d/.test(password)}>
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
				</Section>

				<Box
					sx={{
						display: "flex",
						justifyContent: "flex-end",
						"& > *:not(:last-child)": {
							marginRight: ".5rem",
						},
					}}
				>
					<Button
						type="submit"
						disabled={(!isDirty && !avatarChanged && !changePassword) || submitting}
						variant="contained"
						color="primary"
						startIcon={<FontAwesomeIcon icon={["fas", "save"]} />}
					>
						Save
					</Button>
				</Box>
			</Box>
			<Box
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
							icon={MetaMaskIcon}
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
									title={
										props.metaMaskState === MetaMaskState.NotInstalled
											? "Install MetaMask"
											: props.metaMaskState === MetaMaskState.NotLoggedIn
											? "Sign into your MetaMask to continue"
											: "Login With MetaMask"
									}
									icon={MetaMaskIcon}
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
			</Box>
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

interface ConnectionButtonProps extends Omit<IconButtonProps, "children"> {
	icon: React.ElementType
	value?: string
	loading?: boolean
	remove?: boolean
}

const ConnectionButton = ({ icon, value, loading, remove, disabled, sx, ...props }: ConnectionButtonProps) => {
	if (remove) {
		return (
			<Box
				sx={{
					overflowX: "hidden",
					position: "relative",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					padding: "1rem",
					borderRadius: 0,
					border: `2px solid ${colors.skyBlue}`,
					...sx,
				}}
				tabIndex={-1}
			>
				<IconButton
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						opacity: 0,
						width: "100%",
						borderRadius: 0,
						transition: "opacity .2s ease-out",
						":hover": {
							opacity: 1,
						},
						":focus": {
							opacity: 1,
						},
						"::after": {
							content: '""',
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							backgroundColor: "rgba(0, 0, 0, .6)",
						},
					}}
					disabled={disabled || !!loading}
					{...props}
				>
					<Typography
						color={colors.white}
						sx={{
							zIndex: 1,
						}}
					>
						Remove Wallet
					</Typography>
				</IconButton>

				{!!loading && (
					<Box
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							backgroundColor: "rgba(0, 0, 0, .6)",
						}}
					>
						<CircularProgress />
					</Box>
				)}
				<Box
					component={icon}
					sx={{
						marginBottom: ".5rem",
					}}
				/>
				<Typography>{value ? middleTruncate(value) : "Not Connected"}</Typography>
			</Box>
		)
	}

	return (
		<IconButton
			sx={{
				overflowX: "hidden",
				position: "relative",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "1rem",
				borderRadius: 0,
				border: `2px solid ${colors.skyBlue}`,
				...sx,
			}}
			disabled={disabled || !!loading}
			{...props}
		>
			{!!loading && (
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "rgba(0, 0, 0, .6)",
					}}
				>
					<CircularProgress />
				</Box>
			)}
			<Box
				component={icon}
				sx={{
					marginBottom: ".5rem",
				}}
			/>
			<Typography>{value ? middleTruncate(value) : "Not Connected"}</Typography>
		</IconButton>
	)
}
