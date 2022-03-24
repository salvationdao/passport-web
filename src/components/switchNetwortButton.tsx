import { useCallback, useEffect } from "react"
import { ETHEREUM_CHAIN_ID } from "../config"
import { colors } from "../theme"
import { FancyButton } from "./fancyButton"

interface SwitchNetworkButtonProps {
	open: boolean
	currentChainId: number | undefined
	changeChain: (chain: number) => Promise<void>
	setError: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const SwitchNetworkButton = ({ open, currentChainId, changeChain, setError }: SwitchNetworkButtonProps) => {
	const changeChainToETH = useCallback(async () => {
		if (!currentChainId) return
		if (open && currentChainId.toString() !== ETHEREUM_CHAIN_ID) {
			await changeChain(parseInt(ETHEREUM_CHAIN_ID, 0))
		}
	}, [currentChainId, changeChain, open])

	useEffect(() => {
		changeChainToETH()
	}, [changeChainToETH])
	return (
		<FancyButton
			borderColor={colors.darkGrey}
			onClick={async () => {
				try {
					await changeChainToETH()
					setError(undefined)
				} catch (e) {
					setError("Error switching network")
				}
			}}
		>
			Switch Network
		</FancyButton>
	)
}
