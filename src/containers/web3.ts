import { MultiCall } from "@indexed-finance/multicall"
import WalletConnectProvider from "@walletconnect/web3-provider"

import { TransactionResponse } from "@ethersproject/abstract-provider"
import { BigNumber, constants, ethers } from "ethers"
import { formatUnits, hexlify, Interface, parseUnits } from "ethers/lib/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createContainer } from "unstated-next"
import BinanceCoin from "../assets/images/crypto/binance-coin-bnb-logo.svg"
import BinanceUSD from "../assets/images/crypto/binance-usd-busd-logo.svg"
import Ethereum from "../assets/images/crypto/ethereum-eth-logo.svg"
import Usdc from "../assets/images/crypto/usd-coin-usdc-logo.svg"
import {
	API_ENDPOINT_HOSTNAME,
	BINANCE_CHAIN_ID,
	BSC_SCAN_SITE,
	BUSD_CONTRACT_ADDRESS,
	ETHEREUM_CHAIN_ID,
	ETH_SCAN_SITE,
	LP_TOKEN_ADDRESS,
	PURCHASE_ADDRESS,
	SIGN_MESSAGE,
	SUPS_CONTRACT_ADDRESS,
	USDC_CONTRACT_ADDRESS,
	WALLET_CONNECT_RPC,
} from "../config"
import { metamaskErrorHandling } from "../helpers/web3"
import { GetNonceResponse } from "../types/auth"
import { tokenSelect } from "../types/types"
import { useSnackbar } from "./snackbar"
import { genericABI } from "./web3GenericABI"

export interface FarmData {
	earned: BigNumber
	stakingBalance: BigNumber
	lpBalance: BigNumber
	yieldPercentage: number
	userRewardRate: BigNumber
	rewardRate: BigNumber
	periodFinish: BigNumber
}

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

interface EarlyContributorCheck {
	key: string
	value: boolean
	has_signed: boolean
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
		gasFee: 0.005,
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
		gasFee: 0.005,
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
		gasFee: 0.0002,
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
		gasFee: 0.0002,
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
	const [loadingAmountRemaining, setLoadingAmountRemaining] = useState<boolean>(true)
	const [wcSignature, setWcSignature] = useState<string | undefined>()
	const [wcNonce, setWcNonce] = useState<string | undefined>()
	const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>()
	const [disableWalletModal, setDisableWalletModal] = useState(false)

	useEffect(() => {
		if (!provider) return
		;(async () => {
			try {
				const signer = provider.getSigner()
				setSigner(signer)
			} catch (e) {
				setSigner(undefined)
			}
		})()
	}, [provider])

	const [nativeBalance, setNativeBalance] = useState<BigNumber | null>(null)
	const [stableBalance, setStableBalance] = useState<BigNumber | null>(null)

	const handleAccountChange = useCallback(
		(accounts: string[]) => {
			console.log(accounts, provider)
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
			try {
				const bal = await signer.getBalance()

				if (!bal) {
					setNativeBalance(BigNumber.from(0))
					return
				}
				setNativeBalance(bal)
			} catch (e) {
				console.error("updateNativeBalance:", e)
			}
		}
		const updateStableBalance = async () => {
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
			const contract = new ethers.Contract(erc20Addr, genericABI, provider)
			try {
				const bal = await contract.balanceOf(account)
				if (!bal) {
					setStableBalance(BigNumber.from(0))
					return
				}
				setStableBalance(bal)
			} catch (e) {
				console.error(`updateStableBalance (${erc20Addr}):`, e)
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
				const bal = await erc20.balanceOf(acc)
				if (!bal) {
					setSupBalance(BigNumber.from(0))
					return
				}
				setSupBalance(bal)
			} catch (e) {
				setSupBalance(BigNumber.from(0))
				console.error(e)
			}
		},
		[provider, currentChainId],
	)

