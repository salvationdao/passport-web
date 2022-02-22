import WalletConnectProvider from "@walletconnect/web3-provider"
import { BigNumber, ethers } from "ethers"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createContainer } from "unstated-next"
import BinanceCoin from "../assets/images/crypto/binance-coin-bnb-logo.svg"
import BinanceUSD from "../assets/images/crypto/binance-usd-busd-logo.svg"
import Ethereum from "../assets/images/crypto/ethereum-eth-logo.svg"
import Usdc from "../assets/images/crypto/usd-coin-usdc-logo.svg"
import {
	BINANCE_CHAIN_ID,
	BSC_SCAN_SITE,
	BUSD_CONTRACT_ADDRESS,
	ETHEREUM_CHAIN_ID,
	ETH_SCAN_SITE,
	PURCHASE_ADDRESS,
	SUPS_CONTRACT_ADDRESS,
	USDC_CONTRACT_ADDRESS,
	WALLET_CONNECT_RPC,
	SIGN_MESSAGE,
} from "../config"
import { GetNonceResponse } from "../types/auth"
import { tokenSelect } from "../types/types"
import { useSnackbar } from "./snackbar"
import { genericABI } from "./web3GenericABI"

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

export enum web3Constants {
	ethereumChainId = 1,
	binanceChainId = 56,
	goerliChainId = 5,
	bscTestNetChainId = 97,
	totalSaleSups = 217000000,
}

const tokenOptions: tokenSelect[] = [
	{
		name: "eth",
		networkName: "Ethereum",
		chainId: parseInt(ETHEREUM_CHAIN_ID),
		scanSite: ETH_SCAN_SITE,
		tokenSrc: Ethereum,
		chainSrc: Ethereum,
		isNative: true,
		contractAddr: "0x0",
	},
	{
		name: "usdc",
		networkName: "Ethereum",
		chainId: parseInt(ETHEREUM_CHAIN_ID),
		scanSite: ETH_SCAN_SITE,
		tokenSrc: Usdc,
		chainSrc: Ethereum,
		isNative: false,
		contractAddr: USDC_CONTRACT_ADDRESS,
	},
	{
		name: "bnb",
		networkName: "Binance",
		chainId: parseInt(BINANCE_CHAIN_ID),
		scanSite: BSC_SCAN_SITE,
		tokenSrc: BinanceCoin,
		chainSrc: BinanceCoin,
		isNative: true,
		contractAddr: "0x0",
	},

	{
		name: "busd",
		networkName: "Binance",
		chainId: parseInt(BINANCE_CHAIN_ID),
		scanSite: BSC_SCAN_SITE,
		tokenSrc: BinanceUSD,
		chainSrc: BinanceCoin,
		isNative: false,
		contractAddr: BUSD_CONTRACT_ADDRESS,
	},
]

/**
 * A Container that handles Web3
 */
