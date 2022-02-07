import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import MetaMaskOnboarding from "@metamask/onboarding"
import EditIcon from "@mui/icons-material/Edit"
import { LoadingButton } from "@mui/lab"
import { Alert, Avatar, Box, BoxProps, Button, IconButton, IconButtonProps, Link, Snackbar, styled, TextField, Typography } from "@mui/material"
import { User } from "@sentry/react"
import { useCallback, useEffect, useState } from "react"
import { useMutation } from "react-fetching-library"
import GoogleLogin, { GoogleLoginResponse } from "react-google-login"
import { useForm } from "react-hook-form"
import { Link as RouterLink, Route, Switch, useHistory } from "react-router-dom"
import { DiscordIcon, FacebookIcon, GoogleIcon, MetaMaskIcon, TwitchIcon, TwitterIcon } from "../assets"
import { DiscordLogin } from "../components/discordLogin"
import { FacebookLogin } from "../components/facebookLogin"
import { ImageUpload } from "../components/form/imageUpload"
import { InputField } from "../components/form/inputField"
import { Navbar } from "../components/home/navbar"
import { Loading } from "../components/loading"
import { TwitchLogin } from "../components/twitchLogin"
import { TwitterLogin } from "../components/twitterLogin"
import { AuthContainer } from "../containers"
import { useAuth } from "../containers/auth"
import { useWebsocket } from "../containers/socket"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { fetching } from "../fetching"
import HubKey from "../keys"
import { Organisation, Role } from "../types/types"
import { PasswordRequirement } from "./auth/onboarding"

export const ProfilePage: React.FC = () => {
	const history = useHistory()
	const { user } = AuthContainer.useContainer()

	useEffect(() => {
		if (user) return

		const userTimeout = setTimeout(() => {
			history.push("/login")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (!user) {
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
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
			<Switch>
				<Route exact path="/profile" component={ProfileDetails} />
				<Route path="/profile/edit" component={ProfileEdit} />
			</Switch>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					width: "100%",
					maxWidth: "600px",
					margin: "0 auto",
					marginTop: "auto",
					padding: "0 3rem",
					paddingBottom: "1rem",
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
	)
}

const ProfileDetails: React.FC = () => {
	const history = useHistory()
	const { user } = AuthContainer.useContainer()
	const token = localStorage.getItem("token")

	if (!user) return <Loading />

	return (
		<>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					padding: "0 3rem",
					height: "100%",
				}}
			>
				<Box
					sx={{
						position: "relative",
						width: "fit-content",
						marginBottom: "3rem",
					}}
				>
					<Box
						sx={(theme) => ({
							zIndex: -1,
							position: "absolute",
							top: "1rem",
							left: "1rem",
							display: "block",
							width: "100%",
							height: "100%",
							borderRadius: "50%",
							border: `2px solid ${theme.palette.secondary.main}`,
						})}
					/>
					<EditableAvatar
						avatar={user.avatarID ? `/api/files/${user.avatarID}?token=${encodeURIComponent(token || "")}` : undefined}
						onClick={() => history.push("/profile/edit#profile")}
					/>
				</Box>
				<Button
					onClick={() => history.push("/profile/edit#profile")}
					variant="text"
					sx={{
						marginBottom: "2rem",
					}}
					endIcon={
						<EditIcon
							sx={{
								marginBottom: ".3rem",
							}}
						/>
					}
				>
					<Typography variant="h2" component="p">
						{user.username}
					</Typography>
				</Button>
				<Typography
					variant="h2"
					sx={(theme) => ({
						marginBottom: "2rem",
						color: theme.palette.primary.main,
						textTransform: "uppercase",
					})}
				>
					Connected Apps
				</Typography>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: "repeat(4, 250px)",
						gap: "4rem",
						marginBottom: "2rem",
						"@media (max-width: 1300px)": {
							gridTemplateColumns: "repeat(4, 200px)",
						},
						"@media (max-width: 1100px)": {
							gridTemplateColumns: "repeat(2, 200px)",
						},
						"@media (max-width: 800px)": {
							gap: "2rem",
						},
						"@media (max-width: 600px)": {
							width: "100%",
							gridTemplateColumns: "repeat(1, 1fr)",
						},
					}}
				>
					<ConnectedAppCard type="metamask" label={user.publicAddress || "Not Connected"} isConnected={!!user.publicAddress} />
					<ConnectedAppCard type="facebook" label={user.facebookID || "Not Connected"} isConnected={!!user.facebookID} />
					<ConnectedAppCard type="google" label={user.googleID || "Not Connected"} isConnected={!!user.googleID} />
					<ConnectedAppCard type="twitch" label={user.twitchID || "Not Connected"} isConnected={!!user.twitchID} />
					<ConnectedAppCard type="twitter" label={user.twitterID || "Not Connected"} isConnected={!!user.twitterID} />
					<ConnectedAppCard type="discord" label={user.discordID || "Not Connected"} isConnected={!!user.discordID} />
				</Box>
			</Box>
		</>
	)
}

