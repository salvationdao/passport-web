import { useContext, useEffect, useState } from "react"
import { WSContext } from "./context"
import { protocol } from "../../helpers"

const useReconnect = (uri: string, ident: string, state: number) => {
	const { socket, reconnecting } = useContext(WSContext)
	const [retryTime, setRetryTime] = useState<number>(5)

	useEffect(() => {
		if (reconnecting[uri] !== ident) {
			return
		}
		if (!socket(uri)) return
		if (socket(uri).readyState === WebSocket.OPEN) {
			setRetryTime(5)
			delete reconnecting[uri]
			return
		}
		if (state !== socket(uri).readyState) return
		if (socket(uri).readyState === WebSocket.CLOSED) {
			reconnecting[uri] = ident
			window.setTimeout(() => {
				if (!socket(uri)) return
				const newSocket = new WebSocket(socket(uri).url)
				socket(uri, newSocket)
				setRetryTime(retryTime * 1.5)
			}, retryTime * 1000)
		}
	}, [state])

	return { retryTime }
}

export default useReconnect
