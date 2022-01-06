import { Box } from "@mui/material"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import { Portal } from "./pages/portal"

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
					{/* <Route path="/verify" exact component={Verify} /> */}
					<Route path="/" component={Portal} />
				</Switch>
			</Router>
			{/* <ConnectionLostSnackbar app="admin" /> */}
		</Box>
	)
}

