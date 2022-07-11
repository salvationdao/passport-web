import React, { useState } from "react"
import GoogleLogin, { GoogleLoginResponse } from "react-google-login"
import { GoogleIcon } from "../../../../assets"
import { GOOGLE_CLIENT_ID } from "../../../../config"
import { useAuth } from "../../../../containers/auth"
import { useSnackbar } from "../../../../containers/snackbar"
import { usePassportCommandsUser } from "../../../../hooks/usePassport"
import HubKey from "../../../../keys"
import { User } from "../../../../types/types"
import { ConnectionButton } from "./ConnectionButton"

export const Google: React.FC = () => {
	const { user, setUser } = useAuth()
	const { displayMessage } = useSnackbar()
	const { send } = usePassportCommandsUser("/commander")
	const [loading, setLoading] = useState(false)

	if (!user) {
		return null
	}

	return (
		<GoogleLogin
			clientId={GOOGLE_CLIENT_ID}
			onRequest={() => {
				setLoading(true)
			}}
			onSuccess={async (res) => {
				setLoading(true)
				if (user.google_id) {
					const resp = await send<User>(HubKey.UserRemoveGoogle)
					setUser(resp)
				} else {
					if (res.code) {
						displayMessage(`Couldn't connect to Google: ${res.code}`)
						return
					}
					const r = res as GoogleLoginResponse
					const resp = await send<User>(HubKey.UserAddGoogle, {
						google_id: r.googleId,
					})
					setUser(resp)
				}

				setLoading(false)
			}}
			onFailure={(err) => {
				displayMessage("Failed to authenticated user.")
				setLoading(false)
			}}
			cookiePolicy={"single_host_origin"}
			render={(props) => (
				<ConnectionButton
					handleClick={props.onClick}
					loading={loading}
					icon={GoogleIcon}
					title="Add Google"
					small
					connected={!!user.google_id}
				/>
			)}
		/>
	)
}
