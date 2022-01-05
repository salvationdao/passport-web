import { useState, useEffect } from "react"
import { useWebsocket } from "../containers/socket"
import { Snackbar, Typography, Link, SnackbarOrigin } from "@mui/material"
import Alert, { AlertColor } from "@mui/material/Alert"

const MAX_COUNTDOWN_SECONDS = 5
const MAX_RECONNECT_ATTEMPTS = 3

/**
 * Displays a snack bar if server disconnects and have it reconnect automatically within X seconds.
 */
export const ConnectionLostSnackbar = (props: { app: "admin" | "public" }) => {
	const { state, connect } = useWebsocket()
	const [lostConnection, setLostConnection] = useState(false)
	const [reconnectAttempts, setReconnectAttempts] = useState(MAX_RECONNECT_ATTEMPTS)
	const [countdown, setCountdown] = useState(MAX_COUNTDOWN_SECONDS)

	useEffect(() => {
		if (state === WebSocket.CLOSED && !lostConnection) {
			setLostConnection(true)
		} else if (state === WebSocket.OPEN) {
			setReconnectAttempts(MAX_RECONNECT_ATTEMPTS)
			setLostConnection(false)
		}
		if (state === WebSocket.CLOSED && countdown === 0 && reconnectAttempts > 0) {
			setCountdown(MAX_COUNTDOWN_SECONDS)
			setReconnectAttempts((prev) => prev - 1)
		}
	}, [state, lostConnection, reconnectAttempts, countdown])

	useEffect(() => {
		if (state !== WebSocket.CLOSED || reconnectAttempts === 0) {
			return
		}
		if (countdown === 0) {
			connect()
		}
		if (countdown > 0) {
			const t = setTimeout(() => {
				setCountdown((prev) => prev - 1)
			}, 1000)
			return () => {
				clearTimeout(t)
			}
		}
	}, [state, countdown, reconnectAttempts, connect])

	let snackbarSeverity: AlertColor = "warning"
	if (state === WebSocket.CLOSED && reconnectAttempts === 0) {
		snackbarSeverity = "error"
	}

	const anchorOrigin: SnackbarOrigin =
		props.app === "admin"
			? {
					vertical: "bottom",
					horizontal: "left",
			  }
			: {
					vertical: "top",
					horizontal: "center",
			  }

	return (
		<Snackbar anchorOrigin={anchorOrigin} open={lostConnection && [WebSocket.CLOSED, WebSocket.CONNECTING].includes(state)}>
			<Alert severity={snackbarSeverity}>
				{state === WebSocket.CLOSED && reconnectAttempts > 0 && `Lost connection to server, reconnecting in ${countdown} seconds.`}
				{state === WebSocket.CLOSED && reconnectAttempts === 0 && (
					<Typography variant={"body2"}>
						{"Failed to connect to the server, "}
						<Link component={"button"} variant={"body2"} title={"Click to Reconnect"} onClick={connect}>
							click here
						</Link>
						{" to reconnect."}
					</Typography>
				)}
				{state === WebSocket.CONNECTING && `Re-connecting...`}
			</Alert>
		</Snackbar>
	)
}
