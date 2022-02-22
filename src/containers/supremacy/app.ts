import { AlertColor } from "@mui/material/Alert"
import { BigNumber } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { createContainer } from "unstated-next"
import { useWeb3 } from "../web3"

export interface UserWhitelistApi {
	type: "unregistered" | "registered"
	can_enter: boolean
	time: Date
}

function useAppState(initialState = {}) {
	const [saleActive, setSaleActive] = useState(process.env.REACT_APP_SALE_ACTIVE == "true" ? true : false)
	const [loading, setLoading] = useState(true)
	// Check Whitelist
	const [isWhitelisted, setIsWhitelisted] = useState(false)
	const [amountRemaining, setAmountRemaining] = useState<BigNumber>(BigNumber.from(0))
	const [showSimulation, setShowSimulation] = useState(false)

	const checkWhitelist = useCallback(
		async (account: string): Promise<boolean> => {
			if (true === true) return true
			try {
				const response = await fetch(`https://stories.supremacy.game/api/whitelist/${account}`)
				const data = (await response.clone().json()) as UserWhitelistApi
				return data.can_enter
			} catch (error) {
				setIsWhitelisted(false)
				console.log(error)
				return false
			}
		},
		[setIsWhitelisted],
	)

	return {
		checkWhitelist,
		setIsWhitelisted,
		isWhitelisted,
		saleActive,
		setSaleActive,
		loading,
		setLoading,
		amountRemaining,
		setAmountRemaining,
		showSimulation,
		setShowSimulation,
	}
}

let AppState = createContainer(useAppState)

export const SupremacyAppProvider = AppState.Provider
export const useSupremacyApp = AppState.useContainer

export { AppState }
