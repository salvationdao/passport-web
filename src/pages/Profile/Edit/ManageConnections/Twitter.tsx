import React, { useCallback, useState } from "react"
import { TwitterIcon } from "../../../../assets"
import { TwitterLogin } from "../../../../components/twitterLogin"
import { useAuth } from "../../../../containers/auth"
import { useSnackbar } from "../../../../containers/snackbar"
import { usePassportCommandsUser, usePassportSubscriptionUser } from "../../../../hooks/usePassport"
import HubKey from "../../../../keys"
import { User } from "../../../../types/types"
import { ConnectionButton } from "./ConnectionButton"

export const Twitter: React.FC = () => {
	const { user, setUser } = useAuth()
	const { displayMessage } = useSnackbar()
	const { send } = usePassportCommandsUser("/commander")
	const [loading, setLoading] = useState(false)

	usePassportSubscriptionUser({ URI: `/twitter`, key: HubKey.UserAddTwitter }, (payload: User) => {
		if (payload.id) {
			setUser(payload)
		}
	})
	const handleRemove = useCallback(async () => {
		const resp = await send<User>(HubKey.UserRemoveTwitter)
		setUser(resp)
	}, [send, setUser])

	if (!user) {
		return null
	}

	return (
		<TwitterLogin
			add={user.id}
			onClick={user.twitter_id ? handleRemove : undefined}
			onFailure={(err) => {
				displayMessage("Failed to authenticated user")
				setLoading(false)
			}}
			render={(props) => (
				<ConnectionButton
					handleClick={props.onClick}
					loading={loading}
					icon={TwitterIcon}
					title="Add Twitter"
					small
					connected={!!user.twitter_id}
				/>
			)}
		/>
	)
}
