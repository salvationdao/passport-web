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

	usePassportSubscriptionUser({ URI: "", key: HubKey.UserAddTwitter }, (payload: { user: User; error: string }) => {
		if (payload.user) {
			setLoading(true)
			setUser(payload.user)
			setLoading(false)
		} else if (payload.error) {
			displayMessage(payload.error, "error")
		}
	})

	const handleRemove = useCallback(async () => {
		try {
			setLoading(true)
			const resp = await send<User>(HubKey.UserRemoveTwitter)
			setUser(resp)
		} catch (err: any) {
			console.error(err)
			displayMessage(err, "error")
		} finally {
			setLoading(false)
		}
	}, [send, setUser, displayMessage])

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
