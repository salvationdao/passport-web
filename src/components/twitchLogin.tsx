import { useCallback, useEffect, useMemo, useState } from "react"

const getParamsFromObject = (params: any) =>
    "?" +
    Object.keys(params)
        .map((param) => `${param}=${window.encodeURIComponent(params[param])}`)
        .join("&")

const getIsMobile = () => {
    let isMobile = false

    try {
        isMobile = !!(
            (window.navigator && (window.navigator as any).standalone === true) ||
            window.matchMedia("(display-mode: standalone)").matches ||
            navigator.userAgent.match("CriOS") ||
            navigator.userAgent.match(/mobile/i)
        )
    } catch (ex) {
        // continue regardless of error
    }

    return isMobile
}

export interface ReactTwitchFailureResponse {
    status?: string
}

export interface ReactTwitchLoginInfo {
    code: string
}

export interface ReactTwitchLoginState {
    isSdkLoaded?: boolean
    isProcessing?: boolean
}

interface TwitchLoginButtonRenderProps {
    onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    isDisabled: boolean
    isProcessing: boolean
}

interface TwitchLoginProps {
    clientId: string

    callback(userInfo: ReactTwitchLoginInfo | ReactTwitchFailureResponse): void

    onFailure?(response: ReactTwitchFailureResponse): void

    buttonStyle?: React.CSSProperties
    containerStyle?: React.CSSProperties
    cssClass?: string
    icon?: React.ReactNode
    isDisabled?: boolean

    onClick?(event: React.MouseEvent<HTMLDivElement>): void

    redirectUri?: string
    scope?: string
    textButton?: string
    typeButton?: string
    tag?: Node | React.Component<any>
    state?: string
    responseType?: string

    render?: (props: TwitchLoginButtonRenderProps) => JSX.Element
}

export const TwitchLogin: React.FC<TwitchLoginProps> = (props) => {
    const {
        clientId,
        callback,
        onFailure,
        isDisabled,
        scope,
        onClick,
        responseType,
        redirectUri,
        state,
        render,
    } = props
    const [isProcessing, setIsProcessing] = useState(false)
    const [twitchOAuthPopup, setTwitchOAuthPopup] = useState<Window | null>(null)

    const click = useCallback(
        async (e) => {
            if (isProcessing || isDisabled) {
                return
            }

            setIsProcessing(true)
            if (typeof onClick === "function") {
                onClick(e)
                if (e.defaultPrevented) {
                    setIsProcessing(false)
                    return
                }
            }

            const twitchParams = {
                client_id: clientId,
                redirect_uri: redirectUri,
                response_type: responseType,
                state,
                scope,
            }
            const href = `https://id.twitch.tv/oauth2/authorize${getParamsFromObject(twitchParams)}`
            // Opens Twitch login page in a new window
            const width = 500
            const height = 600
            const top = window.screenY + (window.outerHeight - height) / 2.5
            const left = window.screenX + (window.outerWidth - width) / 2
            const popup = window.open(href, "Connect Twitch to XSYN Passport", `width=${width},height=${height},left=${left},top=${top},popup=1`)
            if (!popup) {
                if (onFailure) {
                    onFailure({
                        status: "Failed to open popup window"
                    })
                }
                return
            }
            setTwitchOAuthPopup(popup)
            // if (isMobile && !disableMobileRedirect) {
            //     window.location.href = href
            // } else {
            // }
        },
        [
            isProcessing,
            isDisabled,
            scope,
            onClick,
            responseType,
            redirectUri,
            state,
            clientId,
            onFailure,
        ],
    )

    const propsForRender = useMemo(
        () => ({
            onClick: click,
            isDisabled: !!isDisabled,
            isProcessing,
        }),
        [click, isDisabled, isProcessing],
    )

    useEffect(() => {
        if (!twitchOAuthPopup) return

        const popupCheckTimer = setInterval(() => {
            if (!twitchOAuthPopup) {
                return
            }

            if (twitchOAuthPopup.closed) {
                popupCheckTimer && clearInterval(popupCheckTimer)
                setIsProcessing(false)
                setTwitchOAuthPopup(null)
                if (onFailure) onFailure({ status: "Twitch window has been closed, aborting connection." })
            }

            // Get access token from Twitch
            const currentUrl = twitchOAuthPopup.location.href
            if (!currentUrl) return

            const searchParams = new URL(currentUrl).searchParams
            const code = searchParams.get("code")

            // Return the access token to the callback function
            if (code) {
                twitchOAuthPopup.close()
                setTwitchOAuthPopup(null)
                popupCheckTimer && clearInterval(popupCheckTimer)

                callback({
                    code
                })
                setIsProcessing(false)
            }
        }, 1000)

        return () => clearInterval(popupCheckTimer)
    }, [twitchOAuthPopup, callback, onFailure])

    if (!render) {
        throw new Error("TwitchLogin requires a render prop to render")
    }

    return render(propsForRender)
}

TwitchLogin.defaultProps = {
    redirectUri: typeof window !== "undefined" ? window.location.href : "/",
    scope: "user:read:email",
    onFailure: undefined,
    state: "twitchdirect",
    responseType: "code",
}
