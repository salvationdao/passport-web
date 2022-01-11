import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { Home } from "./pages/home"
import { LoginPage } from "./pages/login"
import { Onboarding } from "./pages/onboarding"
import { ProfilePage } from "./pages/profile"
import { Settings } from "./pages/settings"
import { WalletPage } from "./pages/wallet"

export const Routes = () => {
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
					<Route path="/privacy-policy" component={Home} />
					<Route path="/terms-and-conditions" component={Home} />
					<Route path="/settings" component={Settings} />
				</Switch>
			</Router>
			{/* <ConnectionLostSnackbar app="admin" /> */}
		</>
	)
}