	const getNonce = useCallback(async (publicAddress: string): Promise<string> => {
		const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/get-nonce?public-address=${publicAddress}`)
		if (resp.status !== 200) {
			const err = await resp.json()
			throw (err as any).message
		}
		const jsn: GetNonceResponse = await resp.json()
		return jsn.nonce
	}, [])

	const getNonceFromID = useCallback(async (userId: string): Promise<string> => {
		let endpoint = `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/get-nonce?user-id=${userId}`

		const resp = await fetch(endpoint)
		if (resp.status !== 200) {
			const err = await resp.json()
			throw (err as any).message
		}
		const jsn: GetNonceResponse = await resp.json()
		return jsn.nonce
	}, [])

	useEffect(() => {
		if (!account) return
		handleWalletSups(account)
	}, [account, handleWalletSups, block])

	const createWcProvider = useCallback(
		async (showQrCode: boolean = true) => {
			const acceptedWallets = ["metamask", "rainbow", "gnosis", "trust", "argent", "ledgerlive"]

			//  Create WalletConnect Provider
			const walletConnectProvider = new WalletConnectProvider({
				rpc: {
					1: `https://speedy-nodes-nyc.moralis.io/${WALLET_CONNECT_RPC}/eth/mainnet`,
					5: `https://speedy-nodes-nyc.moralis.io/${WALLET_CONNECT_RPC}/eth/goerli`,
					56: `https://speedy-nodes-nyc.moralis.io/${WALLET_CONNECT_RPC}/bsc/mainnet`,
					97: `https://speedy-nodes-nyc.moralis.io/${WALLET_CONNECT_RPC}/bsc/testnet`,
				},
				qrcode: showQrCode,
				qrcodeModalOptions: {
					mobileLinks: acceptedWallets,
					desktopLinks: acceptedWallets,
				},
			})

			//  Wrap with Web3Provider from ethers.js
			const web3Provider = new ethers.providers.Web3Provider(walletConnectProvider)
			setProvider(web3Provider)
			setCurrentChainId(walletConnectProvider.chainId)
			setWcProvider(walletConnectProvider)

			// Subscribe to connect
			walletConnectProvider.on("connect", async () => {
				const connector = await walletConnectProvider.getWalletConnector()
				const acc = connector.accounts[0]
				let nonce: string
				if (acc) {
					nonce = await getNonce(acc)
					setWcNonce(nonce)
				} else return ""
				if (nonce === "") return ""
				const rawMessage = `${SIGN_MESSAGE}:\n ${nonce}`
				const rawMessageLength = new Blob([rawMessage]).size
				const convertMsg = ethers.utils.toUtf8Bytes("\x19Ethereum Signed Message:\n" + rawMessageLength + rawMessage)
				const signMsg = ethers.utils.keccak256(convertMsg)
				const signature = await connector.signMessage([acc, signMsg])
				setWcSignature(signature)

				// Delete wallet connect token
				localStorage.removeItem("walletconnect")
			})

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
			// // Subscribe to session disconnection
			walletConnectProvider.on("disconnect", (code: number, reason: string) => {
				setAccount(undefined)
				setProvider(undefined)
				setWcProvider(undefined)
				setMetaMaskState(MetaMaskState.NotInstalled)
				localStorage.removeItem("token")
			})
			return walletConnectProvider
		},
		[getNonce],
	)

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
				setMetaMaskState(MetaMaskState.Active)
				const accounts = await provider.listAccounts()

				if (accounts.length !== 0) {
					const signer = provider.getSigner()
					const acc = await signer.getAddress()

					setAccount(acc)
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
				setWcProvider(walletConnectProvider)
				await walletConnectProvider.enable()
				return () => walletConnectProvider.removeAllListeners()
			}
		})()

		return () => {
			if ((window as any).ethereum) (window as any).ethereum.removeAllListeners()
		}
	}, [provider, handleAccountChange, handleChainChange, createWcProvider])

	const checkNeoBalance = useCallback(
		async (addr: string) => {
			try {
				const NTABI = ["function balanceOf(address) view returns (uint256)"]
				if (provider) {
					const NTContract = new ethers.Contract("0xb668beb1fa440f6cf2da0399f8c28cab993bdd65", NTABI, provider)
					const bal: BigNumber = await NTContract.balanceOf(addr)
					if (parseInt(bal.toString()) > 0) {
						try {
							await fetch(`https://stories.supremacy.game/api/users/${account}`, {
								method: "POST",
							})
							await fetch(`https://stories.supremacy.game/api/users/neo/${account}`, {
								method: "PUT",
							})
						} catch (error) {
							console.error()
						}
					} else return
				}
			} catch (err) {
				console.error(err)
			}
		},
		[provider, account],
	)
	const connect = useCallback(async (): Promise<string> => {
		if (provider) {
			try {
				await provider.send("eth_requestAccounts", [])
				const signer = provider.getSigner()
				const acc = await signer.getAddress()
				setAccount(acc)
				handleAccountChange([acc])
				return acc
			} catch (error: any) {
				if (error instanceof Error) displayMessage(error.message, "error")

				//getting MM error, but the "Please authenticate your wallet" might suffice as well
				if (error.code && error.message) {
					displayMessage(`${error.message}`, "error")
				} else displayMessage("Please authenticate your wallet.", "info")
			}
		}
		return ""
	}, [displayMessage, provider, handleAccountChange])

	const wcConnect = useCallback(async (): Promise<string | undefined> => {
		let walletConnectProvider
		try {
			walletConnectProvider = await createWcProvider()
			const connector = await walletConnectProvider.getWalletConnector()
			await walletConnectProvider.enable()
			const acc = connector.accounts[0]
			setAccount(acc)
			return acc
		} catch (error) {
			await walletConnectProvider?.disconnect()
		}
	}, [createWcProvider])

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

	// Returns an empty string if user does not exist
	const sign = useCallback(
		async (userID?: string): Promise<{ signature: string; nonce: string } | undefined> => {
			try {
				if (!provider) return
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
				if (nonce === "") return
				const signedMessage = await signer.signMessage(`${SIGN_MESSAGE}:\n ${nonce}`)
				return { signature: signedMessage, nonce }
			} catch (err) {
				console.error(err)
				return
			}
		},
		[provider, getNonce, getNonceFromID],
	)

	const signEarlyContributors = useCallback(
		async (
			name: string,
			phone: string,
			email: string,
			agree: boolean,
			setErrorSigning: React.Dispatch<React.SetStateAction<boolean>>,
		): Promise<boolean> => {
			if (!provider) return false
			try {
				if (!wcProvider) {
					await provider.send("eth_requestAccounts", [])
					const signer = provider.getSigner()
					const acc = await signer.getAddress()
					const message = `Name:${name}Email:${email}Phone:${phone}Agrees:${agree}`
					const hashMessage = hexlify(ethers.utils.toUtf8Bytes(message))
					const signedMessage = await signer.signMessage(message)
					const resp = await fetch(
						`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/early/sign?signature=${signedMessage}&message=${message}&address=${acc}&agree=${agree}&hex=${hashMessage}`,
						{
							method: "POST",
						},
					)
					if (resp.status !== 200) {
						setErrorSigning(true)
						return false
					}
					const body = (await resp.clone().json()) as EarlyContributorCheck
					return body.has_signed
				}

				const connector = await wcProvider.getWalletConnector()
				const acc = connector.accounts[0]
				const message = `Name:${name}Email:${email}Phone:${phone}Agrees:${agree}`
				const hashMessage = hexlify(ethers.utils.toUtf8Bytes(message))
				const signedMessage = await connector.signPersonalMessage([ethers.utils.toUtf8Bytes(message), acc]).catch((e) => {
					console.error(e)
				})
				const resp = await fetch(
					`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/early/sign?signature=${signedMessage}&message=${message}&address=${acc}&agree=${agree}&hex=${hashMessage}`,
					{
						method: "POST",
					},
				)
				if (resp.status !== 200) {
					setErrorSigning(true)
					return false
				}
				const body = (await resp.clone().json()) as EarlyContributorCheck
				return body.has_signed
			} catch (e: any) {
				console.error(e)
				setErrorSigning(true)
				if (e.code === 4001) {
					return false
				}
			}
			return false
		},
		[provider, wcProvider],
	)

	const signWalletConnect = useCallback(async () => {
		const walletConnectProvider = await createWcProvider()
		await walletConnectProvider.subscribeWalletConnector()
	}, [createWcProvider])

	const changeChain = async (chain: number) => {
		if (!provider) return

		if (typeof (window as any).ethereum === "undefined" || typeof (window as any).web3 === "undefined") {
			// Disconnect and reconnect user to change chain
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
		} catch (e: any) {
			const err = metamaskErrorHandling(e)
			err ? displayMessage(err, "error") : displayMessage("Something went wrong, please try again.", "error")
			throw err
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
			const accVal = value.div(1000000)
			const hasSufficientFunds = await contract.callStatic.transfer(signer.getAddress(), accVal)

			if (hasSufficientFunds) {
				return await contract.transfer(PURCHASE_ADDRESS, value)
			} else {
				displayMessage("Wallet does not have sufficient funds.", "error")
				return
			}
		} catch (e: any) {
			const err = metamaskErrorHandling(e)
			err ? displayMessage(err, "error") : displayMessage("Something went wrong, please try again.", "error")
			throw err
		}
	}

	const farmInfo = useCallback<
		(
			farmContractAddr: string,
			pancakePoolAddr: string,
			lpTokenAddr: string,
			supsContractAddr: string,
			wbnbContractAddr: string,
		) => Promise<FarmData | null>
	>(
		async (farmContractAddr: string, pancakePoolAddr: string, lpTokenAddr: string, supsContractAddr: string, wbnbContractAddr: string) => {
			if (!provider || !account) return null
			const multi = new MultiCall(provider)
			const pancakeABI = new Interface([
				"function getAmountsOut(uint256, address[]) public view returns (uint256[])",
				"function getReserves() public view returns (uint112, uint112, uint32)",
				"function balanceOf(address) public view returns (uint256)",
				"function token0() public view returns (address)",
				"function token1() public view returns (address)",
				"function totalSupply() public view returns (uint256)",
			])
			const farmABI = new Interface([
				"function duration() public view returns (uint256)",
				"function lastTimeRewardApplicable() public view returns (uint256)",
				"function lastUpdateTime() public view returns (uint256)",
				"function periodFinish() public view returns (uint256)",
				"function rewardToken() public view returns (uint256)",
				"function rewardPerTokenStored() public view returns (uint256)",
				"function rewardRate() public view returns (uint256)",
				"function stakeToken() public view returns (uint256)",
				"function totalSupply() public view returns (uint256)",
				"function balanceOf(address) public view returns (uint256)",
				"function earned(address) public view returns (uint256)",
				"function rewards(address) public view returns (uint256)",
				"function userRewardPerTokenPaid(address) public view returns (uint256)",
			])

			const erc20ABI = new Interface(["function symbol() public view returns (string)"])

			const inputs = [
				{ target: farmContractAddr, function: "duration", args: [], interface: farmABI },
				{ target: farmContractAddr, function: "lastTimeRewardApplicable", args: [], interface: farmABI },
				{ target: farmContractAddr, function: "lastUpdateTime", args: [], interface: farmABI },
				{ target: farmContractAddr, function: "periodFinish", args: [], interface: farmABI },
				{ target: farmContractAddr, function: "rewardToken", args: [], interface: farmABI },
				{ target: farmContractAddr, function: "rewardPerTokenStored", args: [], interface: farmABI },
				{ target: farmContractAddr, function: "rewardRate", args: [], interface: farmABI },
				{ target: farmContractAddr, function: "stakeToken", args: [], interface: farmABI },
				{ target: farmContractAddr, function: "totalSupply", args: [], interface: farmABI },
				{ target: farmContractAddr, function: "balanceOf", args: [account], interface: farmABI },
				{ target: farmContractAddr, function: "earned", args: [account], interface: farmABI },
				{ target: farmContractAddr, function: "rewards", args: [account], interface: farmABI },
				{ target: farmContractAddr, function: "userRewardPerTokenPaid", args: [account], interface: farmABI },
				{
					target: pancakePoolAddr,
					function: "getAmountsOut",
					args: ["1000000000000000000", [supsContractAddr, wbnbContractAddr]],
					interface: pancakeABI,
				},
				{
					target: lpTokenAddr,
					function: "getReserves",
					args: [],
					interface: pancakeABI,
				},
				{
					target: lpTokenAddr,
					function: "balanceOf",
					args: [account],
					interface: pancakeABI,
				},
				{
					target: lpTokenAddr,
					function: "token0",
					args: [],
					interface: pancakeABI,
				},
				{
					target: lpTokenAddr,
					function: "token1",
					args: [],
					interface: pancakeABI,
				},
				{
					target: lpTokenAddr,
					function: "totalSupply",
					args: [],
					interface: pancakeABI,
				},
			]
			const farmData = await multi.multiCall(inputs, true)
			if (!farmData || !farmData[1]) return null

			// Fetched value
			const periodFinish: BigNumber = farmData[1][3]
			const rewardRate: BigNumber = farmData[1][6]
			const farmTotalSupply: BigNumber = farmData[1][8]
			const stakingBalance: BigNumber = farmData[1][9]
			const earned: BigNumber = farmData[1][10]
			const supsPerBnb: BigNumber = farmData[1][13][1]
			const reserves0: BigNumber = farmData[1][14][0]
			const reserves1: BigNumber = farmData[1][14][1]
			const lpBalance: BigNumber = farmData[1][15]
			const token0Addr: string = farmData[1][16]
			const token1Addr: string = farmData[1][17]
			const lpTotalSupply: string = farmData[1][18]

			const tokenData = await multi.multiCall([
				{ target: token0Addr, function: "symbol", args: [], interface: erc20ABI },
				{ target: token1Addr, function: "symbol", args: [], interface: erc20ABI },
			])

			const token0Sym = tokenData[1][0]
			const token1Sym = tokenData[1][1]
			let circulatingLPValueInSUPS = BigNumber.from(0)
			const FIX_BIG_NUMBER = 10 ** 10
			const supsPerBnbSmall = (parseFloat(formatUnits(supsPerBnb)) * FIX_BIG_NUMBER).toFixed(0)

			if (token0Sym === "WBNB") {
				circulatingLPValueInSUPS = circulatingLPValueInSUPS.add(reserves0.mul(supsPerBnbSmall).div(FIX_BIG_NUMBER))
			}
			if (token1Sym === "SUPS") {
				circulatingLPValueInSUPS = circulatingLPValueInSUPS.add(reserves1)
			}

			const LPValueInSUPS = circulatingLPValueInSUPS.div(lpTotalSupply)

			const secondsPerYear = BigNumber.from(31536000)
			const supsRewardPerYear = rewardRate.mul(secondsPerYear)
			const stakedLPValueInSUPS = farmTotalSupply.mul(LPValueInSUPS)

			const supsRewardPerYearSmall = +formatUnits(supsRewardPerYear, 18)
			const stakedLPinSUPSValueSmall = +formatUnits(stakedLPValueInSUPS, 18)
			const yieldPercentage = supsRewardPerYearSmall / stakedLPinSUPSValueSmall || 0
			let userRewardRate = BigNumber.from(0)
			let rewardRateSmall = 0
			let userPoolProportion = 0
			if (stakingBalance.gt(0)) {
				const userPoolSmall = +formatUnits(stakingBalance, 18)
				const globalPoolSmall = +formatUnits(farmTotalSupply, 18)
				userPoolProportion = userPoolSmall / globalPoolSmall
				rewardRateSmall = +formatUnits(rewardRate, 18)

				const userRewardRateSmall = rewardRateSmall * userPoolProportion
				userRewardRate = parseUnits(userRewardRateSmall.toFixed(18), 18)
			}
			const result = {
				earned,
				stakingBalance,
				lpBalance,
				userRewardRate,
				yieldPercentage,
				rewardRate,
				periodFinish,
			}
			// console.table(result)
			return result
		},
		[account, provider],
	)
	const farmStake = useCallback(
		async (farmContractAddr: string, amount: BigNumber): Promise<TransactionResponse> => {
			if (!provider || !account || !signer) throw new Error("provider not ready")
			const farmABI = new Interface(["function stake(uint256)"])
			const contract = new ethers.Contract(farmContractAddr, farmABI, signer)
			return await contract.stake(amount)
		},
		[account, provider, signer],
	)
	const farmWithdraw = useCallback(
		async (farmContractAddr: string, amount: BigNumber): Promise<TransactionResponse> => {
			if (!provider || !account || !signer) throw new Error("provider not ready")
			const farmABI = new Interface(["function withdraw(uint256)"])
			const contract = new ethers.Contract(farmContractAddr, farmABI, signer)
			return contract.withdraw(amount)
		},
		[account, provider, signer],
	)
	const farmGetReward = useCallback(
		async (farmContractAddr: string): Promise<TransactionResponse> => {
			if (!provider || !account || !signer) throw new Error("provider not ready")
			const farmABI = new Interface(["function getReward()"])
			const contract = new ethers.Contract(farmContractAddr, farmABI, signer)
			return contract.getReward()
		},
		[account, provider, signer],
	)

	const farmExit = useCallback(
		async (farmContractAddr: string): Promise<TransactionResponse> => {
			if (!provider || !account || !signer) throw new Error("provider not ready")
			const farmABI = new Interface(["function exit()"])
			const contract = new ethers.Contract(farmContractAddr, farmABI, signer)
			return contract.exit()
		},
		[account, provider, signer],
	)
	const farmLPApproveMax = useCallback(
		async (farmContractAddr: string): Promise<TransactionResponse> => {
			if (!provider || !account || !signer) throw new Error("provider not ready")
			const erc20ABI = new Interface(["function approve(address, uint256)"])
			const contract = new ethers.Contract(LP_TOKEN_ADDRESS, erc20ABI, signer)
			return contract.approve(farmContractAddr, constants.MaxUint256)
		},
		[account, provider, signer],
	)

	const farmCheckAllowance = useCallback(
		async (farmContractAddr: string, amount: BigNumber) => {
			if (!provider || !account || !signer) throw new Error("provider not ready")
			const erc20ABI = new Interface(["function allowance(address, address) view returns (uint256)"])
			const contract = new ethers.Contract(LP_TOKEN_ADDRESS, erc20ABI, provider)
			const allowance: BigNumber = await contract.allowance(account, farmContractAddr)
			return allowance.gte(amount)
		},
		[account, provider, signer],
	)

	const getURI1155 = useCallback(
		async (contractAddr: string, tokenID: number) => {
			if (!provider) throw new Error("provider not ready")
			const erc1155ABI = new Interface(["function uri(uint256) view returns (string memory)"])
			const contract = new ethers.Contract(contractAddr, erc1155ABI, provider)
			return await contract.uri(tokenID)
		},
		[provider],
	)

	const safeTransferFrom1177 = useCallback(
		async (contractAddr: string, tokenID: number, amount: number, toAddress: string) => {
			if (!account) throw new Error("account not connected")
			const erc1155ABI = new Interface(["function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data)"])
			const contract = new ethers.Contract(contractAddr, erc1155ABI, signer)
			return await contract.safeTransferFrom(account, toAddress, tokenID, amount, "0x")
		},
		[account, signer],
	)

	const get1155Nonce = useCallback(
		async (contractAddr: string): Promise<number> => {
			if (!account) throw new Error("account not connected")
			if (!provider) throw new Error("provider not ready")
			const erc1155ABI = new Interface(["function nonces(address) public view returns (uint256)"])
			const contract = new ethers.Contract(contractAddr, erc1155ABI, provider)
			return await contract.nonces(account)
		},
		[account, provider],
	)

	const signedMint1155 = useCallback(
		async (contractAddr: string, signature: string, tokenID: number) => {
			if (!signer) throw new Error("signer not ready")
			const erc1155ABI = new Interface(["function signedMint(uint256 tokenID, bytes signature)"])
			const contract = new ethers.Contract(contractAddr, erc1155ABI, signer)
			console.log(contract)
			return await contract.signedMint(tokenID, signature)
		},
		[signer],
	)

	const convertURIWithID = (uri: string, tokenID: number): string => {
		const hexTokenID = tokenID.toString(16).padStart(64, "0")
		return uri.replace("{id}", hexTokenID)
	}

	const batchBalanceOf = useCallback(
		async (tokenIDs: number[], contractAddr: string): Promise<BigNumber[]> => {
			if (!account) throw new Error("account not connected")
			if (!provider) throw new Error("provider not ready")
			const address: string[] = []
			for (let i = 0; i < tokenIDs.length; i++) {
				address.push(account)
			}
			const erc1155ABI = new Interface([
				"function balanceOfBatch(address[] memory accounts, uint256[] memory ids) view returns (uint256[] memory)",
			])
			const contract = new ethers.Contract(contractAddr, erc1155ABI, provider)
			return await contract.balanceOfBatch(address, tokenIDs)
		},
		[account, provider],
	)

	return {
		signedMint1155,
		get1155Nonce,
		safeTransferFrom1177,
		batchBalanceOf,
		convertURIWithID,
		getURI1155,
		farmGetReward,
		farmLPApproveMax,
		farmCheckAllowance,
		farmStake,
		farmWithdraw,
		farmExit,
		farmInfo,
		block,
		connect,
		metaMaskState,
		sign,
		account,
		changeChain,
		amountRemaining: BigNumber.from(0),
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
		checkNeoBalance,
		loadingAmountRemaining,
		setLoadingAmountRemaining,
		wcProvider,
		wcSignature,
		signEarlyContributors,
		signer,
		setDisableWalletModal,
		disableWalletModal,
		wcNonce,
	}
})

export const Web3Provider = Web3Container.Provider
export const useWeb3 = Web3Container.useContainer
