import MetaMaskOnboarding from "@metamask/onboarding"
import { useCallback, useMemo, useState } from "react"
import { useHistory } from "react-router-dom"
import { AuthContainer } from "../containers"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { IConnector } from "@walletconnect/types"
import { useSnackbar } from "../containers/snackbar"

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
	const { loginMetamask, loginWalletConnect } = AuthContainer.useContainer()
	const { metaMaskState, connect } = useWeb3()
	const { displayMessage } = useSnackbar()
	const history = useHistory()
	const [isProcessing, setIsProcessing] = useState(false)

	const click = useCallback(async () => {
		if (typeof (window as any).ethereum === "undefined" || typeof (window as any).web3 === "undefined") {
			try {
				displayMessage("Please refer to your wallet for authentication")
				const resp = await loginWalletConnect()
				if (!resp || !resp.isNew) return
				history.push("/onboarding?skip_username=true")
			} catch (e) {
				if (onFailure) {
					onFailure(typeof e === "string" ? e : "Something went wrong, please try again.")
				}
			}
		}
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

		setIsProcessing(false)
	}, [onFailure, history, loginMetamask, metaMaskState, onClick, connect, loginWalletConnect])

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
