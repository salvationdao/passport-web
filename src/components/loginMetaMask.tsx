import MetaMaskOnboarding from "@metamask/onboarding"
import { useCallback, useMemo, useState } from "react"
import { useHistory } from "react-router-dom"
import { AuthContainer } from "../containers"
import { MetaMaskState, useWeb3 } from "../containers/web3"

interface MetaMaskLoginButtonRenderProps {
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	metaMaskState: MetaMaskState
	isProcessing: boolean
}

interface LoginMetaMaskProps {
	onFailure?: (err: string) => void
	onClick?: () => Promise<boolean> // return false to stop login
	render: (props: MetaMaskLoginButtonRenderProps) => JSX.Element
}

export const MetaMaskLogin: React.VoidFunctionComponent<LoginMetaMaskProps> = ({ onFailure, onClick, render }) => {
	const { loginMetamask } = AuthContainer.useContainer()
	const { metaMaskState, connect } = useWeb3()
	const history = useHistory()
	const [isProcessing, setIsProcessing] = useState(false)

	const click = useCallback(async () => {
		setIsProcessing(true)
		if (metaMaskState === MetaMaskState.NotLoggedIn) {
			await connect()
			return
		}
		if (metaMaskState === MetaMaskState.Active) {
			if (onClick && !(await onClick())) return

			try {
				const resp = await loginMetamask()
				if (!resp || !resp.isNew) return
				history.push("/onboarding?skip_username=true")
			} catch (e) {
				if (onFailure) {
					onFailure(typeof e === "string" ? e : "Something went wrong, please try again.")
				}
			}
			return
		}
		const onboarding = new MetaMaskOnboarding()
		onboarding.startOnboarding()
		setIsProcessing(false)
	}, [onFailure, history, loginMetamask, metaMaskState, onClick, connect])

	const propsForRender = useMemo(
		() => ({
			onClick: click,
			isProcessing,
			metaMaskState,
		}),
		[click, isProcessing, metaMaskState],
	)

	if (!render) {
		throw new Error("MetaMaskLogin requires a render prop to render")
	}

	return render(propsForRender)
}
