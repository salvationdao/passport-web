import * as React from "react"
import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../config"
import dateParser from "../helpers/jsonParser"
import { protocol } from "../helpers"
import { Message } from "../types/types"
import { SocketState } from "../containers/socket"

interface WSProps {
	URI: string
	host?: string
	ready?: boolean
}

type Subscription<T = any> = (payload: T) => void
type Listener = (msg: Message) => void

export interface WSWindow extends Window {
	ws?: {
		[key: string]: {
			refs: MutableRefObject<WebSocket | undefined>[]
			socket?: WebSocket
			listeners: Listener[]
			lastMessage?: Message
		}
	}
}

const useWS = ({ URI, host = API_ENDPOINT_HOSTNAME, ready = true }: WSProps) => {
	const win: WSWindow = window
	const key = `${host}/api/ws/${URI}`

	const ws = useRef<WebSocket | undefined>(win.ws && win.ws[key] && win.ws[key].socket)

	const state = useMemo(
		() => () => {
			if (ws.current) {
				return ws.current.readyState
			} else {
				return WebSocket.CLOSED
			}
		},
		[],
	)

	const [lastProc, setLastProc] = useState<number>(0)
	const [subs, setSubs] = useState<{ [key: string]: Subscription[] }>({})
	const [message, setMessage] = useState<Message | undefined>(win.ws && win.ws[key] ? win.ws[key].lastMessage : undefined)

	const establish = useMemo(
		() => () => {
			if (!win.ws) {
				win.ws = {}
			}
			if (!ready) return
			if (!win.ws[key]) {
				win.ws[key] = {
					refs: [ws],
					listeners: [setMessage],
				}
			}
			if (win.ws[key]) {
				if (win.ws[key].socket) {
					ws.current = win.ws[key].socket
				}
				win.ws[key].refs.push(ws)

				if (ws.current && ws.current.readyState === WebSocket.OPEN) {
					return
				}
				const socket = new WebSocket(`${protocol()}://${key}`)
				socket.onopen = (e) => {}
				socket.onerror = (e) => {}
				socket.onclose = (e) => {}
				socket.onmessage = (message) => {
					if (!win.ws || !win.ws[key]) throw new Error("global ws state has changed")
					const msgData: Message = JSON.parse(message.data, dateParser)
					msgData.mt = win.performance.now()
					win.ws[key].lastMessage = msgData
					win.ws[key].listeners.forEach((subscriber) => {
						subscriber(msgData)
					})
				}
				socket.onclose = (e) => {}
				return socket
			}
		},
		[URI, host, ready],
	)

	useEffect(() => {
		establish()
		return () => {
			if (!win.ws || !win.ws[key]) return
			const i = win.ws[key].refs.indexOf(ws)
			win.ws[key].refs = win.ws[key].refs.splice(i, 1)
			if (!win.ws || !win.ws[key] || win.ws[key].refs.length > 1) return
			if (ws.current) ws.current.close()
			delete win.ws[key]
		}
	}, [win, ready, key, setMessage, establish])

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

	useEffect(() => {
		ws.current = new WebSocket(`${protocol()}://${API_ENDPOINT_HOSTNAME}/api/${URI}`)
	}, [URI])

	return { message, subscribe, state, establish }
}
export default useWS
