import { useEffect, useState } from "react"
import { SocketState, useWebsocket } from "../containers/socket"
import HubKey from "../keys"

/** Subscribe to a hub key
 * @param args optional arguments; if set will send a ":SUBSCRIBE" (and ":UNSUBSCRIBE") message to tell server we're listening
 */
function useSubscription<T>(key: HubKey, args?: any) {
	const { subscribe, state } = useWebsocket()

	const [payload, setPayload] = useState<T>()
	const [_args, setArguments] = useState(args)

	useEffect(() => {
		if (state !== SocketState.OPEN) return

		return subscribe<T>(
			key,
			(payload) => {
				setPayload(payload)
			},
			_args,
		)
	}, [key, subscribe, _args, state])

	return { payload, setArguments }
}

export default useSubscription
