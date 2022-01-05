import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { Verify } from "./pages/verify"
import { Portal } from "./pages/portal"
import { ConnectionLostSnackbar } from "./components/connectionLostSnackbar"
import { Box } from "@mui/material"

export const Routes = () => {
	return (
		<Box
			sx={{
				width: "100%",
				minHeight: "100vh",
			}}
		>
			<Router>
				<Switch>
					<Route path="/verify" exact component={Verify} />
					<Route path="/" component={Portal} />
				</Switch>
			</Router>
			<ConnectionLostSnackbar app="admin" />
		</Box>
	)
}

