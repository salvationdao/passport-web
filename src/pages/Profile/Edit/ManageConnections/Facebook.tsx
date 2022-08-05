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
				if (!user.facebook_id) {
					try {
						const u = res as ReactFacebookLoginInfo
						const resp = await send<User>(HubKey.UserAddFacebook, {
							facebook_token: u.accessToken,
						})
						setUser(resp)
					} catch (err: any) {
						console.error(err)
						displayMessage(err, "error")
					}
				}
			}}
			onFailure={(err) => {
				displayMessage(err, "error")
			}}
			render={(props) => (
				<ConnectionButton
					handleClick={async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
						if (user.facebook_id) {
							try {
								const resp = await send<User>(HubKey.UserRemoveFacebook)
								setUser(resp)
							} catch (err: any) {
								console.error(err)
								displayMessage(err, "error")
							}
						} else {
							props.onClick(e)
						}
					}}
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
