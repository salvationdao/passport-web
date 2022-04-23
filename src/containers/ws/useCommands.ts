import useWS from "./useWS"
import { useEffect, useRef, useState } from "react"
import { Message } from "../../types/types"
import { useAuth } from "../auth"
import { makeid } from "../../helpers"

interface WSError {
	transaction_id: string
	key: string
	error: string
}

export type SendFunc = <Y = any, X = any>(key: string, payload?: X) => Promise<Y>
type Callback<T = any> = (data: T) => void

const useCommands = (host?: string) => {
	const { user } = useAuth()
	const [toSend, setToSend] = useState<string[]>([])
	const backlog = useRef<string[]>([])
	const sending = useRef<boolean>(false)
	const { message, state, key, socket, retryTime } = useWS({
		URI: `/user/${user ? user.id : "not-ready"}/commander`,
		ready: user !== undefined,
		host,
	})
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
		if (toSend.length === 0 || sending.current) return
		if (state === WebSocket.OPEN) {
			sending.current = true
			const notSent = [...toSend, ...backlog.current]
			try {
				for (let i = 0; i < toSend.length; i++) {
					console.log("SENDING: " + JSON.parse(toSend[i]).transactionId)
					socket(key).send(toSend[i])
					notSent.shift()
				}
			} catch (err) {
				console.error(err)
			}
			backlog.current = []
			setToSend(notSent)
			sending.current = false
		}
	}, [key, state, toSend, sending])

	const send = useRef<SendFunc>(function send<Y = any, X = any>(key: string, payload?: X): Promise<Y> {
		return new Promise(function (resolve, reject) {
			console.log("SENDING: ", key)
			console.trace()
			const transactionId = makeid()
			const s = JSON.stringify({
				key,
				payload,
				transactionId,
			})
			callbacks.current[transactionId] = (data: Message<Y> | WSError) => {
				if (data.key === "ERROR") {
					console.error("ws err", data, s)
					reject((data as WSError).error)
					return
				}
				const result = (data as Message<Y>).payload
				resolve(result)
			}
			if (sending.current) {
				backlog.current.push(s)
				return
			}
			setToSend((b) => {
				if (b.indexOf(s) > -1) return b
				return [...b, s]
			})
		})
	})

	return { send: send.current, state, retryTime }
}

export default useCommands
