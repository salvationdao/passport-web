import { useAuth } from "./auth"
import useSubscription from "../hooks/useSubscription"
import { User } from "../types/types"
import keys from "../keys"

const useUser = (userId?: string) => {
	const { user: { id } = {} } = useAuth()
	if (!id) {
		throw new Error("useUser should not be mounted when not logged in")
	}
	const URI = userId ? `/public/user/${userId}` : `/user/${id}`

	return useSubscription<User>({ URI, key: keys.User })
}

export default useUser
