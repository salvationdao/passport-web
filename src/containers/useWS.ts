import * as React from "react"
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../config"
import dateParser from "../helpers/jsonParser"
import { protocol } from "../helpers"
import { Message } from "../types/types"
import { SocketState } from "./socket"
import { v4 as uuidv4 } from "uuid"

interface WSProps {
	URI: string
	host?: string
	ready?: boolean
}

type Subscription<T = any> = (payload: T) => void
type Listener = (msg: Message) => void
type StateObserver = (state: number) => void
interface WSObserver {
	onMessage: Listener
	onState: StateObserver
}

interface Pool {
	socket: WebSocket
	observers: { [key: string]: WSObserver }
	lastMessage?: Message
}

const deslash = (s: string): string => {
	return s.startsWith("/") ? s.substring(1) : s
}

export const pool: { [key: string]: Pool } = {}

const useWS = ({ URI, host = API_ENDPOINT_HOSTNAME, ready = true }: WSProps) => {
	const key = `${host}/api/ws/${deslash(URI)}`

	const [ident, _] = useState<string>(uuidv4())
	const [state, setSocketState] = useState<number>(WebSocket.CLOSED)

	const [lastProc, setLastProc] = useState<number>(0)
	const [subs, setSubs] = useState<{ [key: string]: Subscription[] }>({})
	const [message, setMessage] = useState<Message | undefined>(pool && pool[key] ? pool[key].lastMessage : undefined)

	const establish = useMemo(
		() => () => {
			let initialized = false
			if (!ready) return
			if (!pool[key]) {
				initialized = true
				pool[key] = {
					socket: new WebSocket(`${protocol()}://${key}`),
					observers: {},
				}
			}
			pool[key].observers[ident] = {
				onMessage: setMessage,
				onState: setSocketState,
			}
			if (initialized) {
				const socket = pool[key].socket
				socket.onopen = (e) => {
					for (const k in pool[key].observers) {
						console.log("readyState", socket.readyState)
						pool[key].observers[k].onState(socket.readyState)
					}
				}

				socket.onerror = (e) => {}
				socket.onclose = (e) => {
					for (const k in pool[key].observers) {
						console.log("readyState closed", socket.readyState)

						pool[key].observers[k].onState(socket.readyState)
					}
				}
				socket.onmessage = (message) => {
					if (!pool[key]) throw new Error("global ws state has changed")
					try {
						const msgData: Message = JSON.parse(message.data, dateParser)
						msgData.mt = window.performance.now()
						pool[key].lastMessage = msgData
						for (const k in pool[key].observers) {
							pool[key].observers[k].onMessage(msgData)
						}
					} catch (err) {
						console.error(err)
						return
					}
				}
			} else {
				setSocketState(pool[key].socket.readyState)
			}
		},
		[URI, host, ready],
	)

	useEffect(() => {
		establish()
		return () => {
			if (!pool[key]) return
			delete pool[key].observers[ident]
			if (!pool[key] || Object.keys(pool[key].observers).length > 0) return
			pool[key].socket.close()
			delete pool[key]
		}
	}, [ready, key, setMessage, establish])

	useEffect(() => {
		if (!message || message.mt === lastProc) return
		setLastProc(message.mt)
		if (subs[message.key]) {
			subs[message.key].forEach((action) => {
				action(message)
			})
		}
	}, [message, subs, lastProc])

	const subscribe = <T = any>(key: string, action: (payload: T) => void): (() => void) => {
		return () => {
			if (message) action(message.payload)
			setSubs((subs) => {
				if (!subs[key]) return subs
				const i = subs[key].indexOf(action)
				if (i === -1) return subs
				return {
					...subs,
					[key]: subs[key].splice(i, 1),
				}
			})
		}
	}

	return { message, subscribe, state, establish, key }
}
export default useWS
