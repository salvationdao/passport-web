import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { Action, Client, ClientContextProvider, createClient } from "react-fetching-library"
import { Themes } from "./containers"
import { AssetProvider } from "./containers/assets"
import { AuthProvider } from "./containers/auth"
import { SidebarStateProvider } from "./containers/sidebar"
import { API_ENDPOINT_HOSTNAME, SocketProvider } from "./containers/socket"
import { Web3Provider } from "./containers/web3"
import "./fonts.css"
import { loadIcons } from "./helpers/loadicons"
import { Routes } from "./routes"

loadIcons()

const prefixURL = (prefix: string) => (client: Client) => async (action: Action) => {
	return {
		...action,
		endpoint: `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}${prefix}${action.endpoint}`,
	}
}

export const client = createClient({
	//None of the options is required
	requestInterceptors: [prefixURL("/api")],
	responseInterceptors: [],
})

const AppAdmin = () => {
	const { currentTheme } = Themes.useContainer()

	return (
		<SocketProvider>
			<Web3Provider>
				<ClientContextProvider client={client}>
					<AuthProvider>
						<AssetProvider>
							<SidebarStateProvider>
								<ThemeProvider theme={currentTheme}>
									<CssBaseline />
									<Routes />
								</ThemeProvider>
							</SidebarStateProvider>
						</AssetProvider>
					</AuthProvider>
				</ClientContextProvider>
			</Web3Provider>
		</SocketProvider>
	)
}

export default AppAdmin
