import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { Redirect, Route, Switch } from "react-router-dom"
import { Loading } from "./components/loading"
import { API_ENDPOINT_HOSTNAME } from "./config"
import { Themes } from "./containers"
import { useAuth, UserUpdater } from "./containers/auth"
import { SidebarStateProvider } from "./containers/sidebar"
import { ws } from "./containers/ws"
import "./fonts.css"
import { loadIcons } from "./helpers/loadicons"
import ForgotPassword from "./pages/forgotPassword"
import { LoginPage } from "./pages/login"
import { LoginRedirect } from "./pages/login/redirect"
import ResetPassword from "./pages/resetPassword"
import { Routes } from "./routes"

loadIcons()

ws.Initialise({ defaultHost: API_ENDPOINT_HOSTNAME })

const AppInner = () => {
	const { user, userID, loading } = useAuth()
	const params = new URL(window.location.href).searchParams
	if (params.has("denied")) {
		return (
			<Switch>
				<Redirect to={"/redirect"} />
			</Switch>
		)
	}
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
				<Route path="/reset-password">
					<ResetPassword />
				</Route>
				<Route path="/redirect">
					<LoginRedirect />
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
