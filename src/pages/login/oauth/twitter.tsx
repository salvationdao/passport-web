import React from "react"
import { TwitterLogin, TwitterLoginButtonRenderProps } from "../../../components/twitterLogin"

interface ITwitterLoginWrapperProps {
	onFailure: (err: string) => void
	render: (props: TwitterLoginButtonRenderProps) => JSX.Element
}

const TwitterLoginWrapper: React.FC<ITwitterLoginWrapperProps> = ({ onFailure, render }) => {
	// const { twitterLogin } = useAuth()

	return (
		<TwitterLogin
			callback={async () => {
				console.log("it works")
			}}
			onFailure={(err) => console.log(err)}
			render={(props) => render(props)}
		/>
	)
}

export default TwitterLoginWrapper
