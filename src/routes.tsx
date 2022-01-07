import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { Home } from "./pages/home"
import { ProfilePage } from "./pages/profile"
import { ConnectionLostSnackbar } from "./components/connectionLostSnackbar"
import { Onboarding } from "./pages/onboarding"

export const Routes = () => {
	return (
		<>
			<Router>
				<Switch>
					<Route path="/onboarding" component={Onboarding} />
					{/* <Route path="/" component={Portal} /> */}
					<Route exact path="/" component={Home} />
					<Route path="/profile" component={ProfilePage} />
					<Route path="/privacy-policy" component={Home} />
					<Route path="/terms-and-conditions" component={Home} />
				</Switch>
			</Router>
			<ConnectionLostSnackbar app="admin" />
		</>
	)
}