interface UserInput {
	email?: string
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
	const { metaMaskState, sign, account, connect } = useWeb3()
	const { user, addFacebook, addGoogle, addTwitch, addTwitter, addDiscord, removeFacebook, removeGoogle, removeTwitch, removeTwitter, removeDiscord } =
		useAuth()
	const token = localStorage.getItem("token")
	const { send } = useWebsocket()

	// Setup form
	const { control, handleSubmit, reset, watch, formState } = useForm<UserInput>()
	const { isDirty } = formState
	const password = watch("newPassword")

	const { mutate: upload } = useMutation(fetching.mutation.fileUpload)
	const [submitting, setSubmitting] = useState(false)
	const [successMessage, setSuccessMessage] = useState<string>()
	const [errorMessage, setErrorMessage] = useState<string>()
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
						setErrorMessage("Failed to upload image, please try again.")
						setSubmitting(false)
						return
					}
					avatarID = r.payload.id
				} else {
					// Remove avatar
					avatarID = undefined
				}
			}

			const { newPassword, ...input } = data
			const payload = {
				...input,
				newPassword: changePassword ? newPassword : undefined,
				avatarID,
			}

			const resp = await send<User>(HubKey.UserUpdate, {
				id: user.id,
				...payload,
			})

			if (resp) {
				setSuccessMessage("Profile successfully updated.")
			}
			setErrorMessage(undefined)
			setChangePassword(false)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
			setSuccessMessage(undefined)
		} finally {
			setSubmitting(false)
		}
	})

	const addNewWallet = useCallback(async () => {
		if (!user || !account) return
		try {
			setSubmitting(true)
			const sig = await sign(user.id)
			await send(HubKey.UserAddWallet, { id: user.id, signature: sig, publicAddress: account })
			setErrorMessage(undefined)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setSubmitting(false)
		}
	}, [account, send, sign, user])

	const removeWalletAddress = useCallback(async () => {
		if (!user) return
		try {
			setSubmitting(true)
			await send(HubKey.UserRemoveWallet, { id: user.id })
			setErrorMessage(undefined)
		} catch (e) {
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setSubmitting(false)
		}
	}, [user, send])

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
		<>
			<Snackbar
				open={!!successMessage}
				autoHideDuration={6000}
				onClose={(_, reason) => {
					if (reason === "clickaway") {
						return
					}

					setSuccessMessage(undefined)
				}}
			>
				<Alert severity="success">{successMessage}</Alert>
			</Snackbar>
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
				component="form"
				onSubmit={onSaveForm}
				sx={{
					display: "flex",
					flexDirection: "column",
					width: "100%",
					maxWidth: "800px",
					margin: "0 auto",
					padding: "3rem",
					"& > *:not(:last-child)": {
						marginBottom: "1rem",
					},
				}}
			>
				<Box
					sx={{
						marginBottom: "1rem",
					}}
				>
					<Link component={RouterLink} to="/profile">
						Back to Profile
					</Link>
				</Box>
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
					<Box
						sx={{
							display: "flex",
							"& > *:not(:last-child)": {
								marginRight: "1rem",
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
					width: "100%",
					maxWidth: "800px",
					margin: "0 auto",
					padding: "3rem",
					"& > *:not(:last-child)": {
						marginBottom: "1rem",
					},
				}}
			>
				<Typography id="connections" variant="h1" component="h2">
					Manage Connections
				</Typography>

				<Section>
					<Typography variant="subtitle1">Metamask</Typography>
					{!!user.publicAddress ? (
						<>
							<TextField label="Wallet Public Address" value={user.publicAddress} disabled multiline />
							<Button
								onClick={async () => {
									// if wallet exists, remove it
									await removeWalletAddress()
								}}
								variant="contained"
								color="error"
							>
								Remove Wallet
							</Button>
						</>
					) : (
						<Button
							onClick={async () => {
								// if metamask not logged in do nothing
								if (metaMaskState === MetaMaskState.NotLoggedIn) {
									await connect()
									return
								}
								// if metamask not installed tell take to install page
								if (metaMaskState === MetaMaskState.NotInstalled) {
									const onboarding = new MetaMaskOnboarding()
									onboarding.startOnboarding()
									return
								}
								// if metamask logged in add wallet
								if (metaMaskState === MetaMaskState.Active) {
									await addNewWallet()
									return
								}
							}}
							title={
								metaMaskState === MetaMaskState.Active
									? "Connect Wallet to account"
									: metaMaskState === MetaMaskState.NotLoggedIn
									? "Connect and sign in to MetaMask to continue"
									: "Install MetaMask"
							}
							startIcon={<MetaMaskIcon />}
							variant="contained"
							fullWidth
						>
							{metaMaskState === MetaMaskState.NotLoggedIn
								? "Connect and sign in to MetaMask to continue"
								: metaMaskState === MetaMaskState.NotInstalled
								? "Install MetaMask"
								: "Connect Wallet to account"}
						</Button>
					)}
				</Section>

				<Section>
					<Typography variant="subtitle1">Google</Typography>
					{!!user.googleID ? (
						<>
							<TextField label="Google ID" value={user.googleID} disabled multiline />
							<Button
								onClick={async () => {
									try {
										await removeGoogle(user.id, user.username)
									} catch (e) {
										setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
									}
								}}
								variant="contained"
								color="error"
							>
								Remove Google
							</Button>
						</>
					) : (
						<GoogleLogin
							clientId="467953368642-8cobg822tej2i50ncfg4ge1pm4c5v033.apps.googleusercontent.com"
							buttonText="Login"
							onSuccess={async (response) => {
								try {
									if (!!response.code) {
										setErrorMessage(`Couldn't connect to Google: ${response.code}`)
										return
									}
									setErrorMessage(undefined)
									const r = response as GoogleLoginResponse
									await addGoogle(r.tokenId)
								} catch (e) {
									setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
								}
							}}
							onFailure={(error) => {
								setErrorMessage(error.message)
							}}
							cookiePolicy={"single_host_origin"}
							render={(props) => (
								<Button onClick={props.onClick} disabled={props.disabled} startIcon={<GoogleIcon />} variant="contained">
									Connect Google to account
								</Button>
							)}
						/>
					)}
				</Section>

				<Section>
					<Typography variant="subtitle1">Facebook</Typography>
					{!!user.facebookID ? (
						<>
							<TextField label="Facebook ID" value={user.facebookID} disabled multiline />
							<Button
								onClick={async () => {
									try {
										await removeFacebook(user.id, user.username)
									} catch (e) {
										setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
									}
								}}
								variant="contained"
								color="error"
							>
								Remove Facebook
							</Button>
						</>
					) : (
						<FacebookLogin
							callback={async (response: any) => {
								try {
									setErrorMessage(undefined)

									if (!!response && !!response.status) {
										setErrorMessage(`Couldn't connect to Facebook: ${response.status}`)
										return
									}
									await addFacebook(response.accessToken)
								} catch (e) {
									setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
								}
							}}
							onFailure={(error) => {
								setErrorMessage(error.status || "Failed to connect account to Facebook.")
							}}
							render={(props) => (
								<LoadingButton
									onClick={async (event) => {
										props.onClick(event)
									}}
									loading={!props.isSdkLoaded || props.isProcessing}
									startIcon={<FacebookIcon />}
									variant="contained"
								>
									Connect Facebook to account
								</LoadingButton>
							)}
						/>
					)}
				</Section>

				<Section>
					<Typography variant="subtitle1">Twitch</Typography>
					{!!user.twitchID ? (
						<>
							<TextField label="Twitch ID" value={user.twitchID} disabled multiline />
							<Button
								onClick={async () => {
									try {
										await removeTwitch(user.id, user.username)
									} catch (e) {
										setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
									}
								}}
								variant="contained"
								color="error"
							>
								Remove Twitch
							</Button>
						</>
					) : (
						<TwitchLogin
							callback={async (response) => {
								try {
									setErrorMessage(undefined)
									await addTwitch(response.token)
								} catch (e) {
									setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again")
								}
							}}
							onFailure={(error) => {
								setErrorMessage(error.status || "Failed to connect account to Twitch.")
							}}
							render={(props) => (
								<LoadingButton
									onClick={async (event) => {
										props.onClick(event)
									}}
									loading={props.isProcessing}
									startIcon={<TwitchIcon />}
									variant="contained"
								>
									Connect Twitch to account
								</LoadingButton>
							)}
						/>
					)}
				</Section>

				<Section>
					<Typography variant="subtitle1">Twitter</Typography>
					{!!user.twitterID ? (
						<>
							<TextField label="Twitter ID" value={user.twitterID} disabled multiline />
							<Button
								onClick={async () => {
									try {
										await removeTwitter(user.id, user.username)
									} catch (e) {
										setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
									}
								}}
								variant="contained"
								color="error"
							>
								Remove Twitter
							</Button>
						</>
					) : (
						<TwitterLogin
							callback={async (response) => {
								try {
									setErrorMessage(undefined)
									await addTwitter(response.token, response.verifier)
								} catch (e) {
									setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again")
								}
							}}
							onFailure={(error) => {
								setErrorMessage(error.status || "Failed to connect account to Twitter.")
							}}
							render={(props) => (
								<LoadingButton
									onClick={async (event) => {
										props.onClick(event)
									}}
									loading={props.isProcessing}
									startIcon={<TwitterIcon />}
									variant="contained"
								>
									Connect Twitter to account
								</LoadingButton>
							)}
						/>
					)}
				</Section>

				<Section>
					<Typography variant="subtitle1">Discord</Typography>
					{!!user.discordID ? (
						<>
							<TextField label="Discord ID" value={user.discordID} disabled multiline />
							<Button
								onClick={async () => {
									try {
										await removeDiscord(user.id, user.username)
									} catch (e) {
										setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
									}
								}}
								variant="contained"
								color="error"
							>
								Remove Discord
							</Button>
						</>
					) : (
						<DiscordLogin
							callback={async (response) => {
								try {
									setErrorMessage(undefined)
									await addDiscord(response.code)
								} catch (e) {
									setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again")
								}
							}}
							onFailure={(error) => {
								setErrorMessage(error.status || "Failed to connect account to Discord.")
							}}
							render={(props) => (
								<LoadingButton
									onClick={async (event) => {
										props.onClick(event)
									}}
									loading={props.isProcessing}
									startIcon={<DiscordIcon />}
									variant="contained"
								>
									Connect Discord to account
								</LoadingButton>
							)}
						/>
					)}
				</Section>
			</Box>
		</>
	)
}

