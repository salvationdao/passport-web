import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import {
	Box,
	Button,
	ButtonGroup,
	InputAdornment,
	LinearProgress,
	Link,
	MenuItem,
	outlinedInputClasses,
	Select,
	SelectChangeEvent,
	SelectProps,
	Stack,
	styled,
	TextField,
	TextFieldProps,
	Typography,
	useTheme,
} from "@mui/material"
import { ethers } from "ethers"
import React, { useCallback, useEffect, useState } from "react"
import { MetaMaskIcon } from "../assets"
import BinanceCoin from "../assets/images/crypto/binance-coin-bnb-logo.svg"
import BinanceUSD from "../assets/images/crypto/binance-usd-busd-logo.svg"
import Ethereum from "../assets/images/crypto/ethereum-eth-logo.svg"
import Usdc from "../assets/images/crypto/usd-coin-usdc-logo.svg"
import SupsToken from "../assets/images/sup-token.svg"
import { BINANCE_CHAIN_ID, BUSD_CONTRACT_ADDRESS, ETHEREUM_CHAIN_ID, USDC_CONTRACT_ADDRESS, WBNB_CONTRACT_ADDRESS, WETH_CONTRACT_ADDRESS } from "../config"
import { SocketState, useWebsocket } from "../containers/socket"
import { MetaMaskState, useWeb3, web3Constants } from "../containers/web3"
import HubKey from "../keys"
import { colors } from "../theme"
import { ConnectWallet } from "./connectWallet"
import { FancyButton } from "./fancyButton"

//styled MUI components at root, where sx can't change them
const StyledSelect = styled(Select)<SelectProps>(
	({ theme }) =>
		`& .${outlinedInputClasses.notchedOutline} {
		border-color: ${theme.palette.primary.dark};
		border-width: 2px;
	  }
	  &:hover .${outlinedInputClasses.notchedOutline} {
		border-color: ${theme.palette.primary.light};
		border-width: 2px;
	  }
	  &.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline} {
		border-color: ${theme.palette.primary.main};
		border-width: 2px;
	  }
	  `,
)
const StyledTextField = styled(TextField)<TextFieldProps>(
	({ theme }) =>
		`
	& .${outlinedInputClasses.root} .${outlinedInputClasses.notchedOutline} {
		border-color: ${theme.palette.primary.dark};
		border-radius: 0;
	}
	&:hover .${outlinedInputClasses.root} .${outlinedInputClasses.notchedOutline} {
		border-color: ${theme.palette.primary.light};
		border-radius: 0;
	}
	& .${outlinedInputClasses.root}.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline} {
		border-color: ${theme.palette.primary.main};
		border-radius: 0;
	}
	`,
)

type conversionType = "supsToTokens" | "tokensToSups"
type tokenName = "weth" | "usdc" | "wbnb" | "busd"
type transferStateType = "waiting" | "error" | "confirm" | "none"

