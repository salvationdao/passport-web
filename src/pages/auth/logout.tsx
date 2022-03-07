import { useEffect } from "react"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"
import { useWebsocket } from "../../containers/socket"

export const LogoutPage = () => {
	const { sessionId, logout } = useAuth()
	const { state } = useWebsocket()

	useEffect(() => {
		if (!sessionId || state !== WebSocket.OPEN) return
		logout()
	}, [sessionId, state, logout])

	return <Loading text="We are logging you out, please wait..." />
}
