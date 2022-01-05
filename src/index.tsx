import React from "react"
import * as ReactDOM from "react-dom"
import * as Sentry from "@sentry/react"
import { SENTRY_DSN, XGRID_LICENSE } from "./config"
import { Themes } from "./containers"
import { LicenseInfo } from "@mui/x-data-grid-pro"
import App from "./App";

if (SENTRY_DSN) Sentry.init({ dsn: SENTRY_DSN })
if (XGRID_LICENSE) LicenseInfo.setLicenseKey(XGRID_LICENSE)

ReactDOM.render(
	<React.StrictMode>
		<Themes.Provider>
			<App />
		</Themes.Provider>
	</React.StrictMode>,
	document.getElementById('root') as HTMLElement
);
