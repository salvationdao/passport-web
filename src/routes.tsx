import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { Home } from "./pages/home"
import { LoginPage } from "./pages/login"
import { Onboarding } from "./pages/onboarding"
import { ProfilePage } from "./pages/profile"
import { Settings } from "./pages/settings"
import { WalletPage } from "./pages/wallet"
import { CollectionsPage } from "./pages/management/collections/collections"
import { UserPage } from "./pages/management/users/view"
import { UserList } from "./pages/management/users/list"
import { ListPage } from "./pages/listPages"

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

					<Route path="/collections" component={CollectionsPage} />
					<Route path="/collections/assets/:slug" component={CollectionsPage} />

					<Route path="/privacy-policy" component={Home} />
					<Route path="/terms-and-conditions" component={Home} />
					<Route path="/users" component={ListPage.Users} />

					<Route path="/settings" component={Settings} />
				</Switch>
			</Router>
			{/* <ConnectionLostSnackbar app="admin" /> */}
		</>
	)
}