const Section = styled("div")({
	display: "flex",
	flexDirection: "column",
	"& > *:not(:last-child)": {
		marginBottom: ".5rem",
	},
})

interface EditableAvatarProps extends Omit<IconButtonProps, "children"> {
	avatar?: string
}

const EditableAvatar: React.FC<EditableAvatarProps> = ({ avatar, sx, onClick, onMouseLeave, onFocus, onBlur, ...props }) => {
	const [isFocused, setIsFocused] = useState(false)

	return (
		<IconButton
			onClick={(e) => {
				if (onClick) onClick(e)
				setIsFocused((prevIsFocused) => !prevIsFocused)
			}}
			onMouseLeave={(e) => {
				if (onMouseLeave) onMouseLeave(e)
				setIsFocused(false)
			}}
			onFocus={(e) => {
				if (onFocus) onFocus(e)
				setIsFocused(true)
			}}
			onBlur={(e) => {
				if (onBlur) onBlur(e)
				setIsFocused(false)
			}}
			sx={{
				overflow: "hidden",
				position: "relative",
				width: "8rem",
				height: "8rem",
				padding: 0,
				borderRadius: "50%",
				...sx,
			}}
			{...props}
		>
			<Avatar
				sx={{
					width: "100%",
					height: "100%",
				}}
				src={avatar}
				alt="Avatar Image"
			/>
			<Box
				sx={(theme) => ({
					zIndex: 1,
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "rgba(0, 0, 0, .6)",
					color: theme.palette.text.primary,
					opacity: isFocused ? 1 : 0,
					transition: "opacity .3s ease-in",
					"&:hover": {
						opacity: 1,
					},
				})}
			>
				<EditIcon />
			</Box>
		</IconButton>
	)
}

