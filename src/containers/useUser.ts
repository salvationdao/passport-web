import { useAuth } from "./auth"
import useSubscription from "./ws/useSubscription"
import { User } from "../types/types"
import keys from "../keys"

const useUser = (userId: string) => {
	const { userID } = useAuth()
	if (!userID) {
		throw new Error("useUser should not be mounted when not logged in")
	}

	return useSubscription<User>({ URI: `/public/user/${userId}`, key: keys.User })
}

export default useUser
