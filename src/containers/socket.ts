import { useEffect, useMemo, useRef, useState } from "react"
import { createContainer } from "unstated-next"
import HubKey from "../keys"
import { API_ENDPOINT_HOSTNAME } from "../config"

// makeid is used to generate a random transaction_id for the websocket
export function makeid(length: number = 12): string {
	let result = ""
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length))
	}
	return result
}

const DateParse = () => {
	const reISO =
		/^([0-9]+)-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])[Tt]([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(([Zz])|([+|-]([01][0-9]|2[0-3]):[0-5][0-9]))$/

	return function (key: string, value: any) {
		if (typeof value === "string") {
			const a = reISO.exec(value)
			if (a) return new Date(value)
		}
		return value
	}
}

const dp = DateParse()

export function protocol() {
	return window.location.protocol.match(/^https/) ? "wss" : "ws"
}

export enum SocketState {
	CONNECTING = WebSocket.CONNECTING,
	OPEN = WebSocket.OPEN,
	CLOSING = WebSocket.CLOSING,
	CLOSED = WebSocket.CLOSED,
}

type WSSendFn = <Y = any, X = any>(key: string, payload?: X) => Promise<Y>

interface WebSocketProperties {
	send: WSSendFn
	connect: () => Promise<undefined>
	state: SocketState
	subscribe: <T>(key: string, callback: (payload: T) => void, args?: any) => () => void
	// onReconnect: () => void
}

type SubscribeCallback = (payload: any) => void

export interface Message<T> {
	transaction_id: string
	key: string
	payload: T
}

type WSCallback<T = any> = (data: T) => void

interface HubError {
	transaction_id: string
	key: string
	message: string
}

const UseWebsocket = (): WebSocketProperties => {
	const [state, setState] = useState<SocketState>(SocketState.CLOSED)
	const callbacks = useRef<{ [key: string]: WSCallback }>({})

	const webSocket = useRef<WebSocket | null>(null)

	const send = useRef<WSSendFn>(function send<Y = any, X = any>(key: string, payload?: X): Promise<Y> {
		const transaction_id = makeid()
		return new Promise(function (resolve, reject) {
			callbacks.current[transaction_id] = (data: Message<Y> | HubError) => {
				if (data.key === "HUB:ERROR") {
					reject((data as HubError).message)
					return
				}
				const result = (data as Message<Y>).payload
				resolve(result)
			}

			if (!webSocket.current) throw new Error("no websocket")
			webSocket.current.send(
				JSON.stringify({
					key,
					payload,
					transaction_id,
				}),
			)
		})
	})

	const subs = useRef<{ [transaction_id: string]: SubscribeCallback[] }>({})

	const subscribe = useMemo(() => {
		return <T>(key: string, callback: (payload: T) => void, args?: any) => {
			const transaction_id = makeid()

			if (subs.current[transaction_id]) subs.current[transaction_id].push(callback)
			else subs.current[transaction_id] = [callback]

			if (!webSocket.current) throw new Error("no websocket")
			webSocket.current.send(
				JSON.stringify({
					key,
					payload: args,
					transaction_id,
				}),
			)

			return () => {
				const i = subs.current[transaction_id].indexOf(callback)
				if (i === -1) return
				subs.current[transaction_id].splice(i, 1)

				if (!webSocket.current) throw new Error("no websocket")
				webSocket.current.send(
					JSON.stringify({
						key: key + ":UNSUBSCRIBE",
						transaction_id,
					}),
				)
			}
		}
	}, [])

	const setupWS = useMemo(
		() => (ws: WebSocket, onopen?: () => void) => {
			;(window as any).ws = ws

			ws.onopen = (e) => {
				// Use network sub menu to see payloads traveling between client and server
				// https://stackoverflow.com/a/5757171
				console.info("WebSocket open.")
			}
			ws.onerror = (e) => {
				// Use network sub menu to see payloads traveling between client and server
				// https://stackoverflow.com/a/5757171
				// console.error("onerror", e)
				ws.close()
			}
			ws.onmessage = (message) => {
				const msgData = JSON.parse(message.data, dp)
				// Use network sub menu to see payloads traveling between client and server
				// https://stackoverflow.com/a/5757171
				if (msgData.key === HubKey.Welcome) {
					setReadyState()
					if (onopen) {
						onopen()
					}
				}
				if (msgData.transaction_id) {
					const { [msgData.transaction_id]: cb, ...withoutCb } = callbacks.current
					if (cb) {
						cb(msgData)
						callbacks.current = withoutCb
					}
				}
				if (subs.current[msgData.transaction_id]) {
					for (const callback of subs.current[msgData.transaction_id]) {
						callback(msgData.payload)
					}
				}
			}
			ws.onclose = (e) => {
				setReadyState()
			}
		},
		[],
	)

	const connect = useMemo(() => {
		return (): Promise<undefined> => {
			return new Promise(function (resolve, reject) {
				setState(WebSocket.CONNECTING)
				setTimeout(() => {
					webSocket.current = new WebSocket(`${protocol()}://${API_ENDPOINT_HOSTNAME}/api/ws`)
					setupWS(webSocket.current)
					resolve(undefined)
				}, 2000)
			})
		}
	}, [setupWS])

	const setReadyState = () => {
		if (!webSocket.current) {
			setState(WebSocket.CLOSED)
			return
		}
		setState(webSocket.current.readyState)
	}

	useEffect(() => {
		webSocket.current = new WebSocket(`${protocol()}://${API_ENDPOINT_HOSTNAME}/api/ws`)
		setupWS(webSocket.current)

		return () => {
			if (webSocket.current) webSocket.current.close()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return { send: send.current, state, connect, subscribe }
}

const WebsocketContainer = createContainer(UseWebsocket)
export const SocketProvider = WebsocketContainer.Provider
export const useWebsocket = WebsocketContainer.useContainer

export default WebsocketContainer
