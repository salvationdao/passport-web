import { SxProps } from "@mui/material"
import { MetaMaskIcon, WalletConnectIcon } from "../assets"
import { useAuth } from "../containers/auth"
import { useSnackbar } from "../containers/snackbar"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { usePassportCommandsUser } from "../hooks/usePassport"
import HubKey from "../keys"
import { colors } from "../theme"
import { User } from "../types/types"
import { FancyButton } from "./fancyButton"

interface IConnectWalletProps {
	replaceText?: string
	setCancelAddWallet?: React.Dispatch<React.SetStateAction<boolean>>
	sx?: SxProps
}

export const ConnectWallet: React.FC<IConnectWalletProps> = ({ replaceText, sx, setCancelAddWallet }) => {
	const { connect, wcConnect, sign, setDisableWalletModal, wcSignature, signWalletConnect, metaMaskState } = useWeb3()
	const { user, setUser } = useAuth()
	const { displayMessage } = useSnackbar()
	const { send } = usePassportCommandsUser("/commander")

	if (!user) {
		return null
	}

	return (
		<FancyButton
			sx={{
				background: colors.darkNavyBackground,
				...sx,
			}}
			onClick={async () => {
				try {
					setDisableWalletModal(true)
					let acc: string | undefined, signature: string | undefined
					if (typeof (window as any).ethereum === "undefined" || typeof (window as any).web3 === "undefined") {
						acc = await wcConnect()
						if (wcSignature) {
							signature = wcSignature
						} else {
							await signWalletConnect()
						}
					} else {
						acc = await connect()
						const resp = await sign(user.id)
						signature = resp?.signature
					}
					if (signature === undefined) {
						throw Error("No signature was found in process.")
					}
					const resp = await send<User>(HubKey.UserAddWallet, {
						id: user.id,
						username: user.username,
						signature,
						public_address: acc,
					})
					if (!resp.id) {
						throw resp
					}
					setUser(resp)
					displayMessage("Wallet connected to account.", "success")
				} catch (err: any) {
					console.error(err)
					displayMessage(err.message ? err.message : err, "error")
					setCancelAddWallet && setCancelAddWallet(true)
				} finally {
					setDisableWalletModal(false)
				}
			}}
			title="Connect Wallet to account"
			startIcon={replaceText ? null : metaMaskState === MetaMaskState.NotInstalled ? <WalletConnectIcon /> : <MetaMaskIcon />}
			fullWidth
		>
			{replaceText ? replaceText : "	Connect Wallet to account"}
		</FancyButton>
	)
}
