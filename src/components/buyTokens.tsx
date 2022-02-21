import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { Box, Button, LinearProgress, Link, Stack, TextField, Typography, useTheme } from "@mui/material"
import { BigNumber, ethers } from "ethers"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import React, { useCallback, useEffect, useState } from "react"
import { useContainer } from "unstated-next"
import Arrow from "../assets/images/arrow.png"
import SupsToken from "../assets/images/sup-token.svg"
import { BINANCE_CHAIN_ID, ETHEREUM_CHAIN_ID } from "../config"
import { SocketState, useWebsocket } from "../containers/socket"
import { AppState } from "../containers/supremacy/app"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { useSecureSubscription } from "../hooks/useSecureSubscription"
import HubKey from "../keys"
import { colors } from "../theme"
import { ExchangeRates, tokenName, tokenSelect } from "../types/types"
import { ConnectWallet } from "./connectWallet"
import { FancyButton } from "./fancyButton"
import { TokenSelect } from "./tokenSelect"
type conversionType = "supsToTokens" | "tokensToSups"
type transferStateType = "waiting" | "error" | "confirm" | "none"

export const BuyTokens: React.FC<{ publicSale?: boolean }> = ({ publicSale }) => {
	const { subscribe, state } = useWebsocket()
	const {
		changeChain,
		currentChainId,
		getBalance,
		sendNativeTransfer,
		sendTransferToPurchaseAddress,
		metaMaskState,
		supBalance,
		setCurrentToken,
		currentToken,
		tokenOptions,
	} = useWeb3()
	const theme = useTheme()
	const { amountRemaining, setAmountRemaining } = useContainer(AppState)

	const [selectedTokenName, setSelectedTokenName] = useState<tokenName>("eth")
	const [tokenAmt, setTokenAmt] = useState<BigNumber>(BigNumber.from(0))
	const [supsAmt, setSupsAmt] = useState<BigNumber>(BigNumber.from(0))
	const [tokenDisplay, setTokenDisplay] = useState<string | null>(null)
	const [supsDisplay, setSupsDisplay] = useState<string | null>(null)
	const [userBalance, setUserBalance] = useState<BigNumber>(BigNumber.from(0))
	const [transferState, setTransferState] = useState<transferStateType>("none")
	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")
	const [transferError, setTransferError] = useState<any>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [exchangeRates, setExchangeRates] = useState<ExchangeRates>()
	const { payload: userSups } = useSecureSubscription<string>(HubKey.UserSupsSubscribe)

	const acceptedChainExceptions = currentChainId?.toString() === ETHEREUM_CHAIN_ID || currentChainId?.toString() === BINANCE_CHAIN_ID

	const handleConversions = useCallback(
		(direction: conversionType, value: BigNumber) => {
			if (value.toString() === "") {
				setTokenAmt(BigNumber.from(0))
				setSupsAmt(BigNumber.from(0))
				return
			}
			console.log({ exchangeRates })
			if (currentToken.isNative && exchangeRates) {
				switch (selectedTokenName) {
					case "bnb":
						switch (direction) {
							case "tokensToSups":
								const sups = value.mul(parseUnits(exchangeRates.BNBtoUSD.toString(), 18)).div(parseUnits(exchangeRates.SUPtoUSD.toString(), 18))
								setSupsAmt(BigNumber.from(sups))
								setSupsDisplay(parseFloat(formatUnits(sups, 18)).toFixed(2))
								break
							case "supsToTokens":
								const tokens = value
									.mul(parseUnits(exchangeRates.SUPtoUSD.toString(), 18))
									.div(parseUnits(exchangeRates.BNBtoUSD.toString(), 18))
								setTokenAmt(BigNumber.from(tokens))
								setTokenDisplay(parseFloat(formatUnits(tokens, 18)).toFixed(2))
								break
						}
						break
					default:
						switch (direction) {
							case "tokensToSups":
								const sups = value.mul(parseUnits(exchangeRates.ETHtoUSD.toString(), 18)).div(parseUnits(exchangeRates.SUPtoUSD.toString(), 18))
								setSupsAmt(BigNumber.from(sups))
								setSupsDisplay(parseFloat(formatUnits(sups, 18)).toFixed(2))
								break
							case "supsToTokens":
								const tokens = value
									.mul(parseUnits(exchangeRates.SUPtoUSD.toString(), 18))
									.div(parseUnits(exchangeRates.ETHtoUSD.toString(), 18))
								setTokenAmt(BigNumber.from(tokens))
								setTokenDisplay(parseFloat(formatUnits(tokens, 18)).toFixed(2))
								break
						}
						break
				}
			} else if (exchangeRates) {
				switch (direction) {
					case "tokensToSups":
						const sups = parseUnits(value.div(parseUnits(exchangeRates.SUPtoUSD.toString(), 18)).toString(), 18)
						setSupsAmt(sups)
						setSupsDisplay(parseFloat(formatUnits(sups, 18)).toFixed(2))
						break
					case "supsToTokens":
						const tokens = value.mul(parseUnits(exchangeRates.SUPtoUSD.toString(), 18))
						setTokenAmt(tokens)
						setTokenDisplay(parseFloat(formatUnits(tokens, 18)).toFixed(2))
						break
				}
			}
		},
		[currentToken, exchangeRates, selectedTokenName],
	)

	// handles network switch and default network token name
	useEffect(() => {
		if (currentChainId && acceptedChainExceptions) {
			const filteredArr = tokenOptions.filter((x) => {
				return x.chainId === currentChainId
			})
			const filteredByName = filteredArr.filter((x) => {
				return x.name === selectedTokenName
			})

			if (filteredByName.length === 0) {
				setSelectedTokenName(filteredArr[0].name)
				return
			} else {
				setSelectedTokenName(filteredByName[0].name)
				return
			}
		} else {
			setSelectedTokenName(tokenOptions[0].name)
		}
	}, [currentChainId, acceptedChainExceptions, selectedTokenName, tokenOptions])

	//handles token switch from drop down
	useEffect(() => {
		const filteredArr = tokenOptions.filter((x) => {
			return x.name === selectedTokenName
		})
		setCurrentToken(filteredArr[0])
	}, [selectedTokenName, setCurrentToken, tokenOptions])

	useEffect(() => {
		getCurrentBalance(currentToken)
	}, [currentChainId])

	useEffect(() => {
		if (tokenAmt && tokenAmt.gt(0)) {
			handleConversions("tokensToSups", tokenAmt)
		}
	}, [handleConversions, tokenAmt])

	const getCurrentBalance = async (token: tokenSelect) => {
		try {
			if (token.isNative) {
				const response = await getBalance(null)
				setUserBalance(response)
				setLoading(false)
				return
			}
			const response = await getBalance(token.contractAddr)
			setUserBalance(response)
		} catch (e) {
			console.error(e)
			setUserBalance(BigNumber.from(0))
		} finally {
			setLoading(false)
		}
	}

	//getting user balance
	useEffect(() => {
		setUserBalance(BigNumber.from(0))
		setLoading(true)
		;(async () => {
			getCurrentBalance(currentToken)
		})()
	}, [currentToken, getBalance])

	useEffect(() => {
		if (state !== SocketState.OPEN) return
		return subscribe<ExchangeRates>(HubKey.SupExchangeRates, (rates) => {
			if (rates)
				if (rates.BNBtoUSD === 0 || rates.ETHtoUSD === 0 || rates.SUPtoUSD === 0) {
					return
				}
			setExchangeRates(rates)
		})
	}, [subscribe, state])

	//Setting up websocket to listen to remaining supply
	useEffect(() => {
		if (state !== SocketState.OPEN) return
		return subscribe<string>(HubKey.SupTotalRemaining, (amount) => {
			setAmountRemaining(BigNumber.from(amount))
		})
	}, [subscribe, state])

	const handleNetworkSwitch = async () => {
		await changeChain(currentToken.chainId)
	}

	async function handleTransfer() {
		if (!supsAmt) return
		if (!tokenAmt) return
		if (tokenAmt.lte(0)) return
		if (!amountRemaining) return
		if (supsAmt.gt(amountRemaining)) return

		setLoading(true)
		setTransferState("waiting")
		try {
			if (state !== SocketState.OPEN) return
			let tx
			if (currentToken.isNative) {
				tx = await sendNativeTransfer(tokenAmt)
			} else {
				tx = await sendTransferToPurchaseAddress(currentToken.contractAddr, tokenAmt)
			}
			setCurrentTransferHash(tx.hash)
			setTransferState("confirm")
			setTokenAmt(BigNumber.from(0))
			setSupsAmt(BigNumber.from(0))

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
				border: publicSale
					? `1px groove ${colors.neonBlue}`
					: {
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

								background: publicSale ? colors.darkerNavyBackground : "unset",
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
						Purchasing {formatUnits(supsAmt, 18)} SUPS with {formatUnits(tokenAmt, 18)} {selectedTokenName.toUpperCase()}
					</Typography>
					<Typography variant="body1">Confirm this transaction in your wallet</Typography>
					<Box sx={{ width: "100%", marginTop: "1rem" }}>
						<LinearProgress color="secondary" />
					</Box>
				</Stack>
			</Box>

			{/* Purchase Sups Form */}
			<Box
				sx={{
					p: publicSale ? ".5em 1em" : "unset",
					"@media (max-width:600px)": {
						p: "1rem",
					},
				}}
			>
				<Box
					sx={{
						width: "90vw",
						maxWidth: publicSale ? "38rem" : "550px",
						p: "1em",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
					}}
				>
					{!publicSale && (
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
					)}
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
											value={tokenDisplay || ""}
											onChange={(e) => {
												try {
													if (e.target.value === "") setTokenDisplay(null) // if empty allow empty
													const amt = parseUnits(e.target.value, 18)
													setTokenDisplay(e.target.value.toString())
													setTokenAmt(amt)
													handleConversions("tokensToSups", amt)
												} catch (e) {
													console.error(e)
													setTokenAmt(BigNumber.from(0))
													setSupsAmt(BigNumber.from(0))
													setTokenDisplay(null)
													setSupsDisplay(null)
												}
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
											selectedTokenName={selectedTokenName}
											setSelectedTokenName={setSelectedTokenName}
											tokenOptions={tokenOptions}
											cb={() => {
												setTokenAmt(BigNumber.from(0))
												setTokenDisplay(null)
												setSupsAmt(BigNumber.from(0))
												setSupsDisplay(null)
											}}
										/>
										<Button
											disabled={userBalance ? userBalance.eq(0) : false}
											sx={{ marginLeft: "auto" }}
											onClick={() => {
												setTokenAmt(userBalance)
												setTokenDisplay(formatUnits(userBalance, 18))
												handleConversions("tokensToSups", userBalance)
											}}
										>
											<Typography sx={{ color: colors.darkGrey }} variant="body1">
												Balance: <b>{userBalance.eq(0) ? "--" : formatUnits(userBalance, 18)}</b>
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
											disabled
											fullWidth
											variant="filled"
											value={supsDisplay || ""}
											onChange={(e) => {
												try {
													if (e.target.value === "") setTokenDisplay(null) // if empty allow empty
													const amt = parseUnits(e.target.value, 18)
													setSupsDisplay(e.target.value.toString())
													setSupsAmt(amt)
													handleConversions("supsToTokens", amt)
												} catch (e) {
													console.error(e)
													setTokenAmt(BigNumber.from(0))
													setSupsAmt(BigNumber.from(0))
													setTokenDisplay(null)
													setSupsDisplay(null)
												}
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
											XSYN Balance: <b>{userSups ? parseFloat(formatUnits(BigNumber.from(userSups), 18)).toFixed(2) : "--"}</b>
										</Typography>
										<Typography sx={{ color: colors.darkGrey }} variant="body1">
											Wallet Balance: <b>{supBalance ? parseFloat(formatUnits(supBalance, 18)).toFixed(2) : "--"}</b>
										</Typography>
									</Box>
								</Box>
							</Box>

							<FancyButton
								borderColor={colors.skyBlue}
								disabled={
									!acceptedChainExceptions ||
									tokenAmt.gt(userBalance) ||
									tokenAmt.eq(0) ||
									supsAmt.gt(amountRemaining) ||
									loading ||
									exchangeRates === undefined
								}
								sx={{ width: "60%", minWidth: "150px", alignSelf: "center", marginTop: "1.5rem" }}
								type="submit"
								fancy
							>
								{(() => {
									if (tokenAmt.gt(userBalance)) {
										return `Insufficient ${currentToken.name.toUpperCase()} Balance`
									} else if (!tokenDisplay) {
										return "Enter values"
									} else if (supsAmt.gt(amountRemaining)) {
										return `Insufficient Remaining SUPS`
									} else if (exchangeRates === undefined) {
										return `Retrieving Exchange Rates`
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
