import { useEffect } from "react"
import { Redirect } from "react-router-dom"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"

export const LogoutPage = () => {
	const { user, sessionID, loading, logout } = useAuth()

	useEffect(() => {
		if (user && sessionID) {
			logout()
		}
	}, [user, sessionID, logout])

	if (!user && !loading) {
		return <Redirect to={"/"} />
	}
	return <Loading text="We are logging you out, please wait..." />
}
