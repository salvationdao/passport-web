import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MetaMaskOnboarding from "@metamask/onboarding";
import EditIcon from '@mui/icons-material/Edit';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Alert, Avatar, Box, BoxProps, Button, IconButton, IconButtonProps, Link, styled, Typography } from "@mui/material";
import { User } from '@sentry/react';
import { useCallback, useEffect, useState } from 'react';
import { useMutation } from 'react-fetching-library';
import { useForm } from 'react-hook-form';
import { Route, Switch, useHistory } from 'react-router-dom';
import FacebookLogo from "../assets/images/icons/facebook.svg";
import { ReactComponent as MetaMaskIcon } from "../assets/images/icons/metamask.svg";
import { ImageUpload } from '../components/form/imageUpload';
import { InputField } from '../components/form/inputField';
import { Navbar } from "../components/home/navbar";
import { Loading } from '../components/loading';
import { Spaced } from '../components/spaced';
import { AuthContainer } from '../containers';
import { useWebsocket } from '../containers/socket';
import { MetaMaskState, useWeb3 } from '../containers/web3';
import { fetching } from '../fetching';
import HubKey from '../keys';
import { Organisation, Role } from '../types/types';

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
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
        }}>
            <Navbar />
            <Switch>
                <Route exact path="/profile" component={ProfileDetails} />
                <Route path="/profile/edit" component={ProfileEdit} />
            </Switch>
            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "600px",
                margin: "0 auto",
                marginTop: "auto",
                padding: "0 3rem",
                paddingBottom: "1rem",
            }}>
                <Link href="/privacy-policy" underline="none" color="white">Privacy Policy</Link>
                <Link href="/terms-and-conditions" underline="none" color="white">Terms And Conditions</Link>
            </Box>
        </Box>
    )
}

