import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { Home } from "./pages/home"
import { ProfilePage } from "./pages/profile"

export const Routes = () => {
	return (
		<>
			<Router>
				<Switch>
					{/* <Route path="/verify" exact component={Verify} /> */}
					{/* <Route path="/" component={Portal} /> */}
					<Route exact path="/" component={Home} />
					<Route path="/profile" component={ProfilePage} />
					<Route path="/privacy-policy" component={Home} />
					<Route path="/terms-and-conditions" component={Home} />
				</Switch>
			</Router>
			{/* <ConnectionLostSnackbar app="admin" /> */}
		</>
	)
}

