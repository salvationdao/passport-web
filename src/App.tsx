import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { Themes } from "./containers"
import { useAuth, UserUpdater } from "./containers/auth"
import { SidebarStateProvider } from "./containers/sidebar"
import "./fonts.css"
import { loadIcons } from "./helpers/loadicons"
import { Routes } from "./routes"
import { Loading } from "./components/loading"
import { API_ENDPOINT_HOSTNAME } from "./config"
import { Redirect, Route, Switch } from "react-router-dom"
import { LoginPage } from "./pages/login"
import { ws } from "./containers/ws"
import ForgotPassword from "./pages/forgotPassword"

loadIcons()

ws.Initialise({ defaultHost: API_ENDPOINT_HOSTNAME })

const AppInner = () => {
	const { user, userID, loading } = useAuth()
	if (loading) return <Loading />
	if (!user) {
		return (
			<Switch>
				<Route path="/external/login">
					<LoginPage />
				</Route>
				<Route path="/login">
					<LoginPage />
				</Route>
				<Route path="/forgot-password">
					<ForgotPassword />
				</Route>
				<Route path="/">
					<Redirect to={"/login"} />
				</Route>
			</Switch>
		)
	}
	return (
		<>
			{!!userID && <UserUpdater />}
			<SidebarStateProvider>
				<Routes />
			</SidebarStateProvider>
		</>
	)
}

const AppAdmin = () => {
	const { currentTheme } = Themes.useContainer()

	return (
		<ThemeProvider theme={currentTheme}>
			<CssBaseline />
			<AppInner />
		</ThemeProvider>
	)
}

export default AppAdmin
