import { useCallback, useMemo, useState } from "react"
import { AuthContainer } from "../containers"
import { useSnackbar } from "../containers/snackbar"
import { useWeb3 } from "../containers/web3"

interface MetaMaskLoginButtonRenderProps {
	onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
	isProcessing: boolean
	errorMessage: string | null
}
interface WalletConnectProps {
	onFailure?: (err: string) => void
	onClick?: () => void // return false to stop login
	render: (props: MetaMaskLoginButtonRenderProps) => JSX.Element
}

export const WalletConnectLogin: React.VoidFunctionComponent<WalletConnectProps> = ({ onFailure, onClick, render }) => {
	const { loginWalletConnect } = AuthContainer.useContainer()
	const { metaMaskState } = useWeb3()
	const { displayMessage } = useSnackbar()
	const [isProcessing, setIsProcessing] = useState(false)
	const [errorMessage] = useState<string | null>(null)

	const click = useCallback(async () => {
		if (onClick) {
			onClick()
		}
		try {
			displayMessage("Please refer to your wallet for authentication")
			const resp = await loginWalletConnect()
			if (!resp || !resp.payload) return
		} catch (e) {
			setIsProcessing(false)
			if (onFailure) {
				onFailure(typeof e === "string" ? e : "Something went wrong, please try again.")
			}
		}

		setIsProcessing(false)
	}, [onFailure, onClick, loginWalletConnect, displayMessage])

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
		throw new Error("WalletConnect login requires a render prop to render")
	}

	return render(propsForRender)
}
