import React from "react"
import { MetaMaskIcon, WalletConnectIcon } from "../../../../assets"
import { useAuth } from "../../../../containers/auth"
import { useSnackbar } from "../../../../containers/snackbar"
import { useWeb3 } from "../../../../containers/web3"
import { usePassportCommandsUser } from "../../../../hooks/usePassport"
import HubKey from "../../../../keys"
import { User } from "../../../../types/types"
import { ConnectionButton } from "./ConnectionButton"

export const Wallet: React.FC = () => {
	const { connect, wcConnect, sign, setDisableWalletModal, wcSignature, signWalletConnect } = useWeb3()
	const { user, setUser } = useAuth()
	const { displayMessage } = useSnackbar()
	const { send } = usePassportCommandsUser("/commander")

	if (!user) {
		return null
	}

	return (
		<ConnectionButton
			handleClick={async () => {
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
						signature = await sign(user.id)
					}
					if (signature === undefined) {
						throw Error("No signature was found in process.")
					}
					const resp = await send<User>(HubKey.UserAddWallet, {
						id: user.id,
						public_address: acc,
						signature,
					})
					setUser(resp)
					displayMessage("Wallet connected to account.", "success")
				} catch (err: any) {
					console.error(err)
					displayMessage(err.message ? err.message : err, "error")
				} finally {
					setDisableWalletModal(false)
				}
			}}
			title="Connect Wallet"
			icon={typeof (window as any).ethereum === "undefined" || typeof (window as any).web3 === "undefined" ? WalletConnectIcon : MetaMaskIcon}
			value={user.public_address}
			disabled={!!user.public_address}
		/>
	)
}
