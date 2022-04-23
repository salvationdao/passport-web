import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { Themes } from "./containers"
import { useAuth } from "./containers/auth"
import { SidebarStateProvider } from "./containers/sidebar"
import "./fonts.css"
import { loadIcons } from "./helpers/loadicons"
import { Routes } from "./routes"
import Login from "./pages/login/login"
import { WSProvider } from "./containers/ws/context"
import { Loading } from "./components/loading"

loadIcons()

const AppInner = () => {
	const { user, loading } = useAuth()
	if (loading) return <Loading />
	if (!user) {
		return <Login />
	}
	return (
		<SidebarStateProvider>
			<Routes />
		</SidebarStateProvider>
	)
}

const AppAdmin = () => {
	const { currentTheme } = Themes.useContainer()

	return (
		<ThemeProvider theme={currentTheme}>
			<CssBaseline />
			<WSProvider>
				<AppInner />
			</WSProvider>
		</ThemeProvider>
	)
}

export default AppAdmin
