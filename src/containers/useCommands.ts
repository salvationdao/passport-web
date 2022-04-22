import useWS, { pool } from "./useWS"
import { useEffect, useRef, useState } from "react"
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
	const [backlog, setBacklog] = useState<string[]>([])

	const { message, state, establish, key } = useWS({ URI: `/commander/${user ? user.id : "not-ready"}/commands`, ready: !!user && !!user.id, host })
	const callbacks = useRef<{ [key: string]: Callback }>({})

	useEffect(() => {
		if (!message || !message.transactionId) return
		if (message.transactionId) {
			const { [message.transactionId]: cb, ...withoutCb } = callbacks.current
			if (cb) {
				callbacks.current = withoutCb
				cb(message)
			}
		}
	}, [message])

	useEffect(() => {
		if (backlog.length === 0 || !pool[key] || !pool[key].socket) return
		if (pool[key].socket.readyState === WebSocket.OPEN) {
			setBacklog((b) => {
				b.forEach((s) => {
					const socket = pool[key].socket
					socket.send(s)
				})
				return []
			})
		}
	}, [key, state, backlog])

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
			const s = JSON.stringify({
				key,
				payload,
				transactionId,
			})
			if (!pool[key] || !pool[key].socket || pool[key].socket.readyState !== WebSocket.OPEN) {
				setBacklog((b) => {
					return [...b, s]
				})
				return
			}

			const socket = pool[key].socket
			if (!pool[key] || !pool[key].socket) throw new Error("no websocket connection present")
			socket.send(s)
		})
	})

	return { send: send.current, state, establish }
}

export default useCommands
