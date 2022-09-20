import { API_ENDPOINT_HOSTNAME } from "../config"
import { useAuth } from "../containers/auth"
import { SubProps, useCommands, useSubscription } from "../containers/ws"
import { DataType } from "../containers/ws/util"

// Fetch
export const usePassportCommandsUser = (URI?: string) => {
	const { userID } = useAuth()
	return useCommands({ host: API_ENDPOINT_HOSTNAME, URI: `/user/${userID}${URI}`, ready: !!userID })
}

export const usePassportCommands = (URI?: string) => {
	return useCommands({ host: API_ENDPOINT_HOSTNAME, URI: `${URI}` })
}

// Subscription
export function usePassportSubscriptionUser<T = DataType>({ URI, key, args, ready = true }: SubProps, callback?: (payload: T) => void) {
	const { userID } = useAuth()
	return useSubscription({ URI: `/user/${userID}${URI}`, key, host: API_ENDPOINT_HOSTNAME, args, ready: !!userID && ready }, callback)
}

export function usePassportSubscription<T = DataType>({ URI, key, args, ready = true }: SubProps, callback?: (payload: T) => void) {
	return useSubscription({ URI: `${URI}`, key, host: API_ENDPOINT_HOSTNAME, args, ready }, callback)
}
