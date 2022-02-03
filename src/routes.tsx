import { useEffect } from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { ConnectionLostSnackbar } from "./components/connectionLostSnackbar"
import { useAuth } from "./containers/auth"
import { LoginPage } from "./pages/auth/login"
import { PassportReady } from "./pages/auth/onboarding"
import { Home } from "./pages/home"
import { CollectionsPage } from "./pages/management/collections/collections"
import { ProfilePage } from "./pages/profile"
import { Settings } from "./pages/settings"
import { ViewPage } from "./pages/viewPages"
import { WalletPage } from "./pages/wallet"

export const Routes = () => {
	const { setSessionID } = useAuth()
	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search)
		const sessionID = searchParams.get("sessionID")
		if (sessionID) setSessionID(sessionID)
	}, [setSessionID])
	return (
		<>
			<Router>
				<Switch>
					<Route exact path="/" component={Home} />
					<Route path="/login" component={LoginPage} />
					<Route path="/onboarding" component={PassportReady} />
					<Route path="/profile" component={ProfilePage} />
					<Route path="/wallet" component={WalletPage} />
					<Route path="/collections/assets/:tokenID" component={ViewPage.Asset} />
					<Route path="/collections/:slug" component={CollectionsPage} />
					<Route path="/collections" component={CollectionsPage} />

					<Route path="/privacy-policy" component={Home} />
					<Route path="/terms-and-conditions" component={Home} />

					<Route path="/settings" component={Settings} />
				</Switch>
			</Router>
			<ConnectionLostSnackbar app="admin" />
		</>
	)
}
