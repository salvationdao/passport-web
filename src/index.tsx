import React from "react"
import * as ReactDOM from "react-dom"
import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"
import { createBrowserHistory } from "history"
import { API_ENDPOINT_HOSTNAME, SENTRY_CONFIG, XGRID_LICENSE } from "./config"
import { Themes } from "./containers"
import { LicenseInfo } from "@mui/x-data-grid-pro"
import App from "./App"

import { createClient, Action, ClientContextProvider } from "react-fetching-library"
import { FingerprintProvider } from "./containers/fingerprint"
import { AuthProvider } from "./containers/auth"
import { Web3Provider } from "./containers/web3"
import { SnackbarProvider } from "./containers/snackbar"
import { BrowserRouter } from "react-router-dom"

const prefixURL = (prefix: string) => () => async (action: Action) => {
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
	requestInterceptors: [prefixURL(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api`)],
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
			<BrowserRouter>
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
			</BrowserRouter>
		</Themes.Provider>
	</React.StrictMode>,
	document.getElementById("root") as HTMLElement,
)
