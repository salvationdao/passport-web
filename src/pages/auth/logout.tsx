import { useEffect } from "react"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"

export const LogoutPage = () => {
	const { sessionId, logout } = useAuth()

	useEffect(() => {
		if (!sessionId) return
		logout()
	}, [sessionId, logout])

	return <Loading text="We are logging you out, please wait..." />
}
