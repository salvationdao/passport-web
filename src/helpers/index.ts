import { Action } from "react-fetching-library"

export const Get = <T>(endpoint: string): Action<T> => ({
	method: "GET",
	endpoint,
	responseType: "json",
	credentials: "include",
})

export const Post = <T>(endpoint: string, body?: T, responseType?: "arrayBuffer" | "blob" | "json" | "text" | "formData"): Action => ({
	method: "POST",
	endpoint,
	body,
	responseType: responseType || "json",
	credentials: "include",
})

/** Formats bytes to string */
export const formatBytes = (bytes: number, decimals: number = 2) => {
	if (bytes === 0) return "0 Bytes"

	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

/** Takes a camel cased string and inserts spaces between the words (`camelCaseString` -> `camel Case String`) */
export const splitCamelCase = (str: string) => str.replace(/([a-z])([A-Z])/g, "$1 $2")

/** Takes a long string and truncates it with a middle-positioned ellipsis */
export const middleTruncate = (str: string, length?: number, startOffset?: number, endOffset?: number) => {
	if (length ? str.length > length : str.length > 16) {
		return str.substring(0, startOffset || 12) + "..." + str.substring(str.length - (endOffset || 4), str.length)
	}
	return str
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default function debounce<T extends Function>(cb: T, wait = 20) {
	let h: number
	const callable = (...args: any) => {
		clearTimeout(h)
		h = window.setTimeout(() => cb(...args), wait)
	}
	return callable as any as T
}

// Generates a string of URI encoded parameters from an object
export const getParamsFromObject = (params: any) => {
	return (
		"?" +
		Object.keys(params)
			.filter((param) => !!params[param])
			.map((param) => `${param}=${window.encodeURIComponent(params[param])}`)
			.join("&")
	)
}

// Returns true if user agent is mobile
export const getIsMobile = () => {
	let isMobile = false
	try {
		isMobile = !!(
			(window.navigator && (window.navigator as any).standalone === true) ||
			window.matchMedia("(display-mode: standalone)").matches ||
			navigator.userAgent.match("CriOS") ||
			navigator.userAgent.match(/mobile/i)
		)
	} catch (ex) {
		// continue regardless of error
	}

	return isMobile
}

// getStringFromShoutingSnakeCase returns a normal, capitalised word/phrase from a string formatted to SHOUTING_SNAKE_CASE
// e.g ULTRA_RARE => Ultra Rare
export const getStringFromShoutingSnakeCase = (val: string) => {
	return val
		.toLowerCase()
		.split("_")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join(" ")
}

export function protocol() {
	return window.location.protocol.match(/^https/) ? "wss" : "ws"
}

export const countDecimals = (value: string) => {
	if (parseFloat(value) % 1 !== 0) return value.split(".")[1].length
	return 0
}

export const parseString = (val: string | null, defaultVal: number): number => {
	if (!val) return defaultVal

	return parseFloat(val)
}

export const makeid = (length: number) => {
	let result = ""
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	const charactersLength = characters.length
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}
