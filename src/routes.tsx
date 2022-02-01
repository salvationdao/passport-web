import { useEffect } from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { ConnectionLostSnackbar } from "./components/connectionLostSnackbar"
import { useAuth } from "./containers/auth"
import { Home } from "./pages/home"
import { LoginPage } from "./pages/login"
import { CollectionsPage } from "./pages/management/collections/collections"
import { AssetsList } from "./pages/management/collections/list"
import { Onboarding } from "./pages/onboarding"
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
					{/* <Route path="/" component={Portal} /> */}
					<Route exact path="/" component={Home} />
					<Route path="/login" component={LoginPage} />
					<Route path="/onboarding" component={Onboarding} />
					<Route path="/profile" component={ProfilePage} />
					<Route path="/wallet" component={WalletPage} />

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