type ConnectionType = "email" | "metamask" | "google" | "facebook" | "twitch" | "twitter" | "discord"

interface ConnectedAppCardProps extends BoxProps {
	type: ConnectionType
	label: string
	isConnected?: boolean
}

const ConnectedAppCard: React.FC<ConnectedAppCardProps> = ({ type, label, isConnected }) => {
	const history = useHistory()
	const [isFocused, setIsFocused] = useState(false)
	let connectionIcon: React.ReactNode = null

	switch (type) {
		case "metamask":
			connectionIcon = <MetaMaskIcon />
			break
		case "facebook":
			connectionIcon = <FacebookIcon />
			break
		case "google":
			connectionIcon = <GoogleIcon />
			break
		case "twitch":
			connectionIcon = <TwitchIcon />
			break
		case "twitter":
			connectionIcon = <TwitterIcon />
			break
		case "discord":
			connectionIcon = <DiscordIcon />
			break
	}

	return (
		<Box
			sx={(theme) => ({
				position: "relative",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				padding: "2rem",
				border: `2px solid ${theme.palette.secondary.main}`,
				cursor: "pointer",
			})}
		>
			<Box
				sx={{
					zIndex: 1,
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					opacity: isFocused ? 1 : 0,
					backgroundColor: "rgba(0, 0, 0, .8)",
					transition: "opacity .3s ease-in",
					"&:hover": {
						opacity: 1,
					},
				}}
			>
				<Button
					variant="text"
					onClick={() => {
						setIsFocused((prevIsFocused) => !prevIsFocused)
						history.push("/profile/edit#connections")
					}}
					onMouseLeave={() => setIsFocused(false)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					sx={{
						height: "100%",
						width: "100%",
						borderRadius: 0,
					}}
				>
					{isConnected ? "Manage" : "Connect"}
				</Button>
			</Box>
			<Box
				sx={{
					width: "5rem",
					marginBottom: "1rem",
					filter: isConnected ? "none" : "grayscale(1)",
					"& svg": {
						width: "100%",
						height: "auto",
					},
				}}
			>
				{connectionIcon}
			</Box>
			<Typography
				variant="subtitle1"
				sx={{
					width: "100%",
					maxWidth: "180px",
					overflow: "hidden",
					whiteSpace: "nowrap",
					textOverflow: "ellipsis",
					textAlign: "center",
				}}
			>
				{label}
			</Typography>
		</Box>
	)
}
