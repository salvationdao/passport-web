import * as React from "react"
import { useContext, useEffect, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { Message } from "../../types/types"
import { v4 as uuidv4 } from "uuid"
import { WSContext } from "./context"
import useReconnect from "./reconnecter"

interface WSProps {
	URI: string
	host?: string
	ready?: boolean
	args?: { [key: string]: any }
}

type Subscription<T = any> = (payload: T) => void

const deslash = (s: string): string => {
	return s.startsWith("/") ? s.substring(1) : s
}

const useWS = ({ URI, host = API_ENDPOINT_HOSTNAME, ready = true }: WSProps) => {
	const { connect, lastMessage, socket } = useContext(WSContext)

	const key = `${host}/api/ws/${deslash(URI)}`

	const [mounted, setMounted] = useState<boolean>(true)

	useEffect(() => {
		return () => setMounted(false)
	}, [])

	const [ident, _] = useState<string>(uuidv4())
	const [state, setSocketState] = useState<number>(socket(key) ? socket(key).readyState : WebSocket.CLOSED)
	const [subs, setSubs] = useState<{ [key: string]: Subscription[] }>({})

	const [lastProc, setLastProc] = useState<number>(0)
	const [message, setMessage] = useState<Message | undefined>(lastMessage(key))

	const { retryTime } = useReconnect(key, ident, state)

	useEffect(() => {
		if (!ready) return
		const cleanup = connect(key, ident, {
			onMessage: (msg: Message) => {
				if (!mounted) {
					cleanup()
					return
				}
				setMessage(msg)
			},
			onState: setSocketState,
		})
		return cleanup
	}, [ready])

	useEffect(() => {
		if (!message || message.mt === lastProc) return
		setLastProc(message.mt)
		if (subs[message.key]) {
			subs[message.key].forEach((action) => {
				action(message)
			})
		}
	}, [message, subs, lastProc])

	const subscribe = <T,>(key: string, action: (payload: T) => void): (() => void) => {
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

	return { message, subscribe, state, key, socket, retryTime }
}
export default useWS