export const BuyTokens: React.FC = () => {
	const { subscribe, state } = useWebsocket()
	const { changeChain, currentChainId, getBalance, sendTransfer, metaMaskState } = useWeb3()
	const theme = useTheme()

	const [selectedChainId, setSelectedChainId] = useState<number>(parseInt(ETHEREUM_CHAIN_ID.toString()))
	const [isNativeToken, setIsNativeToken] = useState<boolean>(true)
	const [currentToken, setCurrentToken] = useState<tokenName>("weth")
	const [tokenValue, setTokenValue] = useState<string>("")
	const [supsValue, setSupsValue] = useState<string>("")
	const [amountRemaining, setAmountRemaining] = useState<number>(0)
	const [userBalance, setUserBalance] = useState<number>(0)
	const [transferState, setTransferState] = useState<transferStateType>("none")
	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")
	const [scanSite, setScanSite] = useState<string>("")
	const [transferError, setTransferError] = useState<any>(null)
	const [loading, setLoading] = useState<boolean>(false)

	const [contractAddr, setContractAddr] = useState<string>("")

	const acceptedChainExceptions = currentChainId?.toString() === ETHEREUM_CHAIN_ID || currentChainId?.toString() === BINANCE_CHAIN_ID

	const handleConversions = useCallback(
		(direction: conversionType, value: number) => {
			if (value.toString() === "") {
				setTokenValue("")
				setSupsValue("")
				return
			}
			if (isNativeToken) {
				switch (currentToken) {
					case "wbnb":
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
		[currentToken, isNativeToken],
	)

	useEffect(() => {
		if (currentChainId && acceptedChainExceptions) {
			setSelectedChainId(currentChainId)

			switch (currentChainId) {
				case web3Constants.ethereumChainId:
					setScanSite("etherscan.io")
					break
				case web3Constants.binanceChainId:
					setScanSite("bscscan.com")
					break
				case web3Constants.goerliChainId:
					setScanSite("goerli.etherscan.io")
					break
				case web3Constants.bscTestNetChainId:
					setScanSite("testnet.bscscan.com")
					break
			}
		} else {
			setSelectedChainId(parseInt(ETHEREUM_CHAIN_ID))
		}
	}, [currentChainId, acceptedChainExceptions])

	useEffect(() => {
		if (tokenValue !== "") {
			handleConversions("tokensToSups", parseFloat(tokenValue))
		}
	}, [handleConversions, tokenValue])

	//setting current token
	useEffect(() => {
		if (currentChainId?.toString() === ETHEREUM_CHAIN_ID && !isNativeToken) {
			setCurrentToken("usdc")
			return
		}
		if (currentChainId?.toString() === BINANCE_CHAIN_ID && isNativeToken) {
			setCurrentToken("wbnb")
			return
		}
		if (currentChainId?.toString() === BINANCE_CHAIN_ID && !isNativeToken) {
			setCurrentToken("busd")
			return
		}
		setCurrentToken("weth")
		return
	}, [isNativeToken, currentChainId])

	//getting user balance
	useEffect(() => {
		setUserBalance(0)
		setLoading(true)
		;(async () => {
			try {
				const response = await getBalance(contractAddr)
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
	}, [contractAddr, getBalance])

	//Setting up websocket to listen to remaining supply
	useEffect(() => {
		if (state !== SocketState.OPEN) return
		return subscribe<string>(HubKey.SupTotalRemaining, (amount) => {
			const amountSups = parseFloat(ethers.utils.formatUnits(amount, 18)).toFixed(2)
			setAmountRemaining(parseFloat(amountSups))
		})
	}, [subscribe, state])

	const handleSelectChange = (event: SelectChangeEvent<unknown>) => {
		const value = parseInt(event.target.value as string)
		setSelectedChainId(value)
	}

	const handleNetworkSwitch = async () => {
		await changeChain(selectedChainId)
		setIsNativeToken(true)
		setTokenValue("")
		setSupsValue("")
	}

	useEffect(() => {
		switch (currentToken) {
			case "usdc":
				setContractAddr(USDC_CONTRACT_ADDRESS)
				return
			case "wbnb":
				setContractAddr(WBNB_CONTRACT_ADDRESS)
				return
			case "busd":
				setContractAddr(BUSD_CONTRACT_ADDRESS)
				return
			default:
				setContractAddr(WETH_CONTRACT_ADDRESS)
				return
		}
	}, [currentToken])

	async function handleTransfer() {
		const value = parseFloat(tokenValue)
		const supsNumValue = parseFloat(supsValue)

		if (value <= 0 || supsNumValue > amountRemaining) return

		setLoading(true)
		setTransferState("waiting")
		try {
			if (state !== SocketState.OPEN) return

			const tx = await sendTransfer(contractAddr, value)

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

	const currencyTextField = () => {
		let path
		let currency
		switch (currentToken) {
			case "usdc":
				path = Usdc
				currency = "USDC"
				break
			case "wbnb":
				path = BinanceCoin
				currency = "wBNB"
				break
			case "busd":
				path = BinanceUSD
				currency = "BUSD"
				break
			default:
				path = Ethereum
				currency = "wETH"
				break
		}

		return (
			<StyledTextField
				fullWidth
				value={tokenValue}
				onChange={(e) => {
					const value = e.target.value
					setTokenValue(value)
					handleConversions("tokensToSups", parseFloat(value))
				}}
				type="number"
				sx={{ backgroundColor: colors.darkNavyBlue }}
				InputProps={{
					endAdornment: <InputAdornment position="end">{currency}</InputAdornment>,
					startAdornment: (
						<InputAdornment position="start">
							<Box
								component="img"
								src={path}
								alt="token image"
								sx={{
									height: "1.5rem",
									marginRight: "1rem",
								}}
							/>
						</InputAdornment>
					),
				}}
				inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
			/>
		)
	}

	return (
		<Box sx={{ width: "90vw", minWidth: "300px", maxWidth: "500px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
			{/* Network Select Component */}
			<StyledSelect
				disabled={transferState !== "none" || metaMaskState !== MetaMaskState.Active}
				value={selectedChainId.toString()}
				onChange={(e) => handleSelectChange(e)}
				displayEmpty={true}
				sx={{
					marginBottom: "1rem",
					borderRadius: "0",
					marginLeft: "auto",
					display: "flex",
					minWidth: "150px",
				}}
				SelectDisplayProps={{ style: { display: "flex", alignItems: "center", padding: "0 32px 0 .5rem" } }}
			>
				<MenuItem value={ETHEREUM_CHAIN_ID}>
					<Box
						component="img"
						src={Ethereum}
						alt="Ethereum token symbol"
						sx={{
							height: "1.5rem",
							marginRight: "1rem",
						}}
					/>
					<p>{ETHEREUM_CHAIN_ID === web3Constants.goerliChainId.toString() ? "Goerli" : "Ethereum"}</p>
				</MenuItem>
				<MenuItem value={BINANCE_CHAIN_ID}>
					<Box
						component="img"
						src={BinanceCoin}
						alt="Binance coin symbol"
						sx={{
							height: "1.5rem",
							marginRight: "1rem",
						}}
					/>
					<p>{BINANCE_CHAIN_ID === web3Constants.bscTestNetChainId.toString() ? "BSC Testnet" : "Binance"}</p>
				</MenuItem>
			</StyledSelect>

			<Box
				sx={{
					border: {
						xs: `2px solid ${theme.palette.primary.main}`,
						md: "none",
					},
					position: "relative",
				}}
			>
				{/* Switch Network Dialog */}
				<Box
					sx={
						(acceptedChainExceptions && currentChainId === selectedChainId) || metaMaskState !== MetaMaskState.Active
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
					<FancyButton onClick={handleNetworkSwitch}>Switch Network</FancyButton>
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
						<CheckCircleIcon sx={{ fontSize: "50px", color: theme.palette.primary.main }} />
						<Typography variant="h3" sx={{ margin: "2rem 0 0 0", textTransform: "uppercase" }}>
							Success
						</Typography>
						<Typography variant="h4" sx={{ margin: "1rem 0" }}>
							Transaction has been submitted
						</Typography>
						<Typography variant="body1">
							<Link href={`https://${scanSite}/tx/${currentTransferHash}`} target="_blank">
								View on Explorer
							</Link>
						</Typography>
						<FancyButton
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
						<ErrorIcon sx={{ fontSize: "50px", color: theme.palette.primary.main }} />
						<Typography variant="h3" sx={{ margin: "2rem 0 1rem 0", textTransform: "uppercase" }}>
							Error
						</Typography>
						<Typography variant="h4">
							{transferError ? (transferError.code === 4001 ? "Transaction Rejected" : "Purchase Failed") : null}
						</Typography>
						<Typography sx={{ marginTop: "1rem" }} variant="body1">
							{transferError ? (transferError.code === undefined ? transferError : null) : null}
						</Typography>

						<Box sx={{ margin: "2rem 0", display: "flex", width: "70%", justifyContent: "space-around" }}>
							<FancyButton sx={{ minWidth: "7rem" }} onClick={() => setTransferState("none")}>
								Close
							</FancyButton>

							<FancyButton type="submit" sx={{ minWidth: "7rem" }} onClick={handleTransfer}>
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
							<LinearProgress />
						</Box>
						<Typography variant="h3" sx={{ textTransform: "uppercase", margin: "1rem 0" }}>
							Waiting on Confirmation
						</Typography>

						<Typography variant="body1">
							Purchasing {supsValue} SUPS with {tokenValue} {currentToken.toUpperCase()}
						</Typography>
						<Typography variant="body1">Confirm this transaction in your wallet</Typography>
						<Box sx={{ width: "100%", marginTop: "1rem" }}>
							<LinearProgress />
						</Box>
					</Stack>
				</Box>

				{/* Purchase Sups Form */}
				<Box
					sx={
						acceptedChainExceptions && currentChainId === selectedChainId && transferState === "none"
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
					{/* Button Group */}
					<ButtonGroup sx={{ width: "100%", marginBottom: "1rem" }}>
						<Button
							disableRipple
							onClick={(e) => setIsNativeToken(true)}
							sx={{ width: "50%", borderRadius: "0" }}
							variant={isNativeToken ? "contained" : "outlined"}
						>
							{currentChainId === web3Constants.binanceChainId || currentChainId === web3Constants.bscTestNetChainId ? "WBNB" : "WETH"}
						</Button>
						<Button
							disableRipple
							onClick={(e) => setIsNativeToken(false)}
							sx={{ width: "50%", borderRadius: "0" }}
							variant={isNativeToken ? "outlined" : "contained"}
						>
							{currentChainId === web3Constants.binanceChainId || currentChainId === web3Constants.bscTestNetChainId ? "BUSD" : "USDC"}
						</Button>
					</ButtonGroup>
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

					{/* Form */}
					<form onSubmit={handleSubmit}>
						<Box sx={{ display: "flex", flexDirection: "column", height: "30vh", justifyContent: "space-between" }}>
							<Box sx={{ display: "flex", flexDirection: "column" }}>
								{currencyTextField()}
								<FancyButton
									disabled={userBalance === 0}
									sx={{ borderWidth: "1px", marginTop: ".5rem", marginLeft: "auto" }}
									variant="outlined"
									onClick={() => {
										setTokenValue(userBalance.toString())
										handleConversions("tokensToSups", userBalance)
									}}
								>
									<Typography variant="body1">
										Max: <b>{userBalance ? userBalance.toFixed(2) : "--"} </b>
									</Typography>
								</FancyButton>
							</Box>
							<Box sx={{ margin: "1.5rem 0" }}>
								<StyledTextField
									sx={{ backgroundColor: colors.darkNavyBlue }}
									onChange={(e) => {
										const value = e.target.value
										setSupsValue(value)
										handleConversions("supsToTokens", parseFloat(value))
									}}
									value={supsValue}
									fullWidth
									type="number"
									InputProps={{
										endAdornment: <InputAdornment position="end">SUPS</InputAdornment>,
										startAdornment: (
											<InputAdornment position="start">
												<Box
													component="img"
													src={SupsToken}
													alt="token image"
													sx={{
														height: "1.5rem",
														marginRight: "1rem",
													}}
												/>
											</InputAdornment>
										),
									}}
									inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
								/>
								<Box sx={{ width: "100%" }}>
									<Typography variant="body1">1 SUP = 0.12 USD</Typography>
								</Box>
							</Box>

							{/* Progress Bar */}
							<Box sx={{ width: "100%", backgroundColor: `${theme.palette.primary.dark}` }}>
								<Box
									sx={{
										backgroundColor: `${theme.palette.primary.main}`,
										width: `${100 - (amountRemaining / web3Constants.totalSaleSups) * 100}%`,
										height: "2rem",
									}}
								/>
							</Box>
							<Box>
								<Typography
									variant="body1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									{(amountRemaining / 10 ** 6).toFixed(2)}m of 217M Tokens remaining
								</Typography>
								<Typography
									variant="body1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									{((amountRemaining / web3Constants.totalSaleSups) * 100).toFixed(2)}% of total supply
								</Typography>
							</Box>
							<FancyButton
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
										return `Insufficient ${currentToken} Balance`
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
