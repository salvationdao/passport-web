import { useEffect } from "react"
import SupremacyLogin from "./supremacy"
// hard coding Supremacy logo

const LoginPage = () => {
	useEffect(() => {
		window.localStorage.removeItem("walletconnect")
	}, [])

	if (window.location.search.includes("supremacy")) {
		return <SupremacyLogin />
	}
	return <SupremacyLogin />
}

export default LoginPage
