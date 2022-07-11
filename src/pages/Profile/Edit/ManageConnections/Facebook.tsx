import React from "react"
import { MetaIcon } from "../../../../assets"
import { FacebookLogin, ReactFacebookLoginInfo } from "../../../../components/facebookLogin"
import { useAuth } from "../../../../containers/auth"
import { useSnackbar } from "../../../../containers/snackbar"
import { usePassportCommandsUser } from "../../../../hooks/usePassport"
import HubKey from "../../../../keys"
import { User } from "../../../../types/types"
import { ConnectionButton } from "./ConnectionButton"

export const Facebook: React.FC = () => {
	const { user, setUser } = useAuth()
	const { displayMessage } = useSnackbar()
	const { send } = usePassportCommandsUser("/commander")

	if (!user) {
		return null
	}

	return (
		<FacebookLogin
			callback={async (res) => {
				window.FB.logout()
				if (user.facebook_id) {
					const resp = await send<User>(HubKey.UserRemoveFacebook)
					setUser(resp)
				} else {
					const u = res as ReactFacebookLoginInfo
					const resp = await send<User>(HubKey.UserAddFacebook, {
						facebook_id: u.id,
					})
					setUser(resp)
				}
			}}
			onFailure={displayMessage}
			render={(props) => (
				<ConnectionButton
					handleClick={props.onClick}
					loading={props.isProcessing}
					icon={MetaIcon}
					title="Add Meta"
					small
					connected={!!user.facebook_id}
				/>
			)}
		/>
	)
}
