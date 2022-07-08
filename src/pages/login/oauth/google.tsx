import React, { useState } from "react"
import GoogleLogin, { GoogleLoginResponse } from "react-google-login"
import { GOOGLE_CLIENT_ID } from "../../../config"
import { useAuth } from "../../../containers/auth"

interface RenderProps {
	onClick: () => void
	disabled?: boolean | undefined
	loading: boolean
}

interface IGoogleLoginWrapperProps {
	onFailure: (err: string) => void
	render: (props: RenderProps) => JSX.Element
}

const GoogleLoginWrapper: React.FC<IGoogleLoginWrapperProps> = ({ onFailure, render }) => {
	const { googleLogin } = useAuth()
	const [loading, setLoading] = useState(false)

	return (
		<GoogleLogin
			clientId={GOOGLE_CLIENT_ID}
			buttonText="Google"
			onRequest={() => {
				setLoading(true)
			}}
			onSuccess={async (response) => {
				if (response.code) {
					onFailure(`Couldn't connect to Google: ${response.code}`)
					return
				}
				const r = response as GoogleLoginResponse
				await googleLogin.action(r.googleId, r.profileObj.givenName, r.profileObj.email, onFailure)
				setLoading(false)
			}}
			onFailure={(err) => {
				onFailure(err)
				setLoading(false)
			}}
			cookiePolicy={"single_host_origin"}
			render={(props) => render({ ...props, loading: loading ? loading : googleLogin.loading })}
		/>
	)
}

export default GoogleLoginWrapper
