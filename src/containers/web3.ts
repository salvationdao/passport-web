import { ethers } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { createContainer } from "unstated-next"
import { GetNonceResponse } from "../types/auth"

export enum MetaMaskState {
	NotInstalled,
	NotLoggedIn,
	Active,
}

/**
 * A Container that handles Web3
 */
export const Web3Container = createContainer(() => {
	const [metaMaskState, setMetaMaskState] = useState<MetaMaskState>(MetaMaskState.NotInstalled)
	const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
	const [account, setAccount] = useState<string>()

	const handleAccountChange = useCallback(
		(accounts: string[]) => {
			if (accounts[0]) {
				setAccount(accounts[0])
				setMetaMaskState(MetaMaskState.Active)
			} else {
				setAccount(undefined)
				setMetaMaskState(provider ? MetaMaskState.NotInstalled : MetaMaskState.NotLoggedIn)
			}
		},
		[provider],
	)

	useEffect(() => {
		// metamask connected
		const asyncFn = async () => {
			if (typeof (window as any).ethereum !== "undefined" || typeof (window as any).web3 !== "undefined") {
				const provider = new ethers.providers.Web3Provider((window as any).ethereum, "any")
				setProvider(provider)
				const accounts = await provider.listAccounts()
				if (accounts.length !== 0) {
					const signer = provider.getSigner()
					const acc = await signer.getAddress()
					setAccount(acc)
					setMetaMaskState(MetaMaskState.Active)
				} else {
					setMetaMaskState(MetaMaskState.NotLoggedIn)
				}
				if ((window as any).ethereum) (window as any).ethereum.on("accountsChanged", handleAccountChange)
			} else {
				setMetaMaskState(MetaMaskState.NotInstalled)
			}
		}
		if (window && !provider) {
			asyncFn()
		}

		return () => {
			if ((window as any).ethereum) (window as any).ethereum.removeAllListeners()
		}
	}, [provider, handleAccountChange])

	const connect = async () => {
		if (provider) {
			try {
				await provider.send("eth_requestAccounts", [])
				const signer = provider.getSigner()
				const acc = await signer.getAddress()
				setAccount(acc)
			} catch (error) {
				console.error(error)
			}
		} else {
			return
		}
	}

	const getNonce = useCallback(async (publicAddress: string): Promise<string> => {
		const resp = await fetch(`/api/get-nonce?public-address=${publicAddress}`)
		if (resp.status !== 200) {
			const err = await resp.json()
			throw (err as any).message
		}
		const jsn: GetNonceResponse = await resp.json()
		return jsn.nonce
	}, [])

	const getNonceFromID = useCallback(async (userId: string): Promise<string> => {
		const resp = await fetch(`/api/get-nonce?user-id=${userId}`)
		if (resp.status !== 200) {
			const err = await resp.json()
			throw (err as any).message
		}
		const jsn: GetNonceResponse = await resp.json()
		return jsn.nonce
	}, [])

	// Returns an empty string if user does not exist
	const sign = useCallback(
		async (userID?: string): Promise<string> => {
			if (!provider) return ""
			await provider.send("eth_requestAccounts", [])
			const signer = provider.getSigner()
			const acc = await signer.getAddress()
			setAccount(acc)
			let nonce = ""
			if (userID) {
				nonce = await getNonceFromID(userID)
			} else {
				nonce = await getNonce(acc)
			}
			if (nonce === "") return ""
			const msg = process.env.REACT_APP_PASSPORT_METAMASK_SIGN_MESSAGE || ""
			return await signer.signMessage(`${msg}:\n ${nonce}`)
		},
		[provider, getNonce, getNonceFromID],
	)

	return {
		connect,
		metaMaskState,
		sign,
		account,
	}
})

export const Web3Provider = Web3Container.Provider
export const useWeb3 = Web3Container.useContainer
