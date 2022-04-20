import React from "react"
import * as ReactDOM from "react-dom"
import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"
import { createBrowserHistory } from "history"
import { SENTRY_CONFIG, XGRID_LICENSE } from "./config"
import { Themes } from "./containers"
import { LicenseInfo } from "@mui/x-data-grid-pro"
import App from "./App"

import { createClient, Client, Action, ClientContextProvider } from "react-fetching-library"
import { FingerprintProvider } from "./containers/fingerprint"
import { AuthProvider } from "./containers/auth"
import { Web3Provider } from "./containers/web3"
import { SnackbarProvider } from "./containers/snackbar"

const prefixURL = (prefix: string) => (client: Client) => async (action: Action) => {
	return {
		...action,
		headers: {
			"X-AUTH-TOKEN": localStorage.getItem("auth-token") || "",
			...action.headers,
		},
		endpoint: `${prefix}${action.endpoint}`,
	}
}

const client = createClient({
	//None of the options is required
	requestInterceptors: [prefixURL("/api")],
	responseInterceptors: [],
})

if (SENTRY_CONFIG) {
	const history = createBrowserHistory()
	Sentry.init({
		dsn: SENTRY_CONFIG.DSN,
		release: SENTRY_CONFIG.RELEASE,
		environment: SENTRY_CONFIG.ENVIRONMENT,
		integrations: [
			new Integrations.BrowserTracing({
				routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
			}),
		],
		tracesSampleRate: SENTRY_CONFIG.SAMPLERATE,
	})
}

if (XGRID_LICENSE) LicenseInfo.setLicenseKey(XGRID_LICENSE)

ReactDOM.render(
	<React.StrictMode>
		<Themes.Provider>
			<ClientContextProvider client={client}>
				<FingerprintProvider>
					<SnackbarProvider>
						<Web3Provider>
							<AuthProvider>
								<App />
							</AuthProvider>
						</Web3Provider>
					</SnackbarProvider>
				</FingerprintProvider>
			</ClientContextProvider>
		</Themes.Provider>
	</React.StrictMode>,
	document.getElementById("root") as HTMLElement,
)
