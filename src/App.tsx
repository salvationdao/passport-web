import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { Themes } from "./containers"
import { useAuth } from "./containers/auth"
import { SidebarStateProvider } from "./containers/sidebar"
import { SnackbarProvider } from "./containers/snackbar"
import "./fonts.css"
import { loadIcons } from "./helpers/loadicons"
import { Routes } from "./routes"
import Login from "./pages/login/login"

loadIcons()

const AppInner = () => {
	const { user } = useAuth()
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
			<AppInner />
		</ThemeProvider>
	)
}

export default AppAdmin
