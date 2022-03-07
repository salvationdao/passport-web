import { useCallback, useMemo, useState } from "react"
import { useHistory } from "react-router-dom"
import { AuthContainer } from "../containers"
import { useSnackbar } from "../containers/snackbar"
import { MetaMaskState, useWeb3 } from "../containers/web3"

interface MetaMaskLoginButtonRenderProps {
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	metaMaskState: MetaMaskState
	isProcessing: boolean
	errorMessage: string | null
}

interface LoginMetaMaskProps {
	publicSale?: boolean
	onFailure?: (err: string) => void
	onClick?: () => Promise<boolean> // return false to stop login
	render: (props: MetaMaskLoginButtonRenderProps) => JSX.Element
}

export const MetaMaskLogin: React.VoidFunctionComponent<LoginMetaMaskProps> = ({ publicSale, onFailure, onClick, render }) => {
	const { loginMetamask, loginWalletConnect } = AuthContainer.useContainer()
	const { metaMaskState } = useWeb3()
	const { displayMessage } = useSnackbar()
	const history = useHistory()
	const [isProcessing, setIsProcessing] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const click = useCallback(async () => {
		if (typeof (window as any).ethereum === "undefined" || typeof (window as any).web3 === "undefined") {
			try {
				displayMessage("Please refer to your wallet for authentication")
				const resp = await loginWalletConnect()
				if (!resp || !resp.is_new) return
				!publicSale && history.push("/onboarding?skip_username=true")
			} catch (e) {
				setIsProcessing(false)
				if (onFailure) {
					onFailure(typeof e === "string" ? e : "Something went wrong, please try again.")
				}
			}
		} else {
			setIsProcessing(true)
			if (onClick && !(await onClick())) return

			try {
				const resp = await loginMetamask()
				if (!resp || !resp.is_new) {
					setErrorMessage("There was a problem logging you in. Your account may be disabled, please contact support.")
					setIsProcessing(false)
					return
				}
				setIsProcessing(false)
				!publicSale && history.push("/onboarding?skip_username=true")
			} catch (e: any) {
				setIsProcessing(false)
				if (onFailure) {
					if (typeof e === "string") {
						onFailure(e)
						setErrorMessage(e)
						return
					}
					//checking metamask error signature and setting error
					if (e.code && typeof e.message === "string") {
						onFailure(e.message)
						setErrorMessage(e.message)
						return
					}
					onFailure("Something went wrong, please try again.")
				}
			}
			return
		}

		setIsProcessing(false)
	}, [onFailure, history, loginMetamask, onClick, loginWalletConnect, publicSale, displayMessage])

	const propsForRender = useMemo(
		() => ({
			onClick: click,
			errorMessage: errorMessage,
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
