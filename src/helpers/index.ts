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

export default function debounce<T extends Function>(cb: T, wait = 20) {
	let h: number
	let callable = (...args: any) => {
		clearTimeout(h)
		h = window.setTimeout(() => cb(...args), wait)
	}
	return callable as any as T
}

export function makeid(length: number = 12): string {
	let result = ""
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	return result
}
