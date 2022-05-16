import SupremacyLogin from "./supremacy"
// hard coding Supremacy logo

const LoginPage = () => {
	if (window.location.search.includes("supremacy")) {
		return <SupremacyLogin />
	}
	return <SupremacyLogin />
}

export default LoginPage
