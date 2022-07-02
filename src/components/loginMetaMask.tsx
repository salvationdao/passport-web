import MetaMaskOnboarding from "@metamask/onboarding"
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
			const onboarding = new MetaMaskOnboarding()
			onboarding.startOnboarding()
			return
		}
		setIsProcessing(true)
		if (onClick) {
			onClick()
		}
		try {
			const URLParam = new URLSearchParams(window.location.search)
			let source = ""
			let host = ""
			if (URLParam.get("hangar")) source = "hangar"
			else if (URLParam.get("website")) {
				source = "website"
				host = URLParam.get("host") || ""
			}

			const resp = await loginMetamask(source, host)
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
