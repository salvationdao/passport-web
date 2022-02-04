import MetaMaskOnboarding from "@metamask/onboarding"
import { MetaMaskIcon } from "../assets"
import { AuthContainer } from "../containers"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { FancyButton, FancyButtonProps } from "./fancyButton"

interface LoginMetaMaskProps extends FancyButtonProps {
	signUp?: {
		username: string
	}
	onFailure?: (err: string) => void
	onClick?: () => Promise<boolean> // return false to stop login
}

export const LoginMetaMask: React.FC<LoginMetaMaskProps> = ({ signUp, onFailure, onClick, ...props }) => {
	const { loginMetamask, signUpMetamask } = AuthContainer.useContainer()
	const { metaMaskState, connect } = useWeb3()

	return (
		<>
			<FancyButton
				onClick={async () => {
					if (metaMaskState === MetaMaskState.NotLoggedIn) {
						await connect()
						return
					}
					if (metaMaskState === MetaMaskState.Active) {
						if (onClick && !(await onClick())) return

						try {
							if (signUp) {
								// If signup
								await signUpMetamask(signUp.username)
							} else {
								//  If login
								await loginMetamask()
							}
						} catch (e) {
							if (onFailure) {
								onFailure(typeof e === "string" ? e : "Something went wrong, please try again.")
							}
						}
						return
					}
					const onboarding = new MetaMaskOnboarding()
					onboarding.startOnboarding()
				}}
				title={
					metaMaskState === MetaMaskState.NotInstalled
						? "Install MetaMask"
						: metaMaskState === MetaMaskState.NotLoggedIn
						? "Sign into your MetaMask to continue"
						: "Login With MetaMask"
				}
				startIcon={<MetaMaskIcon />}
				{...props}
			>
				{metaMaskState === MetaMaskState.NotInstalled
					? "Install MetaMask"
					: metaMaskState === MetaMaskState.NotLoggedIn
					? "Connect and sign into your MetaMask to continue"
					: signUp
					? "Sign up with MetaMask"
					: "Login With MetaMask"}
			</FancyButton>
		</>
	)
}
