import { API_ENDPOINT_HOSTNAME } from "../config"
import useWS, { WSWindow } from "../hooks/useWS"
import { useEffect, useRef } from "react"
import { makeid } from "./socket"
import { Message } from "../types/types"
import { useAuth } from "./auth"

interface WSError {
	transaction_id: string
	key: string
	error: string
}

export type SendFunc = <Y = any, X = any>(key: string, payload?: X) => Promise<Y>
type Callback<T = any> = (data: T) => void

const useCommands = (host?: string) => {
	const { user } = useAuth()

	const { message, state, establish } = useWS({ URI: `/cmd/${user ? user.id : "not-ready"}`, ready: !!user && !!user.id, host })
	const callbacks = useRef<{ [key: string]: Callback }>({})

	const win: WSWindow = window
	const key = `${host}/api/ws/cmd/${user && user.id}`
	const webSocket = useRef<WebSocket | undefined>(win.ws && win.ws[key].socket)

	useEffect(() => {
		if (win.ws && !win.ws[key] && win.ws[key].socket && !webSocket.current) {
			webSocket.current = win.ws[key].socket
		}
		if (!message || !message.transactionId) return
		if (message.transactionId) {
			const { [message.transactionId]: cb, ...withoutCb } = callbacks.current
			if (cb) {
				callbacks.current = withoutCb
				cb(message)
			}
		}
	}, [message])

	const send = useRef<SendFunc>(function send<Y = any, X = any>(key: string, payload?: X): Promise<Y> {
		const transactionId = makeid()
		return new Promise(function (resolve, reject) {
			callbacks.current[transactionId] = (data: Message<Y> | WSError) => {
				if (data.key === "ERROR") {
					console.error("ws err", data)
					reject((data as WSError).error)
					return
				}
				const result = (data as Message<Y>).payload
				resolve(result)
			}

			if (!win.ws || !win.ws[key] || !win.ws[key].socket) throw new Error("no websocket connection present")
			if (!webSocket.current) {
				webSocket.current = win.ws[key].socket
			}

			if (webSocket.current)
				webSocket.current.send(
					JSON.stringify({
						key,
						payload,
						transactionId,
					}),
				)
		})
	})

	return { send: send.current, state, establish }
}

export default useCommands
