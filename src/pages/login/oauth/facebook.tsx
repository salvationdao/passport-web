import React from "react"
import { FacebookLogin, FacebookLoginButtonRenderProps, ReactFacebookLoginInfo } from "../../../components/facebookLogin"
import { useAuth } from "../../../containers/auth"

interface IFacebookLoginWrapperProps {
	onFailure: (err: string) => void
	render: (props: FacebookLoginButtonRenderProps, loading: boolean) => JSX.Element
}

const FacebookLoginWrapper: React.FC<IFacebookLoginWrapperProps> = ({ onFailure, render }) => {
	const { facebookLogin } = useAuth()

	return (
		<FacebookLogin
			callback={async (user) => {
				const u = user as ReactFacebookLoginInfo
				console.log("TESTESTS")
				await facebookLogin.action(u.id, u.email, onFailure)
				window.FB.logout()
			}}
			onFailure={onFailure}
			render={(props) => render(props, facebookLogin.loading)}
		/>
	)
}

export default FacebookLoginWrapper
