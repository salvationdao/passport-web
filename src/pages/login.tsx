import { Alert, Box, Snackbar, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { useForm } from "react-hook-form"
import { Link, useHistory } from "react-router-dom"
import { ReactComponent as FacebookIcon } from "../assets/images/icons/facebook.svg"
import { ReactComponent as GoogleIcon } from "../assets/images/icons/google.svg"
import { ReactComponent as TwitchIcon } from "../assets/images/icons/twitch.svg"
import XSYNLogoImage from "../assets/images/XSYN Stack White.svg"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "../components/facebookLogin"
import { FancyButton } from "../components/fancyButton"
import { InputField } from "../components/form/inputField"
import { Loading } from "../components/loading"
import { LoginMetaMask } from "../components/loginMetaMask"
import { ReactTwitchFailureResponse, ReactTwitchLoginInfo, TwitchLogin } from "../components/twitchLogin"
import { AuthContainer, useAuth } from "../containers/auth"
import { useWebsocket } from "../containers/socket"
import HubKey from "../keys"
import { colors, fonts } from "../theme"
import { PasswordLoginResponse } from "../types/auth"

interface LogInInput {
    email: string
    password: string
}

export const LoginPage: React.FC = () => {
    const { send } = useWebsocket()
    const { user, setUser } = useAuth()
    const history = useHistory()

    const { loginGoogle, loginFacebook, loginTwitch } = AuthContainer.useContainer()

    const { control, handleSubmit, reset } = useForm<LogInInput>()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [showEmailLogin, setShowEmailLogin] = useState(false)

    const onMetaMaskLoginFailure = (error: string) => {
        setErrorMessage(error)
    }

    // OAuth
    const onGoogleLogin = async (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
        try {
            if (!!response.code) {
                setErrorMessage(`Couldn't connect to Google: ${response.code}`)
                return
            }
            setErrorMessage(null)
            const r = response as GoogleLoginResponse
            await loginGoogle(r.tokenId)
        } catch (e) {
            setErrorMessage(e === "string" ? e : "Something went wrong, please try again.")
        }
    }
    const onGoogleLoginFailure = (error: Error) => {
        setErrorMessage(error.message)
    }

    const onFacebookLogin = async (response: any) => {
        try {
            if (!!response && !!response.status) {
                setErrorMessage(`Couldn't connect to Facebook: ${response.status}`)
                return
            }
            setErrorMessage(null)
            const r = response as ReactFacebookLoginInfo
            await loginFacebook(r.accessToken)
        } catch (e) {
            setErrorMessage(e === "string" ? e : "Something went wrong, please try again.")
        }
    }
    const onFacebookLoginFailure = (error: ReactFacebookFailureResponse) => {
        setErrorMessage(error.status || "Failed to login with Facebook.")
    }

    const onTwitchLogin = async (response: any) => {
        try {
            if (!!response && !!response.status) {
                setErrorMessage(`Couldn't connect to Twitch: ${response.status}`)
                return
            }
            setErrorMessage(null)
            const r = response as ReactTwitchLoginInfo
            await loginTwitch(r.token)
        } catch (e) {
            setErrorMessage(e === "string" ? e : "Something went wrong, please try again.")
        }
    }
    const onTwitchLoginFailure = (error: ReactTwitchFailureResponse) => {
        setErrorMessage(error.status || "Failed to login with Twitch.")
    }

    useEffect(() => {
        if (!user) return

        const userTimeout = setTimeout(() => {
            history.push("/")
        }, 2000)
        return () => clearTimeout(userTimeout)
    }, [user, history])

    if (user) {
        return <Loading text="You are already logged in, redirecting to home page..." />
    }

    return (
        <>
            <Snackbar
                open={!!errorMessage}
                autoHideDuration={6000}
                onClose={(_, reason) => {
                    if (reason === 'clickaway') {
                        return
                    }

                    setErrorMessage(null)
                }}
                message={errorMessage}
            >
                <Alert severity="error">{errorMessage}</Alert>
            </Snackbar>
            <Box
                sx={{
                    overflow: 'hidden',
                    position: "relative",
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    padding: "3rem"
                }}
            >
                <Link to="/"><Box component="img" src={XSYNLogoImage} alt="XSYN Logo" sx={{
                    width: "100px",
                    marginBottom: "1rem"
                }} /></Link>
                <Typography variant="h1" sx={{
                    marginBottom: "1rem",
                    fontFamily: fonts.bizmobold,
                    fontSize: "3rem",
                    textTransform: "uppercase"
                }}>Welcome Back</Typography>
                <Box sx={{
                    width: "100%",
                    maxWidth: "400px"
                }}>
                    {showEmailLogin ? <Box component="form" onSubmit={handleSubmit(async (input) => {
                        try {
                            setLoading(true)
                            setErrorMessage(null)

                            const resp = await send<PasswordLoginResponse>(HubKey.AuthLogin, input)
                            setUser(resp.user)
                            localStorage.setItem("token", resp.token)
                        } catch (e) {
                            setErrorMessage(e === "string" ? e : "Something went wrong, please try again.")
                        } finally {
                            setLoading(false)
                        }
                    })} sx={{
                        "& > *:not(:last-child)": {
                            marginBottom: "1rem"
                        }
                    }}>
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
                        <Box sx={{
                            display: "flex",
                            "& > *:not(:last-child)": {
                                marginRight: ".5rem"
                            }
                        }}>
                            <FancyButton type="button" onClick={() => {
                                reset(undefined, {
                                    keepValues: true
                                })
                                setShowEmailLogin(false)
                            }}>
                                Back
                            </FancyButton>
                            <FancyButton type="submit" color="primary" loading={loading} sx={{
                                flexGrow: 1
                            }}>
                                Log In
                            </FancyButton>
                        </Box>
                    </Box> : <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            "& > *:not(:last-child)": {
                                marginBottom: "1rem"
                            }
                        }}>
                        <LoginMetaMask onFailure={onMetaMaskLoginFailure} />
                        <FacebookLogin
                            appId="577913423867745"
                            fields="email"
                            callback={onFacebookLogin}
                            onFailure={onFacebookLoginFailure}
                            render={(props) => (
                                <FancyButton
                                    borderColor="#3F558C"
                                    onClick={props.onClick}
                                    disabled={props.isDisabled || !props.isSdkLoaded || props.isProcessing}
                                    startIcon={<FacebookIcon />}
                                >
                                    Log in with Facebook
                                </FancyButton>
                            )}
                        />
                        <GoogleLogin
                            clientId="593683501366-gk7ab1nnskc1tft14bk8ebsja1bce24v.apps.googleusercontent.com"
                            buttonText="Login"
                            onSuccess={onGoogleLogin}
                            onFailure={onGoogleLoginFailure}
                            cookiePolicy={"single_host_origin"}
                            render={(props) => (
                                <FancyButton borderColor={colors.white} onClick={props.onClick} disabled={props.disabled} title="Login with Google" startIcon={<GoogleIcon />} >
                                    Log in with Google
                                </FancyButton>
                            )}
                        />
                        <TwitchLogin
                            clientId="1l3xc5yczselbc4yiwdieaw0hr1oap"
                            redirectUri="http://localhost:5003"
                            callback={onTwitchLogin}
                            onFailure={onTwitchLoginFailure}
                            render={(props) => (
                                <FancyButton
                                    borderColor="#8551F6"
                                    onClick={props.onClick}
                                    disabled={props.isDisabled || props.isProcessing}
                                    startIcon={<TwitchIcon />}

                                >
                                    Log in with Twitch
                                </FancyButton>
                            )} />
                        <Box sx={{
                            display: "flex",
                            alignItems: "center",
                        }}>
                            <Box component="span" sx={(theme) => ({
                                minHeight: "1px",
                                width: "100%",
                                marginRight: "1rem",
                                backgroundColor: theme.palette.text.primary,
                            })} />
                            Or
                            <Box component="span" sx={(theme) => ({
                                minHeight: "1px",
                                width: "100%",
                                marginLeft: "1rem",
                                backgroundColor: theme.palette.text.primary,
                            })} />
                        </Box>
                        <FancyButton borderColor={colors.white} filled onClick={() => setShowEmailLogin(true)}>
                            Email Login
                        </FancyButton>
                        <Typography variant="subtitle1" >Don't have an account? <Link to="/onboarding">Sign up here</Link></Typography>
                    </Box>}
                </Box>
            </Box>
        </>
    )
}