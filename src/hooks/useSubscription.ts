import { useEffect, useState } from "react"
import HubKey from "../keys"
import useWS from "../containers/ws/useWS"

/** Subscribe to a hub key
 * @param args optional arguments; if set will send a ":SUBSCRIBE" (and ":UNSUBSCRIBE") message to tell server we're listening
 */

interface SubProps<Y = { [key: string]: any }> {
	URI: string
	key: string
	host?: string
	args?: Y
}

export function useSubscription<T = any, Y = { [key: string]: any }>({ URI, key, host, args }: SubProps) {
	const { subscribe } = useWS({ URI, host, args })
	const [payload, setPayload] = useState<T>()
	useEffect(() => {
		return subscribe<T>(key, (payload) => {
			setPayload(payload)
		})
	}, [key, subscribe])

	return payload
}

export default useSubscription
