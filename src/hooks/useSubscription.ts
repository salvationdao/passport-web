import { useEffect, useState } from "react"
import HubKey from "../keys"
import useWS from "../containers/useWS"

/** Subscribe to a hub key
 * @param args optional arguments; if set will send a ":SUBSCRIBE" (and ":UNSUBSCRIBE") message to tell server we're listening
 */

export function useSubscription<T>(URI: string, key: string, host?: string) {
	const { subscribe } = useWS({ URI, host })
	const [payload, setPayload] = useState<T>()
	useEffect(() => {
		return subscribe<T>(key, (payload) => {
			setPayload(payload)
		})
	}, [key, subscribe])

	return payload
}

export default useSubscription
