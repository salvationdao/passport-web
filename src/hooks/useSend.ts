import { useCallback, useEffect, useState } from "react"
import HubKey from "../keys"
import { usePassportCommandsUser } from "../hooks/usePassport"

export const useQuery = <P = any, R = any>(hubKey: HubKey, initFetch?: boolean, request?: R) => {
	const { send } = usePassportCommandsUser("/commander")
	const [loading, setLoading] = useState<boolean>(false)
	const [payload, setPayload] = useState<P | undefined>(undefined)
	const [error, setError] = useState<string | undefined>(undefined)
	const [initFetched, setInitFetched] = useState(false)

	const query = useCallback(
		async (request?: R) => {
			setLoading(true)
			try {
				const rsp = await send<P, R>(hubKey, request)
				setError(undefined)
				setPayload(rsp)
				return rsp
			} catch (e) {
				setError(typeof e === "string" ? e : "Something went wrong, please try again.")
			} finally {
				setLoading(false)
			}
		},
		[hubKey, send],
	)
	useEffect(() => {
		if (initFetch !== true || initFetched) return
		setInitFetched(true)
		query(request)
	}, [query, initFetch, request, initFetched])

	return { loading, payload, error, query, setPayload }
}
