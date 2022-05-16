import { Link, Snackbar, SnackbarOrigin, Typography } from "@mui/material"
import Alert, { AlertColor } from "@mui/material/Alert"
import { useEffect, useRef, useState } from "react"
import useCommands from "../containers/ws/useCommands"

export const MAX_COUNTDOWN_SECONDS = 5
export const MAX_RECONNECT_ATTEMPTS = 3

const Dots: React.FC = ({ children }) => {
	const dir = useRef<boolean>(false)
	const [dots, setDots] = useState<string>("...")

	useEffect(() => {
		const i = window.setInterval(() => {
			setDots((dots) => {
				if (dots === "...") {
					dir.current = false
					return ".."
				}
				if (dots === ".") {
					dir.current = true
					return ".."
				}
				return dir.current ? "..." : ".."
			})
		})
		return () => window.clearInterval(i)
	}, [])

	return (
		<>
			<span>{children}</span>
			<span>{dots}</span>
		</>
	)
}

/**
 * Displays a snack bar if server disconnects and have it reconnect automatically within X seconds.
 */
export const ConnectionLostSnackbar = (props: { app: "admin" | "public" }) => {
	const { state, retryTime } = useCommands()
	const [init, setInit] = useState(true)
	const [lostConnection, setLostConnection] = useState(false)

	useEffect(() => {
		if (state === WebSocket.CLOSED && !lostConnection && !init) {
			setConnecting(false)
			setLostConnection(true)
		} else if (state === WebSocket.OPEN) {
			setConnecting(false)
			setLostConnection(false)
		} else if (state === WebSocket.CONNECTING && !init) {
			setConnecting(true)
			setInit(true)
		}
	}, [state, init, lostConnection, retryTime])

	const [connecting, setConnecting] = useState<boolean>(false)

	const connect = () => {
		setConnecting(true)
	}

	let snackbarSeverity: AlertColor = "warning"
	if (state === WebSocket.CLOSED) {
		snackbarSeverity = "error"
	}

	const anchorOrigin: SnackbarOrigin =
		props.app === "admin"
			? {
					vertical: "bottom",
					horizontal: "right",
			  }
			: {
					vertical: "top",
					horizontal: "center",
			  }

	return (
		<Snackbar anchorOrigin={anchorOrigin} open={lostConnection && [WebSocket.CLOSED, WebSocket.CONNECTING].includes(state)}>
			<Alert severity={snackbarSeverity}>
				{state === WebSocket.CLOSED && `Lost connection to server, reconnecting in ${retryTime} seconds.`}
				{state === WebSocket.CLOSED && (
					<Typography variant={"body2"}>
						{"Failed to connect to the server, "}
						<Link component={"button"} variant={"body2"} title={"Click to Reconnect"} onClick={connect}>
							click here
						</Link>
						{" to reconnect."}
					</Typography>
				)}
				{(state === WebSocket.CONNECTING || connecting) && <Dots>connecting</Dots>}
			</Alert>
		</Snackbar>
	)
}
