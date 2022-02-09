export const XGRID_LICENSE = process.env.XGRID_LICENSE_KEY

export const SENTRY_CONFIG = {
	DSN: process.env.REACT_APP_SENTRY_DSN_FRONTEND,
	RELEASE: process.env.REACT_APP_SENTRY_CURRENT_RELEASE_NAME,
	ENVIRONMENT: process.env.REACT_APP_SENTRY_ENVIRONMENT,
	get SAMPLERATE(): number {
		let rate = Number(process.env.REACT_APP_SENTRY_SAMPLERATE)

		// Check rate is a number between 0 and 1
		if (isNaN(rate) || rate > 1 || rate < 0) {
			return 0.01
		}
		return rate
	},
}
