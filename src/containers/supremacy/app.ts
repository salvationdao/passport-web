import { AlertColor } from "@mui/material/Alert"
import { useCallback, useEffect, useState } from "react"
import { createContainer } from "unstated-next"
import { useWeb3 } from "../web3"

export interface UserDataStoriesApi {
	Address: string
	RedM: number
	Zaibat: number
	Boston: number
	Deaths: number
}

function useAppState(initialState = {}) {
	const { account } = useWeb3()
	const [saleActive, setSaleActive] = useState(process.env.REACT_APP_SALE_ACTIVE == "true" ? true : false)
	const [loading, setLoading] = useState(true)
	// Check Whitelist
	const [isAlphaCitizen, setIsAlphaCitizen] = useState(false)
	const [isWhitelisted, setIsWhiteListed] = useState(false)
	const checkIsWhiteListed = (data: UserDataStoriesApi) => {
		if (data.Boston > 0 || data.RedM > 0 || data.Zaibat > 0) {
			setIsAlphaCitizen(true)
			return true
		} else if (data.Deaths > 0) {
			setIsAlphaCitizen(false)
			return true
		} else {
			setIsAlphaCitizen(false)
			return false
		}
	}

	useEffect(() => {
		if (account) {
			;(async () => {
				try {
					const response = await fetch(`https://stories.supremacy.game/api/users/${account}`)
					const data = (await response.clone().json()) as UserDataStoriesApi
					setIsWhiteListed(checkIsWhiteListed(data))
				} catch (error) {
					setIsWhiteListed(false)
					console.log(error)
				}
			})()
		}
	}, [account])

	return {
		isAlphaCitizen,
		isWhitelisted,
		saleActive,
		setSaleActive,
		loading,
		setLoading,
	}
}

let AppState = createContainer(useAppState)

function useSnackState() {
	const [snackMessage, setSnackMessage] = useState<{
		message: string
		severity: AlertColor
	} | null>(null)

	return { setSnackMessage, snackMessage }
}
let SnackState = createContainer(useSnackState)

export { SnackState, AppState }
