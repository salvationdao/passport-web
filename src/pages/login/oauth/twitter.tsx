import React from "react"
import { TwitterLogin, TwitterLoginButtonRenderProps } from "../../../components/twitterLogin"

interface ITwitterLoginWrapperProps {
	onFailure: (err: string) => void
	render: (props: TwitterLoginButtonRenderProps) => JSX.Element
	onClick?: (popup?: Window | null) => Promise<void>
}

const TwitterLoginWrapper: React.FC<ITwitterLoginWrapperProps> = ({ onFailure, render, onClick }) => {
	return (
		<TwitterLogin
			onFailure={(err) => {
				console.error(err)
				if (err.status) onFailure(err.status)
			}}
			render={(props) => render(props)}
			onClick={onClick}
		/>
	)
}

export default TwitterLoginWrapper
