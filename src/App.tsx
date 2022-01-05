import { createClient, Client, Action, ClientContextProvider } from "react-fetching-library"
import { ThemeProvider } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import { Themes } from "./containers"
import { loadIcons } from "./helpers/loadicons"
import { AuthProvider } from "./containers/auth"
import { Routes } from "./routes"
import { API_ENDPOINT_HOSTNAME, SocketProvider } from "./containers/socket"
import { Web3Provider } from "./containers/web3"

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
					<ThemeProvider theme={currentTheme}>
						<CssBaseline />
						<Routes />
					</ThemeProvider>
				</AuthProvider>
			</ClientContextProvider>
			</Web3Provider>
		</SocketProvider>
	)
}

export default AppAdmin
