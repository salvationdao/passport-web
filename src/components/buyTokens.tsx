import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { Box, Button, LinearProgress, Link, Stack, TextField, Typography, useTheme } from "@mui/material"
import { BigNumber, ethers } from "ethers"
import React, { useCallback, useEffect, useState } from "react"
import Arrow from "../assets/images/arrow.png"
import BinanceCoin from "../assets/images/crypto/binance-coin-bnb-logo.svg"
import BinanceUSD from "../assets/images/crypto/binance-usd-busd-logo.svg"
import Ethereum from "../assets/images/crypto/ethereum-eth-logo.svg"
import Usdc from "../assets/images/crypto/usd-coin-usdc-logo.svg"
import SupsToken from "../assets/images/sup-token.svg"
import {
	BINANCE_CHAIN_ID,
	BSC_SCAN_SITE,
	BUSD_CONTRACT_ADDRESS,
	ETHEREUM_CHAIN_ID,
	ETH_SCAN_SITE,
	USDC_CONTRACT_ADDRESS,
	WBNB_CONTRACT_ADDRESS,
	WETH_CONTRACT_ADDRESS,
} from "../config"
import { SocketState, useWebsocket } from "../containers/socket"
import { MetaMaskState, useWeb3, web3Constants } from "../containers/web3"
import HubKey from "../keys"
import { colors } from "../theme"
import { ExchangeRates, tokenName, tokenSelect } from "../types/types"
import { ConnectWallet } from "./connectWallet"
import { FancyButton } from "./fancyButton"
import { TokenSelect } from "./tokenSelect"

type conversionType = "supsToTokens" | "tokensToSups"
type transferStateType = "waiting" | "error" | "confirm" | "none"

