import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { Box, Button, LinearProgress, Link, Stack, TextField, Tooltip, Typography, useTheme } from "@mui/material"
import { BigNumber } from "ethers"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import React, { useCallback, useEffect, useState } from "react"
import Arrow from "../assets/images/arrow.png"
import SupsToken from "../assets/images/supsToken.png"
import { BINANCE_CHAIN_ID, ETHEREUM_CHAIN_ID } from "../config"
import { useAuth } from "../containers/auth"
import { SocketState, useWebsocket } from "../containers/socket"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { AddressDisplay } from "../helpers/web3"
import { useSecureSubscription } from "../hooks/useSecureSubscription"
import HubKey from "../keys"
import { colors } from "../theme"
import { ExchangeRates, tokenSelect } from "../types/types"
import { ConnectWallet } from "./connectWallet"
import { FancyButton } from "./fancyButton"
import { MetaMaskLogin } from "./loginMetaMask"
import { SupFancyButton } from "./supremacy/supFancyButton"
import { TokenSelect } from "./tokenSelect"
import { useSnackbar } from "../containers/snackbar"

type conversionType = "supsToTokens" | "tokensToSups"
type transferStateType = "waiting" | "error" | "confirm" | "none"

export const BuyTokens: React.FC<{ publicSale?: boolean }> = ({ publicSale }) => {
	const { state, subscribe } = useWebsocket()
	const { user, logout } = useAuth()
	const { displayMessage } = useSnackbar()
	const {
		changeChain,
		amountRemaining,
		currentChainId,
		nativeBalance,
		stableBalance,
		sendNativeTransfer,
		sendTransferToPurchaseAddress,
		metaMaskState,
		setCurrentToken,
		currentToken,
		tokenOptions,
		account,
	} = useWeb3()
	const theme = useTheme()

	const [showWalletNag, setShowWalletNag] = useState<boolean>(false)
	const [tokenAmt, setTokenAmt] = useState<BigNumber>(BigNumber.from(0))
	const [supsAmt, setSupsAmt] = useState<BigNumber>(BigNumber.from(0))
	const [tokenDisplay, setTokenDisplay] = useState<string | null>(null)
	const [supsDisplay, setSupsDisplay] = useState<string | null>(null)
	const [transferState, setTransferState] = useState<transferStateType>("none")
	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")
	const [transferError, setTransferError] = useState<any>(null)
	const [loading, setLoading] = useState<boolean>(false)
	const [exchangeRates, setExchangeRates] = useState<ExchangeRates>()
	const { payload: userSups } = useSecureSubscription<string>(HubKey.UserSupsSubscribe)
	const acceptedChainExceptions = currentChainId?.toString() === ETHEREUM_CHAIN_ID || currentChainId?.toString() === BINANCE_CHAIN_ID
	const [balanceDelta, setBalanceDelta] = useState<number | undefined>()

	const [tokenDecimals, setTokenDecimals] = useState(18)
	useEffect(() => {
		if (currentToken.name === "usdc") {
			setTokenDecimals(6)
		} else {
			setTokenDecimals(18)
		}
	}, [currentToken])

	const handleConversions = useCallback(
		(direction: conversionType, value: BigNumber) => {
			if (value.toString() === "") {
				setTokenAmt(BigNumber.from(0))
				setSupsAmt(BigNumber.from(0))
				return
			}

			if (currentToken.name === "usdc" || currentToken.name === "busd") {
				switch (direction) {
					case "tokensToSups":
						const sups = value.div(12).mul(100)
						setSupsAmt(sups)
						setSupsDisplay(formatUnits(sups, tokenDecimals))
						setTokenAmt(value)
						setTokenDisplay(formatUnits(value, tokenDecimals))
						return
					case "supsToTokens":
						const v = BigNumber.from(value)
						const tokens = v.mul(BigNumber.from(12)).div(BigNumber.from(100))
						const cTokens = tokens.div(BigNumber.from(10 ** 12))
						const cVal = v.div(BigNumber.from(10 ** 12))
						setSupsAmt(currentToken.name === "usdc" ? cVal : value)
						setTokenAmt(currentToken.name === "usdc" ? cTokens : tokens)
						setTokenDisplay(formatUnits(tokens, 18))
						setSupsDisplay(formatUnits(value, 18))
						return
				}
			}
			if (currentToken.isNative && exchangeRates) {
				switch (currentToken.name) {
					case "bnb":
						switch (direction) {
							case "tokensToSups":
								const sups = value
									.mul(parseUnits(exchangeRates.bnb_to_usd.toString(), 18))
									.div(parseUnits(exchangeRates.sup_to_usd.toString(), 18))
								setSupsAmt(BigNumber.from(sups))
								setSupsDisplay(parseFloat(formatUnits(sups, 18)).toFixed(2))
								setTokenAmt(value)
								setTokenDisplay(formatUnits(value, tokenDecimals))
								break
							case "supsToTokens":
								const tokens = value
									.mul(parseUnits(exchangeRates.sup_to_usd.toString(), 18))
									.div(parseUnits(exchangeRates.bnb_to_usd.toString(), 18))
								setTokenAmt(BigNumber.from(tokens))
								setTokenDisplay(parseFloat(formatUnits(tokens, tokenDecimals)).toString())
								setSupsAmt(value)
								setSupsDisplay(formatUnits(value, 18))
								break
						}
						break
					default:
						switch (direction) {
							case "tokensToSups":
								const sups = value
									.mul(parseUnits(exchangeRates.eth_to_usd.toString(), tokenDecimals))
									.div(parseUnits(exchangeRates.sup_to_usd.toString(), 18))
								setSupsAmt(BigNumber.from(sups))
								setSupsDisplay(parseFloat(formatUnits(sups, 18)).toFixed(2))
								setTokenAmt(value)
								setTokenDisplay(formatUnits(value, tokenDecimals))
								break
							case "supsToTokens":
								const tokens = value
									.mul(parseUnits(exchangeRates.sup_to_usd.toString(), 18))
									.div(parseUnits(exchangeRates.eth_to_usd.toString(), tokenDecimals))
								setTokenAmt(BigNumber.from(tokens))
								setTokenDisplay(parseFloat(formatUnits(tokens, tokenDecimals)).toString())
								setSupsAmt(value)
								setSupsDisplay(formatUnits(value, 18))
								break
						}
						break
				}
			} else if (exchangeRates) {
				switch (direction) {
					case "tokensToSups":
						const sups = parseUnits(value.div(parseUnits(exchangeRates.sup_to_usd.toString(), 18)).toString(), 18)
						setSupsAmt(sups)
						setSupsDisplay(parseFloat(formatUnits(sups, 18)).toFixed(2))
						setTokenAmt(value)
						setTokenDisplay(formatUnits(value, tokenDecimals))
						break
					case "supsToTokens":
						const tokens = value.mul(parseUnits(exchangeRates.sup_to_usd.toString(), 18))
						setTokenAmt(tokens)
						setTokenDisplay(parseFloat(formatUnits(tokens, tokenDecimals)).toFixed(2))
						setSupsAmt(value)
						setSupsDisplay(formatUnits(value, 18))
						break
				}
			}
		},
		[currentToken, exchangeRates, tokenDecimals],
	)

	useEffect(() => {
		if (supsAmt.gte(amountRemaining)) {
			handleConversions("supsToTokens", amountRemaining)
			setSupsAmt(amountRemaining)
			setSupsDisplay(formatUnits(amountRemaining, 18))
		}
	}, [supsAmt, amountRemaining, setSupsAmt, setSupsDisplay, handleConversions])

	// // handles network switch and default network token name
	useEffect(() => {
		if (currentChainId && acceptedChainExceptions) {
			if (currentChainId === parseInt(BINANCE_CHAIN_ID)) {
				const filteredChain = tokenOptions.filter((el) => {
					return el.chainId === parseInt(BINANCE_CHAIN_ID)
				})

				const busdToken = filteredChain.find((el) => {
					return el.name === currentToken.name
				})

				if (busdToken) {
					setCurrentToken(busdToken)
					return
				}
				if (currentToken.networkName === "Binance") {
					setCurrentToken(filteredChain[0])
					return
				}
			}

			const newToken = tokenOptions.find((el) => {
				return el.name === currentToken.name
			})

			if (!newToken) {
				setCurrentToken(tokenOptions[0])
				return
			}
			setCurrentToken(newToken)
		} else {
			setCurrentToken(tokenOptions[0])
		}
	}, [currentChainId, acceptedChainExceptions, setCurrentToken, tokenOptions, currentToken])

	useEffect(() => {
		if (state !== SocketState.OPEN) return
		return subscribe<ExchangeRates>(HubKey.SupExchangeRates, (rates) => {
			if (rates)
				if (rates.bnb_to_usd === 0 || rates.eth_to_usd === 0 || rates.sup_to_usd === 0) {
					return
				}
			setExchangeRates(rates)
		})
	}, [state, subscribe])

	const handleNetworkSwitch = async () => {
		await changeChain(currentToken.chainId)
	}

	const checkBalanceDelta = (value: string) => {
		if (value.length === 0) {
			setBalanceDelta(undefined)
			return
		}
		const valDelta = (tokenBalance && formatUnits(tokenBalance?.sub(parseUnits(value, tokenDecimals)))) || ""
		const numDelta = parseFloat(valDelta)
		setBalanceDelta(numDelta)
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
		} catch (error: any) {
			////checking metamask error signature and setting error, already handling specific error code 4001 in transferError
			if (error.code && error.code !== 4001 && error.message) {
				displayMessage(error.message, "error")
			}

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

	let tokenBalance: BigNumber | null = stableBalance || BigNumber.from(0)
	if (currentToken.isNative) {
		tokenBalance = nativeBalance
	}
	let supsDecimals = 18

	return (
		<Box
			sx={{
				border: publicSale
					? `2px solid ${colors.skyBlue}`
					: {
							xs: `2px solid ${theme.palette.secondary.main}`,
							md: "none",
					  },
				minWidth: "24rem",
				minHeight: "20rem",
				position: "relative",
			}}
		>
			{/* Switch Network Dialog */}
			<Box
				sx={
					acceptedChainExceptions && currentChainId === currentToken.chainId
						? { display: "none" }
						: {
								position: "absolute",
								zIndex: 5,
								padding: "1rem",
								height: "100%",
								width: "100%",
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								background: publicSale ? colors.darkNavyBackground2 : "unset",
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
					publicSale && !user
						? {
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
						: metaMaskState === MetaMaskState.Active
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
					{publicSale ? "Enter Token Sale" : "Connect Your Wallet"}
				</Typography>
				{publicSale ? (
					<MetaMaskLogin
						publicSale={publicSale}
						render={(props) => (
							<>
								<SupFancyButton
									onClick={(e) => {
										props.onClick(e)
										setShowWalletNag(true)
									}}
									loading={props.isProcessing}
									title="Connect Wallet"
									fullWidth
									sx={{ height: "3.5rem", fontSize: "1.2rem" }}
								>
									Connect Wallet
								</SupFancyButton>
								{!account && showWalletNag ? "Check your wallet for a login notification" : null}
							</>
						)}
					/>
				) : (
					<ConnectWallet />
				)}
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
							? {
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									height: "100%",
									width: "100%",
									textAlign: "center",
									background: colors.darkNavyBackground2,
							  }
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
							? {
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									height: "100%",
									background: publicSale ? colors.darkNavyBackground2 : "unset",
							  }
							: { display: "none" }
					}
				>
					<ErrorIcon sx={{ fontSize: "50px", color: theme.palette.secondary.main }} />
					<Typography variant="h3" sx={{ margin: "2rem 0 1rem 0", textTransform: "uppercase" }}>
						Error
					</Typography>
					<Typography variant="h4">{transferError ? (transferError.code === 4001 ? "Transaction Rejected" : "Purchase Failed") : null}</Typography>
					{/* <Typography sx={{ marginTop: "1rem" }} variant="body1">
						{transferError ? (transferError.code === undefined ? transferError : null) : null}
					</Typography> */}

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
							? {
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									width: "100%",
									height: "100%",
									padding: "1rem",
									textAlign: "center",
									background: publicSale ? colors.darkNavyBackground2 : "unset",
							  }
							: { display: "none" }
					}
				>
					<Box sx={{ width: "100%" }}>
						<LinearProgress color="secondary" />
					</Box>
					<Typography variant="h3" sx={{ textTransform: "uppercase", margin: "1rem 0", textAlign: "center" }}>
						Waiting on Confirmation
					</Typography>

					<Typography variant="body1">
						Purchasing {parseFloat(formatUnits(supsAmt, tokenDecimals)).toFixed(2)} SUPS with{" "}
						{parseFloat(formatUnits(tokenAmt, tokenDecimals)) <= 1
							? parseFloat(formatUnits(tokenAmt, tokenDecimals)).toPrecision(4)
							: parseFloat(formatUnits(tokenAmt, tokenDecimals)).toFixed(2)}{" "}
						{currentToken.name.toUpperCase()}
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
					acceptedChainExceptions && currentChainId === currentToken.chainId && transferState === "none" && metaMaskState === MetaMaskState.Active
						? {
								background: publicSale ? colors.darkerNavyBackground : "unset",
								p: publicSale ? "2em" : "unset",
								"@media (max-width:400px)": {
									p: "1rem",
								},
								height: "100%",
						  }
						: {
								background: publicSale ? colors.darkerNavyBackground : "unset",
								p: publicSale ? "2em" : "unset",
								"@media (max-width:400px)": {
									p: "1rem",
								},
								filter: "blur(5px) brightness(20%)",
								height: "100%",
						  }
				}
			>
				<Box
					sx={{
						width: "90vw",
						maxWidth: publicSale ? "24rem" : "550px",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
					}}
				>
					<Typography
						variant="h2"
						align="center"
						sx={{
							fontWeight: 800,
							fontSize: "1.2rem",
							textTransform: "uppercase",
							paddingBottom: "1rem",
						}}
					>
						Purchase $SUPS
					</Typography>
					<form onSubmit={handleSubmit}>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								minHeight: "20rem",
								justifyContent: "space-between",
								alignItems: "center",
								gap: "1em",
							}}
						>
							<Box sx={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", gap: "1em" }}>
								<Stack sx={{ gap: ".7em" }}>
									<Box
										component="img"
										src={Arrow}
										alt="token image"
										sx={{
											height: "2.5rem",
											position: "absolute",
											top: "50%",
											left: "50%",
											transform: "translate(-50%,-50%)",
											zIndex: 2,
											borderRadius: "50%",
										}}
									/>
									<Box
										sx={{
											display: "flex",
											flexDirection: "column",
											backgroundColor: colors.inputBg,
											borderRadius: "10px",
											padding: ".5rem 1rem",
										}}
									>
										<Box sx={{ display: "flex" }}>
											<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
												From:{" "}
											</Typography>
											{/* add or subtract buttons */}
											{/* <Box></Box> */}

											<TokenSelect
												currentToken={currentToken}
												cb={async (newToken: tokenSelect) => {
													setTokenAmt(BigNumber.from(0))
													setTokenDisplay(null)
													setSupsAmt(BigNumber.from(0))
													setSupsDisplay(null)
													setCurrentToken(newToken)
												}}
											/>
										</Box>
										<Tooltip
											placement="bottom-start"
											title={`Please leave at least ${currentToken.gasFee} ${
												currentToken.networkName === "Ethereum" ? "ETH" : "BNB"
											} for gas`}
											open={typeof balanceDelta === "number" ? balanceDelta <= 0 : false}
										>
											<TextField
												color="secondary"
												fullWidth
												variant="filled"
												value={tokenDisplay || ""}
												type="number"
												onChange={(e) => {
													try {
														if (e.target.value === "") setTokenDisplay(null) // if empty allow empty
														setTokenDisplay(e.target.value)
														setBalanceDelta(undefined)
													} catch (e) {
														console.error(e)
														setTokenAmt(BigNumber.from(0))
														setSupsAmt(BigNumber.from(0))
														setTokenDisplay(null)
														setSupsDisplay(null)
													}
												}}
												onBlur={(e) => {
													checkBalanceDelta(e.target.value)
													const amt = parseUnits(e.target.value === "" ? "0" : e.target.value, tokenDecimals)
													handleConversions("tokensToSups", amt)
												}}
												sx={{
													background: colors.darkNavyBackground2,
													borderRadius: "8px",
													fontWeight: 800,
													border: "none",
													mt: ".5em",
													"& input": {
														p: ".5em",
													},
													"&>div": {
														background: "none !important",
														"&::before": {
															border: "none !important",
														},
														"&::after": {
															border: "none !important",
														},
													},
													"& *::after, & *::before, &:hover": { p: 0, border: "none" },
													"& 	.MuiTextField-root": {
														background: "inherit",
													},
													"& .MuiFilledInput-underline:after": {
														borderBottomColor: "none",
													},
													"& 	.MuiTextField-root.Mui-disabled": {
														backgroundColor: colors.lightNavyBlue,
													},
													"& 	.MuiTextField-root.Mui-focused": {
														backgroundColor: colors.lightNavyBlue,
													},
													input: { color: colors.skyBlue, fontSize: "1.2rem", fontWeight: 800, lineHeight: 0.5 },
												}}
												inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
											/>
										</Tooltip>

										<Button
											sx={{ ml: "auto", width: "fit-content" }}
											disabled={!tokenBalance}
											onClick={() => {
												if (tokenBalance) {
													setBalanceDelta(0)
													handleConversions("tokensToSups", tokenBalance)
												}
											}}
										>
											<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="body1">
												Max: <b>{tokenBalance ? parseFloat(formatUnits(tokenBalance, tokenDecimals)).toPrecision(4) : "--"}</b>
											</Typography>
										</Button>
									</Box>

									<Box sx={{ display: "flex", backgroundColor: colors.inputBg, borderRadius: "10px", padding: ".5rem 1rem", gap: ".5em" }}>
										<Box sx={{ display: "flex", flexDirection: "column", gap: ".5em", width: "100%" }}>
											<Box sx={{ display: "flex", justifyContent: "space-between" }}>
												<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
													To:
												</Typography>

												<Typography variant="body1" sx={{ textTransform: "uppercase", fontSize: ".8rem", fontWeight: 600 }}>
													1 <span style={{ fontSize: ".5rem", marginRight: "0.3rem" }}>x</span> $Sups = 12c
												</Typography>
											</Box>
											<Box sx={{ position: "relative" }}>
												<Box
													component="img"
													src={SupsToken}
													alt="token image"
													sx={{
														position: "absolute",
														top: "50%",
														left: "1em",
														transform: "translateY(-50%)",
														height: "24px",
														marginRight: ".5rem",
														"@media (max-width:1000px)": {
															left: ".5em",
														},
													}}
												/>
												<TextField
													// disabled
													variant="filled"
													value={supsDisplay || ""}
													type="number"
													onChange={(e) => {
														try {
															if (e.target.value === "") setTokenDisplay(null) // if empty allow empty
															setSupsDisplay(e.target.value.toString())
															setBalanceDelta(undefined)
														} catch (e) {
															console.error(e)
															setTokenAmt(BigNumber.from(0))
															setSupsAmt(BigNumber.from(0))
															setTokenDisplay(null)
															setSupsDisplay(null)
														}
													}}
													onBlur={(e) => {
														if (e.target.value.length > 0) {
															const amt = parseUnits(e.target.value, 18)
															handleConversions("supsToTokens", amt)
														}
													}}
													sx={{
														width: "100%",
														fontWeight: 800,
														background: colors.darkNavyBackground2,
														borderRadius: "8px",
														"& input": {
															p: ".5em",
															pt: "0.8em",
															pl: "2em",
														},
														"&>div": {
															background: "none !important",
															"&::before": {
																border: "none !important",
															},
															"&::after": {
																border: "none !important",
															},
														},
														"& *::after, & *::before, &:hover": { p: 0, border: "none" },
														"& 	.MuiTextField-root": {
															background: "inherit",
														},
														"& .MuiFilledInput-underline:after": {
															borderBottomColor: "none",
														},
														"& 	.MuiTextField-root.Mui-disabled": {
															backgroundColor: colors.lightNavyBlue,
														},
														"& 	.MuiTextField-root.Mui-focused": {
															backgroundColor: colors.lightNavyBlue,
														},
														input: { color: colors.skyBlue, fontSize: "1.2rem", fontWeight: 800, lineHeight: 0.5 },
													}}
													inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
												/>
												<Typography
													sx={{
														position: "absolute",
														top: "50%",
														right: "10px",
														opacity: 0.2,
														transform: "translateY(-50%)",
														pointerEvents: "none",
													}}
												>
													approx.
												</Typography>
											</Box>
										</Box>
									</Box>
								</Stack>
								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: ".5em",
										width: "100%",
									}}
								>
									{user && user.public_address && (
										<Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "100%", padding: "0 .5rem" }}>
											<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="body1">
												Account: {AddressDisplay(user.public_address)}{" "}
												<span
													style={{ cursor: "pointer" }}
													onClick={() => {
														logout()
													}}
												>
													(disconnect)
												</span>
											</Typography>
											<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="body1">
												$SUPS in Account: <b>{userSups ? parseFloat(formatUnits(userSups, supsDecimals)).toFixed(2) : "--"}</b>
											</Typography>
										</Box>
									)}

									{/* <Typography sx={{ color: colors.darkGrey, fontWeight: 600 }} variant="body1">
										Wallet Balance: <b>{supBalance ? parseFloat(formatUnits(supBalance, supsDecimals)).toFixed(2) : "--"}</b>
									</Typography> */}
								</Box>
							</Box>

							<FancyButton
								borderColor={colors.skyBlue}
								disabled={
									!acceptedChainExceptions ||
									!tokenBalance ||
									tokenAmt.gte(tokenBalance) ||
									tokenAmt.eq(0) ||
									supsAmt.gt(amountRemaining) ||
									loading ||
									exchangeRates === undefined
								}
								sx={{ width: "60%", minWidth: "200px", alignSelf: "center" }}
								type="submit"
								fancy
							>
								{(() => {
									if (!tokenBalance) return "Fetching Balance"
									if (tokenAmt.gte(tokenBalance)) {
										return `Insufficient ${currentToken.name.toUpperCase()} Balance`
									} else if (!tokenDisplay) {
										return "Enter values"
									} else if (supsAmt.gt(amountRemaining)) {
										return `Insufficient SUPS Remaining`
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
