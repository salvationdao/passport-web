import { useCallback, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { Organisation, Role, User } from "../../../types/types"
import { useForm } from "react-hook-form"
import { ItemInputSelect } from "../../../components/form/ItemInputSelect"
import { Alert, Box, Button, Paper, Typography } from "@mui/material"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { InputField } from "../../../components/form/inputField"
import { Spaced } from "../../../components/spaced"
import { fetching } from "../../../fetching"
import { useMutation } from "react-fetching-library"
import { AuthContainer } from "../../../containers"
import { ImageUpload } from "../../../components/form/imageUpload"
import HubKey from "../../../keys"
import { useWebsocket } from "../../../containers/socket"
import MetaMaskOnboarding from "@metamask/onboarding"
import { ReactComponent as MetaMaskIcon } from "../../../assets/images/icons/metamask.svg"
import { MetaMaskState, useWeb3 } from "../../../containers/web3"

interface UserEditProps {
	user?: User
	isNew?: boolean
	stopEditMode?: () => void
	onUpdate?: (user: User) => void
}

interface UserInput {
	email?: string
	firstName?: string
	lastName?: string
	newPassword?: string
	/** Required if changing own password or email */
	currentPassword?: string
	avatarID?: string
	roleID?: string
	organisationID?: string
	publicAddress?: string

	organisation: Organisation
	role: Role
	twoFactorAuthenticationActivated: boolean
}

export const UserEdit = (props: UserEditProps) => {
	const { metaMaskState, sign, account, connect } = useWeb3()
	const { user, isNew, stopEditMode } = props
	const { user: me } = AuthContainer.useContainer()
	const isSelf = !!user && !!me && user.id === me.id
	const token = localStorage.getItem("token")
	const { send } = useWebsocket()
	const { replace } = useHistory()

	// Setup form
	const { control, handleSubmit, reset, watch } = useForm<UserInput>()
	const email = watch("email")
	const { mutate: upload } = useMutation(fetching.mutation.fileUpload)
	const [submitting, setSubmitting] = useState(false)
	const [successMessage, setSuccessMessage] = useState<string>()
	const [errorMessage, setErrorMessage] = useState<string>()
	const [changePassword, setChangePassword] = useState(isNew)

	const [avatar, setAvatar] = useState<File>()
	const [avatarChanged, setAvatarChanged] = useState(false)

	const onSaveForm = handleSubmit(async (data) => {
		setSubmitting(true)

		try {
			let avatarID = user?.avatarID
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

			const { role, organisation, newPassword, ...input } = data

			const payload = {
				...input,
				newPassword: changePassword ? newPassword : undefined,
				roleID: !!role ? role.id : undefined,
				organisationID: !!organisation ? organisation.id : undefined,
				avatarID,
			}

			const resp = await send<User>(isNew ? HubKey.UserCreate : HubKey.UserUpdate, user !== undefined ? { id: user.id, ...payload } : payload)
			if (resp) {
				setSuccessMessage(`User has been ${isNew ? "created" : "updated"}.`)
				if (isSelf) {
					setErrorMessage(undefined)
					return
				}
				if (isNew) {
					replace(`/users/${resp.username}`)
				} else {
					replace(`/users/${resp.username}?edit=true`)
				}
			}
			setErrorMessage(undefined)
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
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			organisation: user.organisation,
			roleID: user.roleID,
			organisationID: user.organisation?.id,
			publicAddress: user.publicAddress || "",
			twoFactorAuthenticationActivated: user.twoFactorAuthenticationActivated,
		})

		// Get avatar as file
		if (!!user.avatarID)
			fetch(`/api/files/${user.avatarID}?token=${encodeURIComponent(token || "")}`).then((r) =>
				r.blob().then((b) => setAvatar(new File([b], "avatar.jpg", { type: b.type }))),
			)
	}, [user, reset, token])

	return (
		<Paper
			component="form"
			onSubmit={onSaveForm}
			sx={{
				maxWidth: "800px",
				margin: "0 auto",
				padding: 2,
				pb: 0,
				display: "flex",
				flexDirection: "column",
				"& .MuiFormControl-root": {
					marginBottom: "0.5rem",
				},
			}}
		>
			<Typography variant="h2" color="primary" gutterBottom>
				{`${isNew ? "Create" : "Edit"} User`}
			</Typography>

			<InputField
				name="email"
				label="Email"
				type="email"
				control={control}
				rules={{
					pattern: {
						value: /.+@.+\..+/,
						message: "Invalid email address",
					},
				}}
				disabled={submitting}
			/>

			<InputField label="First Name" name="firstName" control={control} disabled={submitting} />

			<InputField label="Last Name" name="lastName" control={control} disabled={submitting} />

			<InputField label="Wallet Public Address" name="publicAddress" control={control} disabled={true} />
			<Box
				sx={{
					margin: "0 auto",
					display: "flex",
				}}
			>
				<Button
					onClick={async () => {
						// if wallet exists, remove it
						if (user?.publicAddress && user?.publicAddress !== "") {
							await removeWalletAddress()
							return
						}
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
				>
					{user?.publicAddress && user?.publicAddress !== ""
						? "Remove Wallet"
						: metaMaskState === MetaMaskState.NotLoggedIn
						? "Connect and sign in to MetaMask to continue"
						: metaMaskState === MetaMaskState.NotInstalled
						? "Install MetaMask"
						: "Connect Wallet to account"}
				</Button>
			</Box>

			<div>
				<Typography variant="subtitle1">Avatar</Typography>

				<ImageUpload
					label="Upload Avatar"
					file={avatar}
					onChange={onAvatarChange}
					avatarPreview
					sx={{
						"& .MuiAvatar-root": {
							width: "180px",
							height: "180px",
						},
					}}
				/>
			</div>

			{!isSelf && <ItemInputSelect label="Role" name="role" control={control} disabled={submitting} renderItem={(value) => value.name} />}

			<ItemInputSelect label="Organisation" name="organisation" control={control} disabled={isSelf || submitting} renderItem={(value) => value.name} />

			{/*
				commented out by vinnie 05/01/21
				TODO: 2fa at this point in time is broken, will be fixed
				*/}
			{/*{isSelf && (*/}
			{/*	<FormControlLabel*/}
			{/*		sx={{*/}
			{/*			width: "fit-content",*/}
			{/*			marginLeft: 0,*/}
			{/*		}}*/}
			{/*		control={*/}
			{/*			<Controller*/}
			{/*				control={control as Control<any, object>}*/}
			{/*				name="twoFactorAuthenticationActivated"*/}
			{/*				defaultValue={user?.twoFactorAuthenticationActivated}*/}
			{/*				render={({ field, fieldState }) => {*/}
			{/*					return <Switch onChange={field.onChange} inputRef={field.ref} checked={field.value} />*/}
			{/*				}}*/}
			{/*			/>*/}
			{/*		}*/}
			{/*		label={<Typography variant="subtitle1">Two-Factor Authentication</Typography>}*/}
			{/*		labelPlacement="start"*/}
			{/*	/>*/}
			{/*)}*/}

			<Typography variant="subtitle1">Password</Typography>

			{isSelf && (changePassword || email !== user.email) && (
				<InputField
					disabled={submitting}
					control={control}
					name="currentPassword"
					// rules={{ required: "Please enter current password." }}
					type="password"
					placeholder="Enter current password"
					hiddenLabel
				/>
			)}

			{!changePassword && (
				<Button type="button" variant="contained" onClick={() => setChangePassword(true)} sx={{ maxWidth: "408px", height: "40.5px" }}>
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
						InputProps={{
							endAdornment:
								!isNew && !isSelf ? (
									<Button type="button" onClick={() => setChangePassword(false)}>
										Cancel
									</Button>
								) : undefined,
						}}
						hiddenLabel
					/>
					{isSelf && (
						<Button type="button" variant="contained" onClick={() => setChangePassword(false)}>
							Cancel Password Change
						</Button>
					)}
				</>
			)}

			<Spaced alignRight height="60px">
				<Button variant="contained" color="primary" onClick={onSaveForm} disabled={submitting} startIcon={<FontAwesomeIcon icon={["fas", "save"]} />}>
					Save
				</Button>
				{!!stopEditMode && (
					<Button variant="contained" onClick={stopEditMode} disabled={submitting}>
						Cancel
					</Button>
				)}

				<div>
					{!!successMessage && <Alert severity="success">{successMessage}</Alert>}
					{!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}
				</div>
			</Spaced>
		</Paper>
	)
}
