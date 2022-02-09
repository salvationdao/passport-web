import React from "react"
import * as ReactDOM from "react-dom"
import * as Sentry from "@sentry/react"
import { Integrations } from "@sentry/tracing"
import { createBrowserHistory } from "history"
import { SENTRY_CONFIG, XGRID_LICENSE } from "./config"
import { Themes } from "./containers"
import { LicenseInfo } from "@mui/x-data-grid-pro"
import App from "./App"

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
			<App />
		</Themes.Provider>
	</React.StrictMode>,
	document.getElementById("root") as HTMLElement,
)
