import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import { Box, Button, LinearProgress, Link, Stack, TextField, Typography, useTheme } from "@mui/material"
import { BigNumber } from "ethers"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import React, { useCallback, useEffect, useState } from "react"
import Arrow from "../assets/images/arrow.png"
import SupsToken from "../assets/images/supsToken.png"
import { BINANCE_CHAIN_ID, ETHEREUM_CHAIN_ID } from "../config"
import { useAuth } from "../containers/auth"
import { SocketState, useWebsocket } from "../containers/socket"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { useSecureSubscription } from "../hooks/useSecureSubscription"
import HubKey from "../keys"
import { colors } from "../theme"
import { ExchangeRates, tokenName, tokenSelect } from "../types/types"
import { ConnectWallet } from "./connectWallet"
import { FancyButton } from "./fancyButton"
import { MetaMaskLogin } from "./loginMetaMask"
import { SupFancyButton } from "./supremacy/supFancyButton"
import { TokenSelect } from "./tokenSelect"
type conversionType = "supsToTokens" | "tokensToSups"
type transferStateType = "waiting" | "error" | "confirm" | "none"

export const BuyTokens: React.FC<{ publicSale?: boolean }> = ({ publicSale }) => {
	const { state, subscribe } = useWebsocket()
	const { user } = useAuth()
	const {
		changeChain,
		amountRemaining,
		currentChainId,
		nativeBalance,
		stableBalance,
		sendNativeTransfer,
		sendTransferToPurchaseAddress,
		metaMaskState,
		supBalance,
		setCurrentToken,
		currentToken,
		tokenOptions,
		account,
	} = useWeb3()
	const theme = useTheme()

	const [selectedTokenName, setSelectedTokenName] = useState<tokenName>("eth")
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

	const handleConversions = useCallback(
		(direction: conversionType, value: BigNumber) => {
			if (value.toString() === "") {
				setTokenAmt(BigNumber.from(0))
				setSupsAmt(BigNumber.from(0))
				return
			}
			if (currentToken.isNative && exchangeRates) {
				switch (currentToken.name) {
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
		[currentToken, exchangeRates],
	)

	// // handles network switch and default network token name
	useEffect(() => {
		if (currentChainId && acceptedChainExceptions) {
			if (currentChainId === parseInt(BINANCE_CHAIN_ID)) {
				const filteredChain = tokenOptions.filter((el) => {
					return el.chainId === parseInt(BINANCE_CHAIN_ID)
				})
				setCurrentToken(filteredChain[0])
				return
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
	}, [currentChainId, acceptedChainExceptions, setCurrentToken, tokenOptions])

	useEffect(() => {
		if (tokenAmt && tokenAmt.gt(0)) {
			handleConversions("tokensToSups", tokenAmt)
		}
	}, [handleConversions, tokenAmt])

	useEffect(() => {
		if (state !== SocketState.OPEN) return
		return subscribe<ExchangeRates>(HubKey.SupExchangeRates, (rates) => {
			if (rates)
				if (rates.BNBtoUSD === 0 || rates.ETHtoUSD === 0 || rates.SUPtoUSD === 0) {
					return
				}
			setExchangeRates(rates)
		})
	}, [state])

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

	let tokenBalance: BigNumber | null = stableBalance
	if (currentToken.isNative) {
		tokenBalance = nativeBalance
	}
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
					(acceptedChainExceptions && currentChainId === currentToken.chainId) || metaMaskState !== MetaMaskState.Active
						? { display: "none" }
						: {
								position: "absolute",
								zIndex: 5,
								padding: "1rem",
								height: "100%",
								width: publicSale ? "25rem" : "100%",
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								background: publicSale ? colors.darkerNavyBackground : "unset",
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
									background: colors.darkerNavyBackground,
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
									background: colors.darkerNavyBackground,
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
									background: colors.darkerNavyBackground,
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
						Purchasing {parseFloat(formatUnits(supsAmt, 18)).toFixed(2)} SUPS with {parseFloat(formatUnits(tokenAmt, 18)).toFixed(2)}{" "}
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
				sx={{
					background: publicSale ? colors.darkNavyBlue : "unset",
					p: publicSale ? "2em" : "unset",
					"@media (max-width:400px)": {
						p: "1rem",
					},
				}}
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
						<Box sx={{ display: "flex", flexDirection: "column", minHeight: "20rem", justifyContent: "space-between", alignItems: "center" }}>
							<Box sx={{ position: "relative", width: "100%", display: "flex", flexDirection: "column", gap: "1em" }}>
								<Stack sx={{ gap: ".7em" }}>
									<Box
										component="img"
										src={Arrow}
										alt="token image"
										sx={{
											height: "2.5rem",
											position: "absolute",
											top: "43%",
											left: "50%",
											transform: "translate(-50%,-50%)",
											zIndex: 2,
											borderRadius: "50%",
										}}
									/>
									<Box
										sx={{
											display: "flex",
											backgroundColor: colors.inputBg,
											borderRadius: "10px",
											padding: ".5rem 1rem",
										}}
									>
										<Stack
											sx={{
												gap: ".5em",
												justifyContent: "space-between",
											}}
										>
											<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
												From:{" "}
											</Typography>
											<TextField
												color="secondary"
												fullWidth
												variant="standard"
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
													mb: ".7rem",
													fontWeight: 800,
													border: "none",
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
										</Stack>

										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
												alignItems: "flex-end",
												gap: ".5em",
											}}
										>
											<TokenSelect
												currentToken={currentToken}
												cb={async (newToken: tokenSelect) => {
													await changeChain(newToken.chainId)
													setTokenAmt(BigNumber.from(0))
													setTokenDisplay(null)
													setSupsAmt(BigNumber.from(0))
													setSupsDisplay(null)
													setCurrentToken(newToken)
												}}
											/>
											<Button
												disabled={!tokenBalance}
												sx={{ marginLeft: "auto" }}
												onClick={() => {
													if (tokenBalance) {
														setTokenAmt(tokenBalance)
														setTokenDisplay(formatUnits(tokenBalance, 18))
														handleConversions("tokensToSups", tokenBalance)
													}
												}}
											>
												<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="body1">
													Balance: <b>{tokenBalance ? parseFloat(formatUnits(tokenBalance, 18)).toFixed(4) : "--"}</b>
												</Typography>
											</Button>
										</Box>
									</Box>

									<Box sx={{ display: "flex", backgroundColor: colors.inputBg, borderRadius: "10px", padding: ".5rem 1rem", gap: "1em" }}>
										<Box sx={{ flexGrow: "2" }}>
											<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="h6">
												To:
											</Typography>
											<TextField
												// disabled
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
													width: "100%",
													pointerEvents: "none",
													backgroundColor: colors.inputBg,
													"& 	.MuiFilledInput": {
														background: "none",
													},
													"& 	.MuiFilledInput-root": {
														backgroundColor: "none",
													},
													"& .MuiFilledInput-underline:after": {
														borderBottomColor: colors.skyBlue,
													},
													"& 	.MuiFilledInput-root.Mui-disabled": {
														backgroundColor: "none",
													},
													"& .MuiInputBase-root, & input": {
														background: "none",
													},
													input: { color: colors.skyBlue, fontSize: "1.2rem", fontWeight: 800, p: 0 },
												}}
												inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
											/>
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
									<Box sx={{ display: "flex", gap: ".5em", alignItems: "center" }}>
										<Box
											component="img"
											src={SupsToken}
											alt="token image"
											sx={{
												height: "24px",
											}}
										/>
										<Typography variant="body1" sx={{ textTransform: "uppercase", fontSize: ".8rem", fontWeight: 600 }}>
											$Sups
										</Typography>
									</Box>
									<Typography sx={{ color: colors.lightNavyBlue2, fontWeight: 800 }} variant="body1">
										Balance: <b>{userSups ? parseFloat(formatUnits(BigNumber.from(2321), 18)).toFixed(2) : "--"}</b>
									</Typography>
									{/* <Typography sx={{ color: colors.darkGrey, fontWeight: 600 }} variant="body1">
										Wallet Balance: <b>{supBalance ? parseFloat(formatUnits(supBalance, 18)).toFixed(2) : "--"}</b>
									</Typography> */}
								</Box>
							</Box>

							<FancyButton
								borderColor={colors.skyBlue}
								disabled={
									!acceptedChainExceptions ||
									!tokenBalance ||
									tokenAmt.gt(tokenBalance) ||
									tokenAmt.eq(0) ||
									supsAmt.gt(amountRemaining) ||
									loading ||
									exchangeRates === undefined
								}
								sx={{ width: "60%", minWidth: "200px", alignSelf: "center", marginTop: "1.5rem" }}
								type="submit"
								fancy
							>
								{(() => {
									if (!tokenBalance) return "Fetching Balance"
									if (tokenAmt.gt(tokenBalance)) {
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
