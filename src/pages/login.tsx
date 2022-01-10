import { Alert, Box, Button, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { useForm } from "react-hook-form"
import { Link, useHistory } from "react-router-dom"
import { ReactComponent as FacebookIcon } from "../assets/images/icons/facebook.svg"
import { ReactComponent as GoogleIcon } from "../assets/images/icons/google.svg"
import XSYNLogoImage from "../assets/images/XSYN Stack White.svg"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "../components/facebookLogin"
import { InputField } from "../components/form/inputField"
import { Loading } from "../components/loading"
import { LoginMetaMask } from "../components/loginMetaMask"
import { AuthContainer, useAuth } from "../containers/auth"
import { useWebsocket } from "../containers/socket"
import HubKey from "../keys"
import { PasswordLoginResponse } from "../types/auth"

interface LogInInput {
    email: string
    password: string
}

export const LoginPage: React.FC = () => {
    const { send } = useWebsocket()
    const { user, setUser } = useAuth()
    const history = useHistory()

    const { loginGoogle, loginFacebook } = AuthContainer.useContainer()

    const { control, handleSubmit, watch, trigger, setError } = useForm<LogInInput>()
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

    useEffect(() => {
        if (!user) return
        setTimeout(() => {
            history.push("/")
        }, 2000)
    }, [user])

    if (user) {
        return <Loading text="You are already logged in, redirecting to home page..." />
    }

    return (
        <Box
            sx={{
                overflow: 'hidden',
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <Link to="/"><Box component="img" src={XSYNLogoImage} alt="XSYN Logo" sx={{
                width: "100px",
                marginBottom: "1rem"
            }} /></Link>
            <Box sx={{
                width: "100%",
                maxWidth: "600px"
            }}>
                <Typography variant="h1" sx={{
                    marginBottom: "1rem",
                    fontSize: "2rem"
                }}>Welcome Back</Typography>
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
                        <Button type="button" variant="contained" onClick={() => setShowEmailLogin(false)} sx={(theme) => ({
                            marginLeft: "auto",
                            backgroundColor: theme.palette.neutral.main
                        })}>
                            Back
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={loading}>
                            Log In
                        </Button>
                    </Box>
                    {!!errorMessage && <Alert severity="error">{errorMessage}</Alert>}
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
                            <Button
                                title="Login with Facebook"
                                onClick={props.onClick}
                                disabled={props.isDisabled || !props.isSdkLoaded || props.isProcessing}
                                startIcon={<FacebookIcon />}
                                variant="contained"
                            >
                                Log in with Facebook
                            </Button>
                        )}
                    />
                    <GoogleLogin
                        clientId="593683501366-gk7ab1nnskc1tft14bk8ebsja1bce24v.apps.googleusercontent.com"
                        buttonText="Login"
                        onSuccess={onGoogleLogin}
                        onFailure={onGoogleLoginFailure}
                        cookiePolicy={"single_host_origin"}
                        render={(props) => (
                            <Button onClick={props.onClick} disabled={props.disabled} title="Login with Google" startIcon={<GoogleIcon />} variant="contained">
                                Log in with Google
                            </Button>
                        )}
                    />
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
                    <Button onClick={() => setShowEmailLogin(true)} variant="contained" sx={(theme) => ({
                        backgroundColor: theme.palette.neutral.main
                    })}>
                        Email Login
                    </Button>
                    {errorMessage && (
                        <Alert severity="error">
                            {errorMessage}
                        </Alert>
                    )}
                </Box>}
            </Box>
        </Box>
    )
}