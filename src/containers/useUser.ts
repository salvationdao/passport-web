import { useAuth } from "./auth"
import useSubscription from "../hooks/useSubscription"
import { User } from "../types/types"

const useUser = (userId?: string) => {
	const { user: { id } = {} } = useAuth()
	if (!id) {
		throw new Error("useUser should not be mounted when not logged in")
	}
	const uri = userId ? `/public/user/${userId}` : `/public/user/${id}`
	const user = useSubscription<User>(uri, "USER")

	return user
}

export default useUser
