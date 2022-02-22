import { useEffect } from "react"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"
import { useWebsocket } from "../../containers/socket"

export const LogoutPage = () => {
	const { sessionID, logout } = useAuth()
	const { state } = useWebsocket()

	useEffect(() => {
		if (!sessionID || state !== WebSocket.OPEN) return
		logout()
	}, [sessionID, state, logout])

	return <Loading text="We are logging you out, please wait..." />
}
