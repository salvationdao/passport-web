import { AlertColor } from "@mui/material/Alert"
import { BigNumber, ethers } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { createContainer } from "unstated-next"
import { supFormatter } from "../helpers/items"
import { GetNonceResponse } from "../types/auth"
import { genericABI } from "./web3GenericABI"
import { REACT_APP_PURCHASE_ADDRESS } from "../config"
import { useSnackbar } from "../containers/snackbar"

export enum MetaMaskState {
	NotInstalled,
	NotLoggedIn,
	Active,
}

interface AddEthereumChainParameter {
	chainId: string // A 0x-prefixed hexadecimal string
	chainName: string
	nativeCurrency: {
		name: string
		symbol: string // 2-6 characters long
		decimals: 18
	}
	rpcUrls: string[]
	blockExplorerUrls?: string[]
	iconUrls?: string[] // Currently ignored.
}

/**
 * A Container that handles Web3
 */
export const Web3Container = createContainer(() => {
	const { displayMessage } = useSnackbar()

	const [metaMaskState, setMetaMaskState] = useState<MetaMaskState>(MetaMaskState.NotInstalled)
	const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
	const [account, setAccount] = useState<string>()
	const [currentChainId, setCurrentChainId] = useState<null | number>(null)
	const [supBalance, setSupBalance] = useState<string>()

	enum web3Constants {
		ethereumChainId = 1,
		binanceChainId = 56,
		goerliChainId = 5,
		bscTestNetChainId = 97,
		supsToUsdConversion = 0.12,
		ethToUsdConversion = 2500,
		bnbToUsdConversion = 375,
		totalSaleSups = 217000000,
	}

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

	const handleChainChange = useCallback((chainId: string) => {
		setCurrentChainId(parseInt(chainId))
	}, [])

	// docs: https://docs.ethers.io/v5/api/contract/example/#example-erc-20-contract--connecting-to-a-contract
	const handleWalletSups = useCallback(
		async (acc: string) => {
			// SUPS token address
			const supTokenAddr = "0xED4664f5F37307abf8703dD39Fd6e72F421e7DE2"

			// A Human-Readable ABI; for interacting with the contract, we
			// must include any fragment we wish to use
			const abi = [
				// Read-Only Functions
				"function balanceOf(address owner) view returns (uint256)",
				"function decimals() view returns (uint8)",
				"function symbol() view returns (string)",

				// Authenticated Functions
				"function transfer(address to, uint amount) returns (bool)",

				// Events
				"event Transfer(address indexed from, address indexed to, uint amount)",
			]

			const erc20 = new ethers.Contract(supTokenAddr, abi, provider)
			let bal: { _hex: string } = { _hex: "" }

			try {
				bal = await erc20.balanceOf(acc)
			} catch (e) {
				console.log(e)
				bal = { _hex: "0" }
			}

			setSupBalance(supFormatter(bal._hex))
		},
		[provider],
	)

	useEffect(() => {
		if (!account) return
		handleWalletSups(account)
	}, [account, handleWalletSups])

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
				if ((window as any).ethereum) {
					;(window as any).ethereum.on("accountsChanged", handleAccountChange)
					;(window as any).ethereum.on("chainChanged", handleChainChange)
				}
				if (provider && currentChainId === null) {
					const response = await provider.getNetwork()
					let chainId = response.chainId
					setCurrentChainId(chainId)
				}
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
	}, [provider, handleAccountChange, handleChainChange])

	const connect = async () => {
		if (provider) {
			try {
				await provider.send("eth_requestAccounts", [])
				const signer = provider.getSigner()
				const acc = await signer.getAddress()
				setAccount(acc)
			} catch (error) {
				displayMessage("Something went wrong, please try again.", "error")
			}
		}
	}

	const ETHEREUM_NETWORK: AddEthereumChainParameter = {
		chainId: "0x01",
		chainName: "Ethereum Mainnet",
		nativeCurrency: {
			name: "Ethereum",
			symbol: "ETH",
			decimals: 18,
		},
		rpcUrls: ["https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
		blockExplorerUrls: ["https://etherscan.io"],
	}

	const BINANCE_NETWORK: AddEthereumChainParameter = {
		chainId: "0x38",
		chainName: "Binance Smart Chain Mainnet",
		nativeCurrency: {
			name: "Binance Coin",
			symbol: "BNB",
			decimals: 18,
		},
		rpcUrls: ["https://bsc-dataseed1.ninicoin.io"],
		blockExplorerUrls: ["https://bscscan.com/"],
	}

	const BINANCE_TEST_NETWORK: AddEthereumChainParameter = {
		chainId: "0x61",
		chainName: "BSC Testnet",
		nativeCurrency: {
			name: "Binance Coin",
			symbol: "BNB",
			decimals: 18,
		},
		rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
		blockExplorerUrls: ["https://explorer.binance.org/smart-testnet"],
	}

	const GOERLI_TEST_NETWORK: AddEthereumChainParameter = {
		chainId: "0x5",
		chainName: "Goerli Test Network",
		nativeCurrency: {
			name: "Ethereum",
			symbol: "ETH",
			decimals: 18,
		},
		rpcUrls: ["https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
		blockExplorerUrls: ["https://goerli.etherscan.io"],
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

	const changeChain = async (chain: number) => {
		if (!!(window as any).ethereum) {
			try {
				await (window as any).ethereum.request({
					method: "wallet_switchEthereumChain",
					params: [{ chainId: `0x${chain.toString(16)}` }],
				})
			} catch (error) {
				let chainParams: AddEthereumChainParameter
				switch (chain) {
					case web3Constants.binanceChainId:
						chainParams = BINANCE_NETWORK
						break
					case web3Constants.bscTestNetChainId:
						chainParams = BINANCE_TEST_NETWORK
						break
					case web3Constants.ethereumChainId:
						chainParams = ETHEREUM_NETWORK
						break
					case web3Constants.goerliChainId:
						chainParams = GOERLI_TEST_NETWORK
						break

					default:
						displayMessage("Bad chain selected.", "error")
						return
				}
				await (window as any).ethereum.request({
					method: "wallet_addEthereumChain",
					params: [chainParams],
				})
			}
		} else {
			displayMessage("MetaMask is not installed. Please install MetaMask.", "warning")
		}
	}

	const getBalance = useCallback(
		async (contractAddress: string) => {
			try {
				if (!provider || !account || contractAddress === "") return

				const contract = new ethers.Contract(contractAddress, genericABI, provider)

				const bigNumBalance: BigNumber = await contract.balanceOf(account)
				const decimals = await contract.decimals()

				const userBalance = ethers.utils.formatUnits(bigNumBalance, decimals)

				return userBalance
			} catch (error) {
				console.log(error)
				displayMessage("Couldn't get contract balance, please try again.", "error")
			}
		},
		[genericABI, provider, account],
	)

	async function sendTransfer(contractAddress: string, value: number) {
		try {
			if (!provider || !account) {
				displayMessage("Wallet is not connected.", "error")
				return
			}
			const signer = provider.getSigner()
			const contract = new ethers.Contract(contractAddress, genericABI, signer)
			const decimals = await contract.decimals()

			const units = ethers.utils.parseUnits(value.toString(), decimals)
			const hasSufficientFunds = await contract.callStatic.transfer(signer.getAddress(), units)

			if (hasSufficientFunds) {
				const tx = await contract.transfer(REACT_APP_PURCHASE_ADDRESS, units)
				return tx
			} else {
				displayMessage("Wallet does not have sufficient funds.", "error")
				return
			}
		} catch (error) {
			displayMessage("Something went wrong, please try again.", "error")
			throw error
		}
	}

	return {
		connect,
		metaMaskState,
		sign,
		account,
		changeChain,
		currentChainId,
		provider,
		web3Constants,
		getBalance,
		sendTransfer,
		supBalance,
	}
})

export const Web3Provider = Web3Container.Provider
export const useWeb3 = Web3Container.useContainer
