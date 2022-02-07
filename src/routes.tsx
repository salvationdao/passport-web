import { useEffect } from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { ConnectionLostSnackbar } from "./components/connectionLostSnackbar"
import { useAuth } from "./containers/auth"
import { LoginPage } from "./pages/auth/login"
import { PassportReady } from "./pages/auth/onboarding"
import { SignUpPage } from "./pages/auth/signup"
import { Home } from "./pages/home"
import { AssetsList } from "./pages/management/assets/list"
import { CollectionsPage } from "./pages/management/collections/collections"
import { ProfilePage } from "./pages/profile"
import { Settings } from "./pages/settings"
import { ViewPage } from "./pages/viewPages"

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
					<Route path="/signup" component={SignUpPage} />
					<Route path="/onboarding" component={PassportReady} />
					<Route path="/profile" component={ProfilePage} />

					{/* users collections (all) */}
					<Route path="/:username/collections/:collection_name" component={AssetsList} />

					{/* asset view page */}
					<Route path="/collections/assets/:tokenID" component={ViewPage.Asset} />

					{/* users collections (filtered) */}
					<Route path="/:username/collections" component={CollectionsPage} />

					<Route path="/privacy-policy" component={Home} />
					<Route path="/terms-and-conditions" component={Home} />

					<Route path="/settings" component={Settings} />
				</Switch>
			</Router>
			<ConnectionLostSnackbar app="admin" />
		</>
	)
}
