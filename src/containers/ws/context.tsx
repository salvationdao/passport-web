import * as React from "react"
import { createContext, useCallback, useRef } from "react"
import { Message } from "../../types/types"
import dateParser from "../../helpers/jsonParser"
import { protocol } from "../../helpers"

export type Listener = (msg: Message) => void
export type StateObserver = (state: number) => void

export interface WSObserver {
	onMessage: Listener
	onState: StateObserver
}

export interface WSState {
	socket: (uri: string, ws?: WebSocket) => WebSocket
	lastMessage: (uri: string) => Message | undefined
	reconnecting: { [key: string]: string }
	connect: (uri: string, ident: string, observer: WSObserver, args?: { [key: string]: any }) => () => void
}

const initialState: WSState = {
	socket: (uri: string, ws?: WebSocket) => new WebSocket(""),
	lastMessage: (uri: string) => undefined,
	reconnecting: {},
	connect: (uri: string, ident: string, observer: WSObserver) => () => undefined,
}

export const WSContext = createContext<WSState>(initialState)

export const WSProvider: React.FC = ({ children }) => {
	const sockets = useRef<{ [key: string]: WebSocket }>({})
	const lastMessages = useRef<{ [key: string]: Message }>({})
	const observers = useRef<{ [key: string]: { [key: string]: WSObserver } }>({})

	const reconnecting = useRef<{ [key: string]: string }>({})

	const lastMessage = useCallback((uri: string) => {
		return lastMessages.current[uri]
	}, [])

	;(window as any).sockets = sockets.current

	const socket = useCallback((uri: string, ws?: WebSocket) => {
		if (ws) {
			const oldSocket = sockets.current[uri]
			ws.onopen = oldSocket.onopen
			ws.onerror = oldSocket.onerror
			ws.onclose = oldSocket.onclose
			ws.onmessage = oldSocket.onmessage
			sockets.current[uri] = ws
		}
		return sockets.current[uri]
	}, [])

	const connect = useCallback((uri: string, ident: string, observer: WSObserver, args?: { [key: string]: any }) => {
		if (
			!sockets.current[uri] ||
			(sockets.current[uri].readyState !== WebSocket.CONNECTING && sockets.current[uri].readyState !== WebSocket.OPEN)
		) {
			const params = !args ? "" : new URLSearchParams(args).toString()
			sockets.current[uri] = new WebSocket(`${protocol()}://${uri}${params}`)
		}

		if (!observers.current[uri]) {
			observers.current[uri] = {}
		}

		observers.current[uri][ident] = observer

		const sock = sockets.current[uri]
		const stateChange = () => {
			try {
				Object.values(observers.current[uri]).forEach((ob) => {
					ob.onState(sockets.current[uri].readyState)
				})
			} catch (err) {
				console.warn(err)
			}
		}
		sock.onopen = stateChange
		sock.onerror = stateChange
		sock.onclose = stateChange
		sock.onmessage = (message) => {
			if (!sockets.current[uri]) throw new Error("ws state has changed")
			try {
				const msgData: Message = JSON.parse(message.data, dateParser)
				msgData.mt = window.performance.now()
				lastMessages.current[uri] = msgData
				Object.values(observers.current[uri]).forEach((ob) => {
					ob.onMessage(msgData)
				})
			} catch (err) {
				console.error(err)
				return
			}
		}
		return () => {
			if (observers.current[uri]) {
				delete observers.current[uri][ident]
			}
			if (sockets.current[uri]) {
				console.log("active listeners", Object.keys(observers.current[uri]).length)
				if (Object.keys(observers.current[uri]).length === 0) {
					try {
						sockets.current[uri].send("exit")
						sockets.current[uri].close()
					} catch (err) {
						console.error(err)
					}
					delete sockets.current[uri]
					delete observers.current[uri]
					delete lastMessages.current[uri]
				}
			} else {
				delete observers.current[uri]
				delete lastMessages.current[uri]
			}
		}
	}, [])

	return <WSContext.Provider value={{ socket, connect, lastMessage, reconnecting: reconnecting.current }}>{children}</WSContext.Provider>
}
