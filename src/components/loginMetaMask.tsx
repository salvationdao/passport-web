import { useCallback, useMemo, useState } from "react"
import { useAuth } from "../containers/auth"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { metamaskErrorHandling } from "../helpers/web3"

interface MetaMaskLoginButtonRenderProps {
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	metaMaskState: MetaMaskState
	isProcessing: boolean
	errorMessage: string | null
}
interface LoginMetaMaskProps {
	onFailure?: (err: string) => void
	onClick?: () => void // return false to stop login
	render: (props: MetaMaskLoginButtonRenderProps) => JSX.Element
}

export const MetaMaskLogin: React.VoidFunctionComponent<LoginMetaMaskProps> = ({ onFailure, onClick, render }) => {
	const { loginMetamask } = useAuth()
	const { metaMaskState } = useWeb3()
	const [isProcessing, setIsProcessing] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const click = useCallback(async () => {
		if (metaMaskState === MetaMaskState.NotInstalled) {
			window.open(`https://metamask.app.link/dapp/${window.location.href.replace(`${window.location.protocol}//`, "")}`)
			setIsProcessing(false)
			return
		}
		setIsProcessing(true)
		if (onClick) {
			onClick()
		}
		try {
			const resp = await loginMetamask()
			if (!resp || !resp.payload) {
				setErrorMessage(
					"There was a problem logging you in, Passport may be updating at this time. If the issue persists please contact support.",
				)
				setIsProcessing(false)
				return
			}
			setIsProcessing(false)
		} catch (e: any) {
			setIsProcessing(false)
			if (onFailure) {
				const err = metamaskErrorHandling(e)
				if (err) {
					onFailure(err)
					setErrorMessage(err)
					return
				}
				onFailure("Something went wrong, please try again.")
			}
		}
		setIsProcessing(false)
	}, [onFailure, loginMetamask, onClick, metaMaskState])

	const propsForRender = useMemo(
		() => ({
			onClick: click,
			errorMessage: errorMessage,
			isProcessing,
			metaMaskState,
		}),
		[click, isProcessing, metaMaskState, errorMessage],
	)

	if (!render) {
		throw new Error("MetaMaskLogin requires a render prop to render")
	}

	return render(propsForRender)
}
