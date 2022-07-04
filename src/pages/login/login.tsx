import { SupremacyAuth } from "../../components/supremacy/auth"
import { LoginForm } from "./form"
// hard coding Supremacy logo

export const LoginPage = () => {
	let Wrapper = SupremacyAuth
	if (window.location.search.includes("supremacy")) {
		Wrapper = SupremacyAuth
	}
	return (
		<Wrapper>
			<LoginForm />
		</Wrapper>
	)
}