export const Web3Container = createContainer(() => {
	const { displayMessage } = useSnackbar()
	const [block, setBlock] = useState<number>(-1)
	const [metaMaskState, setMetaMaskState] = useState<MetaMaskState>(MetaMaskState.NotInstalled)
	const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
	const [wcProvider, setWcProvider] = useState<WalletConnectProvider | undefined>()
	const [account, setAccount] = useState<string>()
	const [currentChainId, setCurrentChainId] = useState<number>()
	const [supBalance, setSupBalance] = useState<BigNumber>()
	const [currentToken, setCurrentToken] = useState<tokenSelect>(tokenOptions[0])
	const [nativeBalance, setNativeBalance] = useState<BigNumber | null>(null)
	const [stableBalance, setStableBalance] = useState<BigNumber | null>(null)

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
		const updateNativeBalance = async () => {
			try {
				if (!provider) {
					return
				}
				if (!currentChainId) {
					return
				}
				if (!account) {
					return
				}
				const signer = provider.getSigner()
				if (!signer) {
					return
				}
				const bal = await signer.getBalance()
				if (!bal) {
					setStableBalance(BigNumber.from(0))
					return
				}
				setNativeBalance(bal)
			} catch (e) {
				console.error(e)
			}
		}
		// console.log({ provider, wcProvider, currentChainId })
		const updateStableBalance = async () => {
			try {
				if (!provider) {
					return
				}
				if (!currentChainId) {
					return
				}
				if (!account) {
					return
				}
				let erc20Addr = USDC_CONTRACT_ADDRESS
				if (currentChainId === web3Constants.binanceChainId || currentChainId === web3Constants.bscTestNetChainId) {
					erc20Addr = BUSD_CONTRACT_ADDRESS
				}
				console.log({ currentChainId, erc20Addr })
				const contract = new ethers.Contract(erc20Addr, genericABI, provider)
				const bal = await contract.balanceOf(account)
				if (!bal) {
					setStableBalance(BigNumber.from(0))
					return
				}
				setStableBalance(bal)
			} catch (e) {
				console.error(e)
			}
		}
		updateNativeBalance()
		updateStableBalance()
	}, [provider, currentChainId, account])

	const handleChainChange = useCallback((chainId: string) => {
		setCurrentChainId(parseInt(chainId))
	}, [])

	// docs: https://docs.ethers.io/v5/api/contract/example/#example-erc-20-contract--connecting-to-a-contract
	const handleWalletSups = useCallback(
		async (acc: string) => {
			if (!provider) {
				return
			}
			if (!currentChainId) {
				return
			}
			if (currentChainId.toString() !== BINANCE_CHAIN_ID) {
				return
			}
			console.log("get wallet sups")
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

			const erc20 = new ethers.Contract(SUPS_CONTRACT_ADDRESS, abi, provider)
			try {
				console.log("loading")
				const bal = await erc20.balanceOf(acc)
				if (!bal) {
					setSupBalance(BigNumber.from(0))
					return
				}
				console.log("loaded")
				console.log({ bal })
				setSupBalance(bal)
			} catch (e) {
				setSupBalance(BigNumber.from(0))
				console.error(e)
			}
		},
		[provider, currentChainId],
	)

	useEffect(() => {
		if (!account) return
		handleWalletSups(account)
	}, [account, handleWalletSups])

	const createWcProvider = useCallback(async (showQrCode: boolean = true) => {
		//  Create WalletConnect Provider
		const walletConnectProvider = new WalletConnectProvider({
			rpc: {
				1: `https://speedy-nodes-nyc.moralis.io/${WALLET_CONNECT_RPC}/eth/mainnet`,
				5: `https://speedy-nodes-nyc.moralis.io/${WALLET_CONNECT_RPC}/eth/goerli`,
				56: `https://speedy-nodes-nyc.moralis.io/${WALLET_CONNECT_RPC}/bsc/mainnet`,
				97: `https://speedy-nodes-nyc.moralis.io/${WALLET_CONNECT_RPC}/bsc/testnet`,
			},
			qrcode: showQrCode,
		})

		//  Wrap with Web3Provider from ethers.js
		const web3Provider = new ethers.providers.Web3Provider(walletConnectProvider)
		setProvider(web3Provider)
		setCurrentChainId(walletConnectProvider.chainId)
		setWcProvider(walletConnectProvider)

		// Subscribe to accounts change
		walletConnectProvider.on("accountsChanged", (accounts: string[]) => {
			if (accounts.length > 0) {
				setAccount(accounts[0])
				setMetaMaskState(MetaMaskState.Active)
			}
		})
		// Subscribe to chainId change
		walletConnectProvider.on("chainChanged", (chainId: number) => {
			setCurrentChainId(chainId)
		})
		// Subscribe to session disconnection
		walletConnectProvider.on("disconnect", (code: number, reason: string) => {
			setAccount(undefined)
			setProvider(undefined)
			setWcProvider(undefined)
			setMetaMaskState(MetaMaskState.NotInstalled)
		})
		return walletConnectProvider
	}, [])

	useEffect(() => {
		// Run on every new block
		if (provider && provider.listeners("block").length === 0) {
			provider.on("block", function (result) {
				setBlock(result)
				if (account) handleWalletSups(account)
			})
		}
	}, [provider, account, handleWalletSups])

	useEffect(() => {
		if (provider) return // metamask connected
		;(async () => {
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

				const response = await provider.getNetwork()
				setCurrentChainId(response.chainId)
			} else {
				const walletConnectProvider = await createWcProvider(false)
				await walletConnectProvider.enable()
				return () => walletConnectProvider.removeAllListeners()
			}
		})()

		return () => {
			if ((window as any).ethereum) (window as any).ethereum.removeAllListeners()
		}
	}, [provider, handleAccountChange, handleChainChange, createWcProvider])

	// const checkNeoBalance = useCallback(
	// 	async (addr: string, setShowGame?: (value: React.SetStateAction<boolean>) => void) => {
	// 		const NTABI = ["function balanceOf(address) view returns (uint256)"]
	// 		if (provider) {
	// 			const NTContract = new ethers.Contract("0xb668beb1fa440f6cf2da0399f8c28cab993bdd65", NTABI, provider)
	// 			const bal: BigNumber = await NTContract.balanceOf(addr)
	// 			if (parseInt(bal.toString()) > 0) {
	// 				try {
	// 					await fetch(`https://stories.supremacy.game/api/users/${account}`, {
	// 						method: "POST",
	// 					})
	// 					await fetch(`https://stories.supremacy.game/api/users/neo/${account}`, {
	// 						method: "PUT",
	// 					})
	// 					if (setShowGame) {
	// 						setShowGame(true)
	// 					}
	// 				} catch (error) {
	// 					console.error()
	// 				}
	// 			} else {
	// 				if (setShowGame) {
	// 					setShowGame(true)
	// 				}
	// 			}
	// 		}
	// 	},
	// 	[provider],
	// )
	const connect = useCallback(
		async (setShowGame?: (value: React.SetStateAction<boolean>) => void) => {
			if (provider) {
				try {
					await provider.send("eth_requestAccounts", [])
					const signer = provider.getSigner()
					const acc = await signer.getAddress()
					// Check if account is whitelisted if not return
					setAccount(acc)
					handleAccountChange([acc])
				} catch (error) {
					if (error instanceof Error) displayMessage(error.message, "error")
					else displayMessage("Please authenticate your wallet.", "info")
				}
			}
		},
		[displayMessage, provider, handleAccountChange],
	)

	const wcConnect = useCallback(
		async (setShowGame?: (value: React.SetStateAction<boolean>) => void) => {
			let walletConnectProvider
			try {
				walletConnectProvider = await createWcProvider()
				await walletConnectProvider.enable()
				const connector = await walletConnectProvider.getWalletConnector()
				const acc = connector.accounts[0]
				setAccount(acc)
				if (setShowGame) setShowGame(true)
				return { walletConnectProvider }
			} catch (error) {
				await walletConnectProvider?.disconnect()
			}
		},
		[createWcProvider],
	)

	const ETHEREUM_NETWORK: AddEthereumChainParameter = useMemo(
		() => ({
			chainId: "0x01",
			chainName: "Ethereum Mainnet",
			nativeCurrency: {
				name: "Ethereum",
				symbol: "ETH",
				decimals: 18,
			},
			rpcUrls: ["https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
			blockExplorerUrls: ["https://etherscan.io"],
		}),
		[],
	)

	const BINANCE_NETWORK: AddEthereumChainParameter = useMemo(
		() => ({
			chainId: "0x38",
			chainName: "Binance Smart Chain Mainnet",
			nativeCurrency: {
				name: "Binance Coin",
				symbol: "BNB",
				decimals: 18,
			},
			rpcUrls: ["https://bsc-dataseed1.ninicoin.io"],
			blockExplorerUrls: ["https://bscscan.com/"],
		}),
		[],
	)

	const BINANCE_TEST_NETWORK: AddEthereumChainParameter = useMemo(
		() => ({
			chainId: "0x61",
			chainName: "BSC Testnet",
			nativeCurrency: {
				name: "Binance Coin",
				symbol: "BNB",
				decimals: 18,
			},
			rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
			blockExplorerUrls: ["https://explorer.binance.org/smart-testnet"],
		}),
		[],
	)

	const GOERLI_TEST_NETWORK: AddEthereumChainParameter = useMemo(
		() => ({
			chainId: "0x5",
			chainName: "Goerli Test Network",
			nativeCurrency: {
				name: "Ethereum",
				symbol: "ETH",
				decimals: 18,
			},
			rpcUrls: ["https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
			blockExplorerUrls: ["https://goerli.etherscan.io"],
		}),
		[],
	)

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
			let nonce: string
			if (userID) {
				nonce = await getNonceFromID(userID)
			} else {
				nonce = await getNonce(acc)
			}
			if (nonce === "") return ""
			return await signer.signMessage(`${SIGN_MESSAGE}:\n ${nonce}`)
		},
		[provider, getNonce, getNonceFromID],
	)

	const signWalletConnect = useCallback(
		async (userID?: string): Promise<string> => {
			await wcConnect()
			if (wcProvider) {
				const connector = await wcProvider.getWalletConnector()
				let nonce: string
				if (userID) {
					nonce = await getNonceFromID(userID)
				} else if (account) {
					nonce = await getNonce(account)
				} else return ""
				if (nonce === "") return ""
				const rawMessage = `${SIGN_MESSAGE}:\n ${nonce}`
				const rawMessageLength = new Blob([rawMessage]).size
				const convertMsg = ethers.utils.toUtf8Bytes("\x19Ethereum Signed Message:\n" + rawMessageLength + rawMessage)
				const signMsg = ethers.utils.keccak256(convertMsg)
				const signature = await connector.signMessage([account, signMsg])
				return signature
			} else return ""
		},
		[wcProvider, getNonce, getNonceFromID, account, wcConnect],
	)

	const changeChain = async (chain: number) => {
		if (!provider) return

		if (typeof (window as any).ethereum === "undefined" || typeof (window as any).web3 === "undefined") {
			if (wcProvider) await wcProvider.disconnect()
			await createWcProvider()
		} else {
			try {
				await provider.send("wallet_switchEthereumChain", [{ chainId: `0x${chain.toString(16)}` }])
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
				await provider.send("wallet_addEthereumChain", [chainParams])
			}
		}
	}

	async function sendNativeTransfer(value: BigNumber) {
		try {
			if (!provider || !account) {
				displayMessage("Wallet is not connected.", "error")
				return
			}
			const signer = provider.getSigner()
			const bal = await signer.getBalance()
			const hasSufficientFunds = bal.gt(value)
			if (hasSufficientFunds) {
				return await signer.sendTransaction({ to: PURCHASE_ADDRESS, value: value })
			} else {
				displayMessage("Wallet does not have sufficient funds.", "error")
				return
			}
		} catch (error) {
			displayMessage("Something went wrong, please try again.", "error")
			throw error
		}
	}
	async function sendTransferToPurchaseAddress(contractAddress: string, value: BigNumber) {
		try {
			if (!provider || !account) {
				displayMessage("Wallet is not connected.", "error")
				return
			}
			const signer = provider.getSigner()
			const contract = new ethers.Contract(contractAddress, genericABI, signer)

			const hasSufficientFunds = await contract.callStatic.transfer(signer.getAddress(), value)

			if (hasSufficientFunds) {
				return await contract.transfer(PURCHASE_ADDRESS, value)
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
		block,
		connect,
		metaMaskState,
		sign,
		account,
		changeChain,
		currentChainId,
		provider,
		nativeBalance,
		stableBalance,
		sendNativeTransfer,
		sendTransferToPurchaseAddress,
		supBalance,
		wcConnect,
		signWalletConnect,
		tokenOptions,
		currentToken,
		setCurrentToken,
	}
})

export const Web3Provider = Web3Container.Provider
export const useWeb3 = Web3Container.useContainer
