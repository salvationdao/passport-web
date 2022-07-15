import React from "react"
import { TwitterLogin, TwitterLoginButtonRenderProps } from "../../../components/twitterLogin"

interface ITwitterLoginWrapperProps {
	onFailure: (err: string) => void
	render: (props: TwitterLoginButtonRenderProps) => JSX.Element
}

const TwitterLoginWrapper: React.FC<ITwitterLoginWrapperProps> = ({ onFailure, render }) => {
	return (
		<TwitterLogin
			onFailure={(err) => {
				console.error(err)
				if (err.status) onFailure(err.status)
			}}
			render={(props) => render(props)}
		/>
	)
}

export default TwitterLoginWrapper
