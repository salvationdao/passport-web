import { Alert, Box, Button, Typography } from "@mui/material"
import { useState } from "react"
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login"
import { Link, Redirect } from "react-router-dom"
import { ReactComponent as FacebookIcon } from "../assets/images/icons/facebook.svg"
import { ReactComponent as GoogleIcon } from "../assets/images/icons/google.svg"
import XSYNLogoImage from "../assets/images/XSYN Stack White.svg"
import { FacebookLogin, ReactFacebookFailureResponse, ReactFacebookLoginInfo } from "../components/facebookLogin"
import { LoginMetaMask } from "../components/loginMetaMask"
import { AuthContainer, useAuth } from "../containers/auth"


export const LoginPage: React.FC = () => {
    const { user } = useAuth()
    const { loginGoogle, loginFacebook } = AuthContainer.useContainer()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

    if (user) return <Redirect push to="/" />

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
                <Box
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
                    <Button variant="contained" sx={(theme) => ({
                        backgroundColor: theme.palette.neutral.main
                    })}>
                        Email Login
                    </Button>
                    {errorMessage && (
                        <Alert severity="error">
                            {errorMessage}
                        </Alert>
                    )}
                </Box>
            </Box>
        </Box>
    )
}