import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import MetaMaskOnboarding from "@metamask/onboarding"
import { LoadingButton } from "@mui/lab"
import { Box, Button, Link, styled, TextField, Typography } from "@mui/material"
import { User } from "@sentry/react"
import { useCallback, useEffect, useState } from "react"
import { useMutation } from "react-fetching-library"
import GoogleLogin, { GoogleLoginResponse } from "react-google-login"
import { useForm } from "react-hook-form"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { DiscordIcon, FacebookIcon, GoogleIcon, MetaMaskIcon, TwitchIcon, TwitterIcon } from "../assets"
import { DiscordLogin } from "../components/discordLogin"
import { FacebookLogin } from "../components/facebookLogin"
import { ImageUpload } from "../components/form/imageUpload"
import { InputField } from "../components/form/inputField"
import { Navbar } from "../components/home/navbar"
import { Loading } from "../components/loading"
import { TwitchLogin } from "../components/twitchLogin"
import { TwitterLogin } from "../components/twitterLogin"
import { useAuth } from "../containers/auth"
import { useSnackbar } from "../containers/snackbar"
import { useWebsocket } from "../containers/socket"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { fetching } from "../fetching"
import HubKey from "../keys"
import { Organisation, Role } from "../types/types"
import { PasswordRequirement } from "./auth/onboarding"

export const ProfilePage: React.FC = () => {
	const history = useHistory()
	const { user } = useAuth()

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
			<ProfileEdit />
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

	const addNewWallet = useCallback(async () => {
		if (!user || !account) return
		try {
			setSubmitting(true)
			const sig = await sign(user.id)
			await send(HubKey.UserAddWallet, { id: user.id, signature: sig, publicAddress: account })
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}, [account, send, sign, user, displayMessage])

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
		<>
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
										displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
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
										displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
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
										displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
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
									await addTwitch(response.token)
								} catch (e) {
									displayMessage(typeof e === "string" ? e : "Something went wrong, please try again", "error")
								}
							}}
							onFailure={(error) => {
								displayMessage(error.status || "Failed to connect account to Twitch.", "error")
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
										displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
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
									await addTwitter(response.token, response.verifier)
								} catch (e) {
									displayMessage(typeof e === "string" ? e : "Something went wrong, please try again", "error")
								}
							}}
							onFailure={(error) => {
								displayMessage(error.status || "Failed to connect account to Twitter.", "error")
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
										displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
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
									await addDiscord(response.code)
								} catch (e) {
									displayMessage(typeof e === "string" ? e : "Something went wrong, please try again", "error")
								}
							}}
							onFailure={(error) => {
								displayMessage(error.status || "Failed to connect account to Discord.", "error")
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