export const BuyTokens: React.FC = () => {
	const { subscribe, state } = useWebsocket()
	const { changeChain, currentChainId, getBalance, sendTransferToPurchaseAddress, metaMaskState } = useWeb3()
	const theme = useTheme()

	const [currentToken, setCurrentToken] = useState<tokenSelect>(tokenOptions[0])
	const [currentTokenName, setCurrentTokenName] = useState<tokenName>("eth")
	const [tokenValue, setTokenValue] = useState<string>("")
	const [supsValue, setSupsValue] = useState<string>("")
	const [amountRemaining, setAmountRemaining] = useState<number>(0)
	const [userBalance, setUserBalance] = useState<number>(0)
	const [transferState, setTransferState] = useState<transferStateType>("none")
	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")
	const [transferError, setTransferError] = useState<any>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [exchangeRates, setExchangeRates] = useState<ExchangeRates>()

	const acceptedChainExceptions = currentChainId?.toString() === ETHEREUM_CHAIN_ID || currentChainId?.toString() === BINANCE_CHAIN_ID

	const handleConversions = useCallback(
		(direction: conversionType, value: number) => {
			if (value.toString() === "") {
				setTokenValue("")
				setSupsValue("")
				return
			}
			if (currentToken.isNative) {
				switch (currentTokenName) {
					case "bnb":
						switch (direction) {
							case "tokensToSups":
								const sups = ((value * web3Constants.bnbToUsdConversion) / web3Constants.supsToUsdConversion).toFixed(4).toString()
								setSupsValue(sups)
								break
							case "supsToTokens":
								const tokens = ((value * web3Constants.supsToUsdConversion) / web3Constants.bnbToUsdConversion).toFixed(4).toString()
								setTokenValue(tokens)
								break
						}
						break
					default:
						switch (direction) {
							case "tokensToSups":
								const sups = ((value * web3Constants.ethToUsdConversion) / web3Constants.supsToUsdConversion).toFixed(4).toString()
								setSupsValue(sups)
								break
							case "supsToTokens":
								const tokens = ((value * web3Constants.supsToUsdConversion) / web3Constants.ethToUsdConversion).toFixed(4).toString()
								setTokenValue(tokens)
								break
						}
						break
				}
			} else {
				switch (direction) {
					case "tokensToSups":
						const sups = (value / web3Constants.supsToUsdConversion).toFixed(4).toString()
						setSupsValue(sups)
						break
					case "supsToTokens":
						const tokens = (value * web3Constants.supsToUsdConversion).toFixed(4).toString()
						setTokenValue(tokens)
						break
				}
			}
		},
		[currentToken],
	)

	// useEffect(() => {
	// 	if (window.document) {
	// 		const body = window.document.querySelector("body")
	// 		if (body) body.style.backgroundColor = "transparent"
	// 	}
	// }, [])

	useEffect(() => {
		if (currentChainId && acceptedChainExceptions) {
			const filteredArr = tokenOptions.filter((x) => {
				return x.name === currentTokenName
			})

			setCurrentToken(filteredArr[0])
		} else {
			setCurrentToken(tokenOptions[0])
		}
	}, [currentTokenName, currentChainId])

	useEffect(() => {
		if (tokenValue !== "") {
			handleConversions("tokensToSups", parseFloat(tokenValue))
		}
	}, [handleConversions, tokenValue])

	//getting user balance
	useEffect(() => {
		setUserBalance(0)
		setLoading(true)
		;(async () => {
			try {
				const response = await getBalance(currentToken.contractAddr)
				if (response) {
					const balance = parseFloat(response)
					if (!balance) return
					setUserBalance(balance)
				}
			} catch {
				setUserBalance(0)
			} finally {
				setLoading(false)
			}
		})()
	}, [currentToken, getBalance])

	useEffect(() => {
		if (state !== SocketState.OPEN) return
		return subscribe<ExchangeRates>(HubKey.SupExchangeRates, (rates) => {
			setExchangeRates(rates)
		})
	}, [subscribe, state])

	//Setting up websocket to listen to remaining supply
	useEffect(() => {
		if (state !== SocketState.OPEN) return
		return subscribe<string>(HubKey.SupTotalRemaining, (amount) => {
			const amountSups = parseFloat(ethers.utils.formatUnits(amount, 18)).toFixed(2)
			setAmountRemaining(parseFloat(amountSups))
		})
	}, [subscribe, state])

	const handleNetworkSwitch = async () => {
		await changeChain(currentToken.chainId)
		setTokenValue("")
		setSupsValue("")
	}

	async function handleTransfer() {
		const value = parseFloat(tokenValue)
		const supsNumValue = parseFloat(supsValue)

		if (value <= 0 || supsNumValue > amountRemaining) return

		setLoading(true)
		setTransferState("waiting")
		try {
			if (state !== SocketState.OPEN) return

			const tx = await sendTransferToPurchaseAddress(currentToken.contractAddr, BigNumber.from(value))

			setCurrentTransferHash(tx.hash)

			setTransferState("confirm")
			setTokenValue("")
			setSupsValue("")

			await tx.wait()
		} catch (error) {
			setTransferError(error)
			setTransferState("error")
		} finally {
			setLoading(false)
		}
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		handleTransfer()
	}

	return (
		<Box
			sx={{
				border: {
					xs: `2px solid ${theme.palette.secondary.main}`,
					md: "none",
				},
				position: "relative",
			}}
		>
			{/* Switch Network Dialog */}
			<Box
				sx={
					(acceptedChainExceptions && currentChainId === currentToken.chainId) || metaMaskState !== MetaMaskState.Active
						? { display: "none" }
						: {
								position: "absolute",
								zIndex: "5",
								padding: "1rem",
								height: "100%",
								width: "100%",
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
						  }
				}
			>
				<Typography variant="h2" sx={{ textTransform: "uppercase", textAlign: "center", textDecoration: "underline" }}>
					Attention!
				</Typography>
				<Typography variant="body1" sx={{ textAlign: "center", marginBottom: "1rem" }}>
					Please switch to a valid network to continue your transaction. Click the button below and follow the prompts.
				</Typography>
				<FancyButton borderColor={colors.skyBlue} onClick={handleNetworkSwitch}>
					Switch Network
				</FancyButton>
			</Box>

			{/* Metamask Connection */}
			<Box
				sx={
					metaMaskState === MetaMaskState.Active
						? { display: "none" }
						: {
								position: "absolute",
								zIndex: "5",
								padding: "1rem",
								height: "100%",
								width: "100%",
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
								gap: "1em",
						  }
				}
			>
				<Typography variant="h3" sx={{ textTransform: "uppercase" }}>
					Connect Your Wallet
				</Typography>
				<ConnectWallet />
			</Box>

			{/* transferState */}
			<Box
				sx={
					transferState === "none" || metaMaskState !== MetaMaskState.Active
						? { display: "none" }
						: { position: "absolute", zIndex: "5", width: "100%", height: "100%" }
				}
			>
				<Box
					sx={
						transferState === "confirm"
							? { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }
							: { display: "none" }
					}
				>
					<CheckCircleIcon sx={{ fontSize: "50px", color: theme.palette.secondary.main }} />
					<Typography variant="h3" sx={{ margin: "2rem 0 0 0", textTransform: "uppercase" }}>
						Success
					</Typography>
					<Typography variant="h4" sx={{ margin: "1rem 0" }}>
						Transaction has been submitted
					</Typography>
					<Typography variant="body1">
						<Link href={`https://${currentToken.scanSite}/tx/${currentTransferHash}`} target="_blank">
							View on Explorer
						</Link>
					</Typography>
					<FancyButton
						borderColor={colors.skyBlue}
						loading={loading}
						disabled={loading}
						sx={{ minWidth: "50%", margin: "2rem 0 .5rem 0", minHeight: "2.5rem" }}
						onClick={() => setTransferState("none")}
					>
						{loading ? " " : "Close"}
					</FancyButton>
					<Typography sx={loading ? { display: "flex", width: "100%", justifyContent: "center" } : { display: "none" }} variant="body1">
						Please wait, your transaction is pending.
					</Typography>
				</Box>

				<Box
					sx={
						transferState === "error"
							? { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }
							: { display: "none" }
					}
				>
					<ErrorIcon sx={{ fontSize: "50px", color: theme.palette.secondary.main }} />
					<Typography variant="h3" sx={{ margin: "2rem 0 1rem 0", textTransform: "uppercase" }}>
						Error
					</Typography>
					<Typography variant="h4">{transferError ? (transferError.code === 4001 ? "Transaction Rejected" : "Purchase Failed") : null}</Typography>
					<Typography sx={{ marginTop: "1rem" }} variant="body1">
						{transferError ? (transferError.code === undefined ? transferError : null) : null}
					</Typography>

					<Box sx={{ margin: "2rem 0", display: "flex", width: "70%", justifyContent: "space-around" }}>
						<FancyButton borderColor={colors.skyBlue} sx={{ minWidth: "7rem" }} onClick={() => setTransferState("none")}>
							Close
						</FancyButton>

						<FancyButton borderColor={colors.skyBlue} type="submit" sx={{ minWidth: "7rem" }} onClick={handleTransfer}>
							Retry
						</FancyButton>
					</Box>
				</Box>

				<Stack
					sx={
						transferState === "waiting"
							? { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }
							: { display: "none" }
					}
				>
					<Box sx={{ width: "100%" }}>
						<LinearProgress color="secondary" />
					</Box>
					<Typography variant="h3" sx={{ textTransform: "uppercase", margin: "1rem 0" }}>
						Waiting on Confirmation
					</Typography>

					<Typography variant="body1">
						Purchasing {supsValue} SUPS with {tokenValue} {currentTokenName.toUpperCase()}
					</Typography>
					<Typography variant="body1">Confirm this transaction in your wallet</Typography>
					<Box sx={{ width: "100%", marginTop: "1rem" }}>
						<LinearProgress color="secondary" />
					</Box>
				</Stack>
			</Box>

			{/* Purchase Sups Form */}
			<Box
				sx={
					acceptedChainExceptions && currentChainId === currentToken.chainId && transferState === "none"
						? {
								padding: {
									xs: "1rem",
									md: "0",
								},
						  }
						: {
								filter: "blur(5px) brightness(20%)",
								padding: {
									xs: "1rem",
									md: "0",
								},
						  }
				}
			>
				<Box sx={{ width: "90vw", minWidth: "300px", maxWidth: "550px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
					<Typography
						variant="h2"
						align="center"
						sx={{
							textTransform: "uppercase",
							paddingBottom: "1rem",
						}}
					>
						Purchase SUPS
					</Typography>
					<form onSubmit={handleSubmit}>
						<Box sx={{ display: "flex", flexDirection: "column", minHeight: "30vh", justifyContent: "space-between", alignItems: "center" }}>
							<Box sx={{ position: "relative", width: "100%" }}>
								<Box
									sx={{ display: "flex", backgroundColor: colors.darkNavyBlue, borderRadius: "10px", padding: "1rem", marginBottom: "1rem" }}
								>
									<Box sx={{ flexGrow: "2" }}>
										<Typography sx={{ color: colors.darkGrey }} variant="h6">
											From:{" "}
										</Typography>
										<TextField
											fullWidth
											variant="filled"
											value={tokenValue}
											onChange={(e) => {
												const value = e.target.value
												setTokenValue(value)
												handleConversions("tokensToSups", parseFloat(value))
											}}
											type="number"
											sx={{
												backgroundColor: colors.darkNavyBlue,
												"& .MuiFilledInput-root": {
													background: "inherit",
												},
												"& .MuiFilledInput-underline:after": {
													borderBottomColor: colors.skyBlue,
												},
												input: { color: colors.skyBlue, fontSize: "1.2rem" },
											}}
											inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
										/>
									</Box>

									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											justifyContent: "space-between",
											alignItems: "flex-end",
										}}
									>
										<TokenSelect
											currentTokenName={currentTokenName}
											setCurrentTokenName={setCurrentTokenName}
											tokenOptions={tokenOptions}
										/>
										<Button
											disabled={userBalance === 0}
											sx={{ marginLeft: "auto" }}
											onClick={() => {
												setTokenValue(userBalance.toString())
												handleConversions("tokensToSups", userBalance)
											}}
										>
											<Typography sx={{ color: colors.darkGrey }} variant="body1">
												Balance: <b>{userBalance ? userBalance.toFixed(2) : "--"}</b>
											</Typography>
										</Button>
									</Box>
								</Box>
								<Box
									component="img"
									src={Arrow}
									alt="token image"
									sx={{
										height: "3rem",
										position: "absolute",
										top: "0",
										left: "0",
										right: "0",
										bottom: "0",
										margin: "auto",
										zIndex: 2,
									}}
								/>
								<Box sx={{ display: "flex", backgroundColor: colors.darkNavyBlue, borderRadius: "10px", padding: "1rem", marginTop: "1rem" }}>
									<Box sx={{ flexGrow: "2" }}>
										<Typography sx={{ color: colors.darkGrey }} variant="h6">
											To:
										</Typography>
										<TextField
											fullWidth
											variant="filled"
											value={supsValue}
											onChange={(e) => {
												const value = e.target.value
												setSupsValue(value)
												handleConversions("supsToTokens", parseFloat(value))
											}}
											type="number"
											sx={{
												backgroundColor: colors.darkNavyBlue,
												"& .MuiFilledInput-root": {
													background: "inherit",
												},
												"& .MuiFilledInput-underline:after": {
													borderBottomColor: colors.skyBlue,
												},
												input: { color: colors.skyBlue, fontSize: "1.2rem" },
											}}
											inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
										/>
									</Box>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											justifyContent: "space-between",
											alignItems: "flex-end",
										}}
									>
										<Box sx={{ display: "flex", padding: ".5rem" }}>
											<Box
												component="img"
												src={SupsToken}
												alt="token image"
												sx={{
													height: "1rem",
													marginRight: "1rem",
												}}
											/>
											<Typography variant="body1" sx={{ textTransform: "uppercase" }}>
												<b>Sups</b>
											</Typography>
										</Box>
										<Typography sx={{ color: colors.darkGrey }} variant="body1">
											XSYN Balance:{" "}
											<b>
												{
													//userBalance ? userBalance.toFixed(2) : "--"}
												}
												200000
											</b>
										</Typography>
										<Typography sx={{ color: colors.darkGrey }} variant="body1">
											Wallet Balance:{" "}
											<b>
												{
													//userBalance ? userBalance.toFixed(2) : "--"}
												}
												101000
											</b>
										</Typography>
									</Box>
								</Box>
							</Box>

							{/* Progress Bar */}
							<Box sx={{ width: "100%", backgroundColor: `${theme.palette.secondary.dark}`, height: "2.5rem", borderRadius: "5px" }}>
								<Box
									sx={{
										backgroundColor: `${theme.palette.secondary.main}`,
										width: `${100 - (amountRemaining / web3Constants.totalSaleSups) * 100}%`,
										height: "inherit",
										overflowX: "visible",
										display: "flex",
										alignItems: "center",
										borderRadius: "5px",
									}}
								>
									<Typography
										variant="body1"
										sx={{
											textTransform: "uppercase",
											color: colors.darkNavyBlue,
											whiteSpace: "nowrap",
											padding: ".3rem",
										}}
									>
										<b>{(amountRemaining / 10 ** 6).toFixed(2)}m of 217M Tokens remaining</b>
									</Typography>
								</Box>
							</Box>
							<FancyButton
								borderColor={colors.skyBlue}
								disabled={
									!acceptedChainExceptions ||
									parseFloat(tokenValue) > userBalance ||
									tokenValue === "" ||
									parseFloat(supsValue) > amountRemaining ||
									loading
								}
								sx={{ width: "60%", minWidth: "150px", alignSelf: "center", marginTop: "1.5rem" }}
								type="submit"
								fancy
							>
								{(() => {
									if (parseFloat(tokenValue) > userBalance) {
										return `Insufficient ${currentToken.name.toUpperCase()} Balance`
									} else if (parseFloat(supsValue) > amountRemaining) {
										return `Insufficient Remaining SUPS`
									} else {
										return "Purchase Your Sups"
									}
								})()}
							</FancyButton>
						</Box>
					</form>
				</Box>
			</Box>
		</Box>
	)
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
		contractAddr: WETH_CONTRACT_ADDRESS,
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
		contractAddr: WBNB_CONTRACT_ADDRESS,
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