const ProfileDetails: React.FC = () => {
    const history = useHistory()

    return (
        <><Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 3rem",
            height: "100%",
        }}>
            <Box sx={{
                position: "relative",
                width: "fit-content",
                marginBottom: "3rem",
            }}>
                <Box sx={(theme) => ({
                    zIndex: -1,
                    position: "absolute",
                    top: "1rem",
                    left: "1rem",
                    display: "block",
                    width: "100%",
                    height: '100%',
                    borderRadius: "50%",
                    border: `2px solid ${theme.palette.secondary.main}`,
                })} />
                <EditableAvatar onClick={() => history.push("/profile/edit")} />
            </Box>
            <Typography variant="h2" component="h1" sx={{
                marginBottom: "2rem"
            }}>Ash Thomas</Typography>
            <Typography variant="h2" sx={(theme) => ({
                marginBottom: "2rem",
                color: theme.palette.primary.main,
                textTransform: "uppercase"
            })}>
                Connected Apps
            </Typography>
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "4rem",
                width: "100%",
                maxWidth: "1000px",
                marginBottom: "2rem",
                "@media (max-width: 800px)": {
                    gap: "2rem"
                },
                "@media (max-width: 600px)": {
                    gridTemplateColumns: "repeat(2, 1fr)"
                },
            }}>
                <ConnectedAppCard />
                <ConnectedAppCard />
                <ConnectedAppCard />
            </Box>
        </Box>
            <Box sx={{
                flex: 1
            }} />
            <Box sx={{
                display: "flex",
                alignItems: "center",
                margin: "0 auto",
                marginBottom: "1rem",
                "& > *:not(:last-child)": {
                    marginRight: "1rem",
                }
            }}><Typography>Connect these apps</Typography>
                <IconButton color="inherit" >
                    <YouTubeIcon />
                </IconButton>
                <IconButton color="inherit" >
                    <YouTubeIcon />
                </IconButton>
                <IconButton color="inherit" >
                    <YouTubeIcon />
                </IconButton>
            </Box></>
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
    const history = useHistory()
    const { metaMaskState, sign, account, connect } = useWeb3()
    const { user } = AuthContainer.useContainer()
    const token = localStorage.getItem("token")
    const { send } = useWebsocket()

    // Setup form
    const { control, handleSubmit, reset, formState } = useForm<UserInput>()
    const { isDirty } = formState
    const { mutate: upload } = useMutation(fetching.mutation.fileUpload)
    const [submitting, setSubmitting] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string>()
    const [errorMessage, setErrorMessage] = useState<string>()
    const [changePassword, setChangePassword] = useState(false)

    const [avatar, setAvatar] = useState<File>()
    const [avatarChanged, setAvatarChanged] = useState(false)

    useEffect(() => {
        console.log(isDirty)
    }, [isDirty])

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
                id: user.id, ...payload
            })

            if (resp) {
                setSuccessMessage("Profile successfully updated.")
                history.replace(`/profile`)
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
            newPassword: ""
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
                    marginBottom: "1rem"
                },
            }}
        >
            <Typography variant="h1" gutterBottom>
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
                        alignSelf: "center",
                        "& .MuiAvatar-root": {
                            width: "180px",
                            height: "180px",
                        },
                    }}
                />
            </Section>

            <Section>
                <Typography variant="subtitle1">User Details</Typography>
                <Box sx={{
                    display: "flex",
                    "& > *:not(:last-child)": {
                        marginRight: "1rem"
                    }
                }}>
                    <InputField label="First Name" name="firstName" control={control} disabled={submitting} fullWidth />
                    <InputField label="Last Name" name="lastName" control={control} disabled={submitting} fullWidth />
                </Box>
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
                        />
                        <Button type="button" variant="contained" onClick={() => setChangePassword(false)}>
                            Cancel Password Change
                        </Button>
                    </>
                )}
            </Section>

            <Section>
                <Typography variant="subtitle1">Connections</Typography>
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
                            if (user.publicAddress && user.publicAddress !== "") {
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
            </Section>

            <Spaced alignRight height="60px">
                <Button variant="contained" color="primary" onClick={onSaveForm} disabled={(!isDirty && !avatarChanged) || submitting} startIcon={<FontAwesomeIcon icon={["fas", "save"]} />}>
                    Save
                </Button>
                <Button variant="contained" onClick={() => history.push("/profile")} disabled={submitting}>
                    Cancel
                </Button>
            </Spaced>
            {!!successMessage && <Alert severity="success">{successMessage}</Alert>}
            {!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </Box>
    )
}

const Section = styled("div")({
    display: "flex",
    flexDirection: "column",
    "& > *:not(:last-child)": {
        marginBottom: ".5rem"
    }
})

interface EditableAvatarProps extends Omit<IconButtonProps, "children"> {

}

const EditableAvatar: React.FC<EditableAvatarProps> = ({ sx, onClick, onMouseLeave, onFocus, onBlur, ...props }) => {
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
            }} {...props}>
            <Avatar sx={{
                width: "100%",
                height: "100%",
            }} alt="Avatar Image" />
            <Box sx={(theme) => ({
                zIndex: 1,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: "rgba(0, 0, 0, .6)",
                color: theme.palette.text.primary,
                opacity: isFocused ? 1 : 0,
                transition: "opacity .3s ease-in",
                "&:hover": {
                    opacity: 1
                },
            })}>
                <EditIcon />
            </Box>
        </IconButton>
    )
}

interface ConnectedAppCardProps extends BoxProps {

}

const ConnectedAppCard: React.FC<ConnectedAppCardProps> = () => {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <Box sx={(theme) => ({
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "2rem",
            border: `2px solid ${theme.palette.secondary.main}`,
            cursor: "pointer"
        })}>
            <Box
                onClick={() => setIsFocused((prevIsFocused) => !prevIsFocused)}
                onMouseLeave={() => setIsFocused(false)}
                sx={{
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
                        opacity: 1
                    },
                }}>
                <Button onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)}>
                    Manage
                </Button>
            </Box>
            <Box component="img" src={FacebookLogo} alt="Facebook Logo" sx={{
                width: "5rem",
                marginBottom: "1rem",
            }} />
            Ash Aaron Thomas
        </Box>
    )
}