import { useCallback } from "react"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import HubKey from "../../keys"
import { AddServiceRequest, AddServiceResponse } from "../../types/auth"
import { User } from "../../types/types"

const useOAuth = (setUser: (user?: User) => void) => {
	const { send } = usePassportCommandsUser("/commander")
	/**
	 * Connects a User's existing account to Google
	 */
	const addGoogle = useCallback(
		async (token: string) => {
			try {
				const resp = await send<AddServiceResponse, AddServiceRequest>(HubKey.UserAddGoogle, {
					token,
				})
				if (!resp || !resp.user) {
					return
				}
				setUser(resp.user)
			} catch (e) {
				throw typeof e === "string" ? e : "Something went wrong, please try again."
			}
			return
		},
		[send, setUser],
	)

	return { addGoogle }
}

export default useOAuth
