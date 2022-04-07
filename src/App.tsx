import { CssBaseline } from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { Action, Client, ClientContextProvider, createClient } from "react-fetching-library"
import { API_ENDPOINT_HOSTNAME } from "./config"
import { Themes } from "./containers"
import { AssetProvider } from "./containers/assets"
import { AuthProvider } from "./containers/auth"
import { FingerprintProvider } from "./containers/fingerprint"
import { SidebarStateProvider } from "./containers/sidebar"
import { SnackbarProvider } from "./containers/snackbar"
import { SocketProvider } from "./containers/socket"
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
			<SnackbarProvider>
				<Web3Provider>
					<ClientContextProvider client={client}>
						<FingerprintProvider>
							<AuthProvider>
								<SidebarStateProvider>
									<AssetProvider>
										<ThemeProvider theme={currentTheme}>
											<CssBaseline />
											<Routes />
										</ThemeProvider>
									</AssetProvider>
								</SidebarStateProvider>
							</AuthProvider>
						</FingerprintProvider>
					</ClientContextProvider>
				</Web3Provider>
			</SnackbarProvider>
		</SocketProvider>
	)
}

export default AppAdmin
