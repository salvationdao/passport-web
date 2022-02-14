import { useEffect, useState } from "react"
import { useAuth } from "../containers/auth"
import { SocketState, useWebsocket } from "../containers/socket"
import HubKey from "../keys"

export function useSecureSubscription<T>(key: HubKey, args?: any) {
	const { subscribe, state } = useWebsocket()
	const { user } = useAuth()

	const [payload, setPayload] = useState<T>()
	const [_args, setArguments] = useState(args)

	useEffect(() => {
		if (state !== SocketState.OPEN || !user) return

		return subscribe<T>(
			key,
			(payload) => {
				setPayload(payload)
			},
			_args,
		)
	}, [key, subscribe, _args, state, user])

	return { payload, setArguments }
}
