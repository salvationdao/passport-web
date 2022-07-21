import { useEffect } from "react"
import { SupremacyAuth } from "../../components/supremacy/auth"
import { ENVIRONMENT } from "../../config"
import { LoginForm } from "./form"
import { Web3 } from "./web3"
// hard coding Supremacy logo

export const LoginPage = () => {
	let Wrapper = SupremacyAuth
	useEffect(() => {
		window.localStorage.removeItem("walletconnect")
	}, [])

	if (window.location.search.includes("supremacy")) {
		Wrapper = SupremacyAuth
	}
	return <Wrapper>{ENVIRONMENT !== "develop" ? <Web3 /> : <LoginForm />}</Wrapper>
}
