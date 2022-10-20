import { formatUnits, parseUnits } from "@ethersproject/units"
import AddIcon from "@mui/icons-material/Add"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import HelpCenterIcon from "@mui/icons-material/HelpCenter"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import RemoveIcon from "@mui/icons-material/Remove"
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	ClickAwayListener,
	InputBase,
	Paper,
	Stack,
	styled,
	Tooltip,
	Typography,
	useMediaQuery,
} from "@mui/material"
import { BigNumber, constants } from "ethers"
import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Axe from "../../assets/images/gradient/axe.png"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { ModalWithClose } from "../../components/modalWithClose"
import { ConnectWalletOverlay } from "../../components/transferStatesOverlay/connectWalletOverlay"
import { SwitchNetworkOverlay } from "../../components/transferStatesOverlay/switchNetworkOverlay"
import {
	BINANCE_CHAIN_ID,
	BSC_SCAN_SITE,
	FARM_CONTRACT_ADDRESS,
	LP_TOKEN_ADDRESS,
	PANCAKE_POOL_ADDRESS,
	PANCAKE_SWAP_ADDRESS,
	SUPS_CONTRACT_ADDRESS,
	WRAPPED_BNB_ADDRESS,
} from "../../config"
import { FarmData, useWeb3 } from "../../containers/web3"
import { countDecimals } from "../../helpers"
import { colors } from "../../theme"

const showAPR = false

export const FarmsPage = () => {
	const { changeChain, currentChainId, account } = useWeb3()
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
			}}
		>
			<Navbar />
			<Box
				sx={{
					display: "flex",
					flex: 1,
					m: "0 2rem 2rem 2rem",
				}}
			>
				<Paper
					sx={{
						display: "flex",
						flex: 1,
						flexDirection: "column",
						alignItems: "center",
						padding: "1rem",
						overflow: "auto",
						borderRadius: 1.5,
						gap: "1rem",
						justifyContent: "center",
						position: "relative",
					}}
				>
					{currentChainId && currentChainId.toString() !== BINANCE_CHAIN_ID && (
						<SwitchNetworkOverlay changeChain={changeChain} currentChainId={currentChainId} newChainID={BINANCE_CHAIN_ID} />
					)}
					{!account && <ConnectWalletOverlay walletIsConnected={!!account} />}
					<Stack gap="1rem" alignItems="center">
						<Box
							component="img"
							src={Axe}
							alt="Image of an axe"
							sx={{
								mx: "auto",
								maxWidth: "10rem",
								height: "10rem",
								objectFit: "contain",
								"@media (max-height:1100px)": {
									height: "6rem",
								},
							}}
						/>
						<Typography variant="h1" sx={{ textTransform: "uppercase", fontFamily: "bizmobold" }}>
							Liquidity Farming
						</Typography>
						<Typography sx={{ textTransform: "uppercase", fontFamily: "bizmobold", color: colors.errorRed, fontSize: "1.2rem" }}>
							Staking has ended
						</Typography>
					</Stack>
					{currentChainId && currentChainId.toString() === BINANCE_CHAIN_ID && account && <FarmCard />}
				</Paper>
			</Box>
		</Box>
	)
}

interface FarmCardProps {}

interface FarmInfoProps {
	block: number
	loading: boolean
	lpBalance: BigNumber
	stakingBalance: BigNumber
	userRewardRate: BigNumber
	rewardRate: BigNumber
	yieldPercentage: number
	hasAllowance: boolean
}

const InfoLabel = styled("span")({
	fontFamily: "bizmobold",
	textTransform: "uppercase",
	display: "flex",
	justifyContent: "flex-end",
	color: colors.darkNeonPink,
})
const InfoValue = styled("span")({
	fontFamily: "bizmomedium",
	textTransform: "capitalize",
	justifySelf: "flex-start",
	width: "fit-content",
})

const LabelContainer = styled("div")({
	fontSize: "1.1rem",
	display: "flex",
	alignItems: "center",
	justifyContent: "space-between",
	gap: "1rem",
	width: "100%",
})

const FarmInfo = (props: FarmInfoProps) => {
	let apr = props.loading ? "--- %" : `${(props.yieldPercentage !== Infinity ? props.yieldPercentage * 100 : 0).toFixed(4)}%`

	if (props.yieldPercentage === 0) {
		apr = "--- %"
	}

	return (
		<Stack gap=".2rem" justifyContent="center" sx={{ width: "100%" }}>
			<Stack justifyContent="space-between" sx={{ width: "100%" }}>
				{showAPR && (
					<LabelContainer>
						<InfoLabel>* Dynamic APR:</InfoLabel>{" "}
						<InfoValue sx={{ display: "flex", alignItems: "center", gap: ".5rem" }}>{apr}</InfoValue>
					</LabelContainer>
				)}
			</Stack>

			{formatUnits(props.userRewardRate) && props.hasAllowance && (
				<LabelContainer>
					<InfoLabel>Your reward rate:</InfoLabel>{" "}
					<InfoValue>
						{props.loading ? "---" : "0.000000"}{" "}
						<span style={{ fontSize: "1rem" }}>
							SUPS/<span style={{ fontSize: ".8rem" }}>s</span>
						</span>
					</InfoValue>
				</LabelContainer>
			)}
		</Stack>
	)
}

const FarmCard = (props: FarmCardProps) => {
	const { provider, signer, account, block, farmInfo, farmWithdraw, farmExit, farmCheckAllowance, farmLPApproveMax, farmStake, farmGetReward } =
		useWeb3()
	const [data, setData] = useState<FarmData | null>(null)
	const [stakeAmount, setStakeAmount] = useState<BigNumber | null>(null)
	const [stakeDisplayAmount, setStakeDisplayAmount] = useState<string>("")
	const [withdrawAmount, setWithdrawAmount] = useState<BigNumber | null>(null)
	const [withdrawDisplayAmount, setWithdrawDisplayAmount] = useState<string>("")
	const [hasAllowance, setHasAllowance] = useState<boolean>(false)
	const [withdrawError, setWithdrawError] = useState<string | null>(null)
	const [stakeError, setStakeError] = useState<string | null>(null)
	const [pending, setPending] = useState<{ [key: string]: boolean }>({})
	const [web3error, setWeb3Error] = useState<string | null>(null)
	const [openStaking, setOpenStaking] = useState<boolean | null>(false)
	const [isStaking, setIsStaking] = useState<boolean | null>(false)
	const [openTutorial, setOpenTutorial] = useState<boolean | null>(false)
	const [openInfoApr, setOpenInfoApr] = useState<boolean>(false)
	const isMobile = useMediaQuery("(max-width:600px)")

	useEffect(() => {
		setStakeError(null)
		if (data && !data.stakingBalance) return
		if (data && stakeAmount && stakeAmount.gt(data.lpBalance)) {
			setStakeError("Not enough SUPS-BNB LP in wallet")
			return
		}
	}, [data, stakeAmount])

	useEffect(() => {
		setWithdrawError(null)
		if (data && !data.stakingBalance) return
		if (data && withdrawAmount && withdrawAmount.gt(data.stakingBalance)) {
			setWithdrawError("Not enough SUPS-BNB LP staked in farming pool")
			return
		}
	}, [data, withdrawAmount])

	useEffect(() => {
		if (!provider || !signer || !account) return
		farmInfo(FARM_CONTRACT_ADDRESS, PANCAKE_POOL_ADDRESS, LP_TOKEN_ADDRESS, SUPS_CONTRACT_ADDRESS, WRAPPED_BNB_ADDRESS)
			.then((data) => {
				if (!data) return
				if (!pending.claim) {
					setData(data)
				}
			})
			.catch((err) =>
				console.error(
					`get farm info with farm address ${FARM_CONTRACT_ADDRESS}, pancake pool ${PANCAKE_POOL_ADDRESS}, lp token ${LP_TOKEN_ADDRESS},  supsContractAddr ${SUPS_CONTRACT_ADDRESS}, wbnbContractAddr ${WRAPPED_BNB_ADDRESS}:`,
					err,
				),
			)
		farmCheckAllowance(FARM_CONTRACT_ADDRESS, constants.MaxUint256)
			.then((can) => {
				setHasAllowance(can)
			})
			.catch((err) => console.error(`check farm allowance (${FARM_CONTRACT_ADDRESS}) for LP token (${LP_TOKEN_ADDRESS}):`, err))
	}, [block, provider, signer, account, farmCheckAllowance, farmInfo, pending])

	useEffect(() => {
		if (typeof window !== "undefined") {
			if (!hasAllowance && localStorage.getItem("disable_staking_tutorial") !== "true") {
				setOpenTutorial(true)
			}
		}
	}, [hasAllowance])

	let disableStakeButton = false
	if (!stakeAmount || stakeAmount.eq(0) || stakeDisplayAmount === "") disableStakeButton = true
	if (!hasAllowance) disableStakeButton = true
	if (data && stakeAmount && stakeAmount.gt(data.lpBalance)) disableStakeButton = true

	let disableWithdrawButton = false
	if (!withdrawAmount || withdrawAmount.eq(0) || withdrawDisplayAmount === "") disableWithdrawButton = true
	if (data && withdrawAmount && withdrawAmount.gt(data.stakingBalance)) disableWithdrawButton = true

	let disableClaimButton = false
	if (data && data.earned.lte(0)) {
		disableClaimButton = true
	}

	if (pending.claim || pending.exit || pending.withdraw || pending.stake) disableWithdrawButton = true
	if (pending.claim || pending.exit || pending.withdraw || pending.stake) disableClaimButton = true
	if (pending.claim || pending.exit || pending.withdraw || pending.stake) disableStakeButton = true

	let showStakeButton = false
	if (hasAllowance && !openStaking && data?.stakingBalance.lte(BigNumber.from(0))) showStakeButton = true

	let showStakeText = false
	if (hasAllowance && !showStakeButton && openStaking) showStakeText = true

	let showAddMinusButtons = false
	if (hasAllowance && !showStakeButton && !openStaking) showAddMinusButtons = true

	const handleSubmitWithdraw = async () => {
		if (pending.claim || pending.exit || pending.withdraw) disableWithdrawButton = true
		if (!withdrawAmount) return
		if (!data) return
		if (withdrawAmount.gt(data.stakingBalance)) return
		if (withdrawAmount.eq(data.stakingBalance)) {
			try {
				setPending({ ...pending, withdraw: true })
				const tx = await farmExit(FARM_CONTRACT_ADDRESS)
				await tx.wait()
				setPending({ ...pending, withdraw: false })
				setWithdrawDisplayAmount("")
				setWithdrawAmount(BigNumber.from(0))
				setOpenStaking(false)
			} catch (error: any) {
				if (error && typeof error === "string") {
					setWithdrawError(error)
				}
				if (error && typeof error === "object") {
					if (error.message) {
						setWeb3Error(error.message)
					}
				}
				setPending({ ...pending, withdraw: false })
			}
			return
		}

		try {
			setPending({ ...pending, withdraw: true })
			const tx = await farmWithdraw(FARM_CONTRACT_ADDRESS, withdrawAmount)
			await tx.wait()
			setWithdrawDisplayAmount("")
			setWithdrawAmount(BigNumber.from(0))
			const newData = await farmInfo(FARM_CONTRACT_ADDRESS, PANCAKE_POOL_ADDRESS, LP_TOKEN_ADDRESS, SUPS_CONTRACT_ADDRESS, WRAPPED_BNB_ADDRESS)
			if (!newData) return
			setData(newData)
		} catch (err) {
			console.error(err)
		} finally {
			setPending({ ...pending, withdraw: false })
		}
	}

	const handleSubmitStake = async () => {
		setWeb3Error(null)
		if (!stakeAmount) return
		setPending({ ...pending, stake: true })
		try {
			const tx = await farmStake(FARM_CONTRACT_ADDRESS, stakeAmount)
			await tx.wait()
			setPending({ ...pending, stake: false })
			setStakeDisplayAmount("")
			setStakeAmount(BigNumber.from(0))
			const newData = await farmInfo(FARM_CONTRACT_ADDRESS, PANCAKE_POOL_ADDRESS, LP_TOKEN_ADDRESS, SUPS_CONTRACT_ADDRESS, WRAPPED_BNB_ADDRESS)
			if (!newData) return
			setData(newData)
		} catch (error: any) {
			if (error && typeof error === "string") {
				setStakeError(error)
			}
			if (error && typeof error === "object") {
				if (error.message) {
					setWeb3Error(error.message)
				}
			}
			setPending({ ...pending, stake: false })
		}
	}

	const handleChangeStake = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWeb3Error(null)

		if (e.target.value === "") {
			setStakeDisplayAmount("")
			setStakeAmount(BigNumber.from(0))
		}
		let limitVal = e.target.value
		const nDecimals = countDecimals(limitVal)
		if (nDecimals > 6) {
			limitVal = parseFloat(e.target.value).toFixed(6)
		}
		const val = parseUnits(limitVal, 18)
		setStakeDisplayAmount(limitVal)
		setStakeAmount(val)
	}
	const handleChangeWithdraw = (e: React.ChangeEvent<HTMLInputElement>) => {
		setWeb3Error(null)
		if (e.target.value === "") {
			setWithdrawDisplayAmount("")
			setWithdrawAmount(BigNumber.from(0))
			return
		}
		let limitVal = e.target.value
		const nDecimals = countDecimals(limitVal)
		if (nDecimals > 6) {
			limitVal = parseFloat(e.target.value).toFixed(6)
		}
		const val = parseUnits(limitVal, 18)
		setWithdrawDisplayAmount(limitVal)
		setWithdrawAmount(val)
	}

	if (!data) return <Loading text="Loading data..." />
	return (
		<>
			{openTutorial && (
				<Tutorial
					cb={() => {
						if (typeof window !== "undefined") localStorage.setItem("disable_staking_tutorial", "true")
						setOpenTutorial(false)
					}}
				/>
			)}
			<Stack
				gap="2rem"
				sx={{
					"@media (max-width:500px)": {
						width: "100%",
					},
				}}
			>
				<FarmInfo
					rewardRate={data ? data.rewardRate : BigNumber.from(0)}
					block={block}
					loading={!data}
					lpBalance={data ? data.lpBalance : BigNumber.from(0)}
					stakingBalance={data ? data.stakingBalance : BigNumber.from(0)}
					userRewardRate={data ? data.userRewardRate : BigNumber.from(0)}
					yieldPercentage={data ? data.yieldPercentage : 0}
					hasAllowance={hasAllowance}
				/>
				<Stack gap="1rem">
					<Stack
						sx={{
							justifyContent: "space-between",
							width: isMobile ? "100%" : "30rem",
							background: colors.formBg,
							p: "1rem 1.5rem",
							borderRadius: "15px",
							gap: "1rem",
						}}
					>
						<FormSection>
							<FormSectionInner>
								<Stack sx={{ height: "100%", justifyContent: "space-between" }}>
									<FormSectionHeading>Sups Earned</FormSectionHeading>
									<FormSectionValue>{data ? (+formatUnits(data.earned, 18)).toFixed(6) : "0.000000"}</FormSectionValue>
								</Stack>
								<FancyButton
									borderColor={colors.skyBlue}
									disabled={disableClaimButton}
									loading={pending.claim}
									onClick={async () => {
										if (!data) return
										try {
											setPending({ ...pending, claim: true })
											const tx = await farmGetReward(FARM_CONTRACT_ADDRESS)
											await tx.wait()
										} catch (error: any) {
											if (error && typeof error === "string") {
												setWithdrawError(error)
											}
											if (error && typeof error === "object") {
												if (error.message) {
													setWeb3Error(error.message)
												}
											}
										} finally {
											setPending({ ...pending, claim: false })
										}
									}}
								>
									Harvest
								</FancyButton>
							</FormSectionInner>
						</FormSection>
						<FormSection>
							<FormSectionInner>
								<Stack sx={{ height: "100%", justifyContent: "space-between" }}>
									<FormSectionHeading>Sups-BNB LP STAKED</FormSectionHeading>
									{hasAllowance && (
										<FormSectionValue sx={{ color: data?.stakingBalance ? colors.neonPink : colors.darkNeonPink }}>
											{data ? (+formatUnits(data.stakingBalance, 18)).toFixed(6) : "0.000000"}
										</FormSectionValue>
									)}
								</Stack>
								{showStakeButton && (
									<FancyButton
										loading={pending.claim}
										onClick={() => {
											setOpenStaking(true)
											setIsStaking(true)
										}}
									>
										Stake
									</FancyButton>
								)}
								{showStakeText && (
									<Typography
										component="span"
										sx={{ fontFamily: "bizmobold", textTransform: "uppercase", color: colors.neonPink, fontSize: "1rem" }}
									>
										{isStaking ? "Staking" : "Unstaking"}...
									</Typography>
								)}

								{showAddMinusButtons && (
									<Box sx={{ display: "flex", gap: "1rem" }}>
										<FancyButton
											onClick={() => {
												setWeb3Error(null)
												setOpenStaking(true)
												setIsStaking(false)
											}}
										>
											<RemoveIcon fontSize="large" />
										</FancyButton>
										<FancyButton
											disabled
											onClick={() => {
												setWeb3Error(null)
												setOpenStaking(true)
												setIsStaking(true)
											}}
										>
											<AddIcon fontSize="large" />
										</FancyButton>
									</Box>
								)}
							</FormSectionInner>
							{!hasAllowance && (
								<FancyButton
									disabled
									loading={pending.approve}
									onClick={async () => {
										setPending({ ...pending, approve: true })
										try {
											const tx = await farmLPApproveMax(FARM_CONTRACT_ADDRESS)
											await tx.wait()
											setPending({ ...pending, approve: false })
										} catch (error: any) {
											console.error(error)
											if (error && typeof error === "string") {
												setStakeError(error)
											}
											if (error && typeof error === "object") {
												if (error.message) {
													setWeb3Error(error.message)
												}
											}

											setPending({ ...pending, approve: false })
										}
									}}
									sx={{ minWidth: "fit-content", mx: "auto", p: ".5rem 2rem", fontSize: "1.2rem" }}
								>
									Enable Contract
								</FancyButton>
							)}

							{openStaking && (
								<>
									<StakingContainer>
										<Stack gap=".5rem">
											<StakingLabel>{isStaking ? "Stake" : "Unstake"}</StakingLabel>
											<StakeInput
												placeholder="0000"
												autoComplete="off"
												value={isStaking ? stakeDisplayAmount : withdrawDisplayAmount}
												onChange={isStaking ? handleChangeStake : handleChangeWithdraw}
											/>
										</Stack>
										<Stack gap=".5rem">
											<StakingLabel sx={{ "& span": { ml: ".2rem" } }}>
												Balance: <span>{!data ? "---" : (+formatUnits(data.lpBalance, 18)).toFixed(6)}</span>
											</StakingLabel>

											<Box sx={{ display: "flex", gap: "1rem" }}>
												<MaxButton
													onClick={() => {
														if (!data) return
														if (isStaking) {
															setStakeAmount(data.lpBalance)
															setStakeDisplayAmount((+formatUnits(data.lpBalance, 18)).toFixed(6))
														} else {
															setWithdrawAmount(data.stakingBalance)
															setWithdrawDisplayAmount((+formatUnits(data.stakingBalance, 18)).toFixed(6))
														}
													}}
												>
													Max
												</MaxButton>{" "}
												<StakingLabel>SUPS-BNB-LP</StakingLabel>
											</Box>
										</Stack>
									</StakingContainer>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											gap: "2rem",
											pt: "1rem",
										}}
									>
										<FancyButton
											disabled={isStaking ? !!pending.stake : !!pending.withdraw}
											borderColor={colors.white}
											sx={{ width: "calc(50% - 1rem)" }}
											onClick={() => {
												setWeb3Error(null)
												setOpenStaking(false)
												if (isStaking) {
													setStakeDisplayAmount("")
													setStakeAmount(BigNumber.from(0))
												} else {
													setWithdrawDisplayAmount("")
													setWithdrawAmount(BigNumber.from(0))
												}
											}}
										>
											Cancel
										</FancyButton>
										<FancyButton
											sx={{ width: "calc(50% - 1rem)" }}
											disabled={isStaking ? disableStakeButton : disableWithdrawButton}
											loading={isStaking ? !!pending.stake : !!pending.withdraw}
											onClick={() => {
												if (isStaking) {
													handleSubmitStake()
												} else {
													handleSubmitWithdraw()
												}
											}}
										>
											{isStaking ? "Confirm" : "Withdraw"}
										</FancyButton>
									</Box>
								</>
							)}
						</FormSection>
						{(web3error || stakeError) && (
							<Typography sx={{ color: colors.errorRed }}>
								{web3error && web3error} {stakeError && stakeError}
							</Typography>
						)}

						{withdrawError && <Typography sx={{ color: colors.errorRed }}>{withdrawError}</Typography>}
						<Typography component="span" sx={{ fontSize: "1rem" }}>
							Wallet: {!data ? "--- SUPS-BNB LP" : `${(+formatUnits(data.lpBalance, 18)).toFixed(6)} SUP-BNB LP`}{" "}
						</Typography>
					</Stack>
					<Accordion
						sx={{
							color: colors.skyBlue,
							width: "100%",
							background: colors.formBg,
							borderRadius: "15px !important",
							"&.MuiPaper-root::before": {
								display: "none",
							},
						}}
					>
						<AccordionSummary
							sx={{
								fontSize: "1rem",
								minHeight: "3.5rem",
								"&.Mui-expanded": {
									minHeight: "3.5rem",
								},
								"&>div": {
									my: "0rem !important",
									width: "fit-content",
									flexGrow: "unset",
								},
							}}
							expandIcon={<ExpandMoreIcon sx={{ color: colors.skyBlue }} />}
						>
							Details
						</AccordionSummary>
						<AccordionDetails sx={{ display: "flex", flexDirection: "column", position: "relative", fontSize: ".8rem" }}>
							<Box
								sx={{
									background: colors.darkerGrey,
									height: ".5px",
									width: "calc(100% - 2rem)",
									position: "absolute",
									top: 0,
									left: "1rem",
								}}
							/>
							<Button onClick={() => setOpenTutorial(true)} endIcon={<HelpCenterIcon />} sx={{ fontSize: "1rem" }}>
								<strong>Learn how to participate</strong>
							</Button>
							<Button
								component={"a"}
								href={`https://${BSC_SCAN_SITE}/address/${FARM_CONTRACT_ADDRESS}`}
								target="_blank"
								rel="noopener noreferrer"
								endIcon={<OpenInNewIcon />}
							>
								Liquidity Farm contract
							</Button>
							<Button
								component={"a"}
								href={`https://${BSC_SCAN_SITE}/address/${LP_TOKEN_ADDRESS}`}
								target="_blank"
								rel="noopener noreferrer"
								endIcon={<OpenInNewIcon />}
							>
								Cake-LP Token contract
							</Button>
							<Button
								component={"a"}
								href={`https://${PANCAKE_SWAP_ADDRESS}/add/BNB/${SUPS_CONTRACT_ADDRESS}`}
								target="_blank"
								rel="noopener noreferrer"
								endIcon={<OpenInNewIcon />}
							>
								Get SUPS-BNB LP tokens
							</Button>
							{showAPR && (
								<ClickAwayListener onClickAway={() => setOpenInfoApr(false)}>
									<Tooltip
										open={openInfoApr}
										title={
											<Box
												sx={{
													whiteSpace: "pre-line",
													"& p": {
														mt: 0,
														ml: "5px",
													},
												}}
											>
												*
												<span
													style={{
														display: "inline-block",
														textDecoration: "underline",
														marginLeft: "5px",
														marginBottom: "5px",
													}}
												>
													Dynamic APR
												</span>
												<p>
													The purpose of displaying APR is simply an indicator as to the current APR rewards received at the
													time you place liquidity.
												</p>
												<p>
													APR represented is not a reflection of the APR you will receive. There is no guarantee you will
													ever receive the APR displayed to you.
												</p>
												<p>
													By placing liquidity, you acknowledge that you understand the mechanics of the provision of
													liquidity in a decentralised exchange.
												</p>
												<p>
													You acknowledge and understand the more people that provide liquidity within the pool the lower
													APR you will receive.
												</p>
											</Box>
										}
									>
										<Button onClick={() => setOpenInfoApr(!openInfoApr)}>* Dynamic APR - Info</Button>
									</Tooltip>
								</ClickAwayListener>
							)}
						</AccordionDetails>
					</Accordion>
				</Stack>
			</Stack>
		</>
	)
}

const FormSection = styled("div")({
	paddingBottom: "1rem",
	borderBottom: `.5px solid ${colors.darkerGrey}`,
	display: "flex",
	flexDirection: "column",
	gap: "1rem",
})

const FormSectionInner = styled("div")({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
	"& > button": {
		width: "10rem",
		fontSize: "1.2rem",
		padding: ".5rem 2rem",
		minHeight: "unset",
	},
})
const FormSectionHeading = styled("span")({
	fontSize: "1rem",
	fontFamily: "bizmobold",
	textTransform: "uppercase",
})

const FormSectionValue = styled("span")({
	fontSize: "1.8rem",
	fontFamily: "bizmobold",
	textTransform: "uppercase",
	color: colors.skyBlue,
})

const StakingContainer = styled("div")({
	background: colors.inputBg,
	padding: ".7rem",
	borderRadius: "15px",
	display: "flex",
	justifyContent: "space-between",
})

const StakingLabel = styled("span")({
	width: "fit-content",
	whiteSpace: "nowrap",
	fontSize: ".8rem",
	fontFamily: "bizmomedium",
	textTransform: "uppercase",
	color: colors.lightGrey,
})

const MaxButton = styled(Button)({
	fontFamily: "bizmomedium",
	background: colors.neonPink,
	color: colors.white,
	fontSize: ".8rem",
	padding: 0,
	width: "fit-content",
	minWidth: "3rem",
	transition: "all .2s",
	"&:hover": {
		background: colors.darkerNeonPink,
	},
})

const StakeInput = styled(InputBase)({
	fontSize: "1.8rem",
	fontFamily: "bizmobold",
	textTransform: "uppercase",
	height: "1.2rem",
})

interface ITutorialProps {
	cb: () => void
}

const Tutorial: React.FC<ITutorialProps> = ({ cb }) => {
	const [height, setHeight] = useState<string>("100vh")
	const mobileScreen = useMediaQuery("(max-width:1000px)")

	useEffect(() => {
		if (mobileScreen) {
			setHeight(`${window.innerHeight}px`)
			const handleResize = () => {
				// We execute the same script as before
				const vh = window.innerHeight
				setHeight(`${vh}px`)
			}
			window.addEventListener("resize", handleResize)
			return () => {
				window.removeEventListener("resize", handleResize)
			}
		}
	}, [mobileScreen])
	return (
		<ModalWithClose cb={cb}>
			<Box
				sx={{
					width: "90vw",
					maxWidth: "70rem",
					background: colors.darkerNavyBackground,
					height: `calc(${height} - 10rem)`,
					overflowY: "scroll",
					p: "2em",
					"@media (min-height:1200px)": {
						overflow: "hidden",
					},
					"@media (max-width:600px)": {
						p: "1em",
					},
				}}
			>
				<Stack gap="1rem">
					<Box
						sx={{
							alignSelf: "flex-end",
							display: "flex",
							gap: "2rem",
							textTransform: "uppercase",
							"& > a": {
								color: colors.neonPink,
							},
						}}
					>
						<Typography
							component="a"
							href="https://supremacy.game//news/supremacy-yield-farming---frequently-asked-questions"
							target="_blank"
						>
							FAQ
						</Typography>
						<Typography component="a" href="https://supremacy.game/news/supremacy-yield-farming-program" target="_blank">
							More Info
						</Typography>
					</Box>
					<Typography
						variant="h2"
						sx={{
							mb: ".5rem",
							"@media (max-width:600px)": {
								fontSize: "6vw",
							},
						}}
					>
						How to participate
					</Typography>
				</Stack>
				<Stack
					sx={{
						width: "100%",
						"& ol": {
							fontSize: "1.4rem",
							fontFamily: "Share Tech",
							"& li:not(last-of-type)": {
								mb: "1em",
								"@media (max-width:600px)": {
									fontSize: "1.2rem",
								},
								"& a": {
									color: colors.neonPink,
								},
							},
						},
					}}
				>
					<ol>
						<li>
							Acquire <Link to="/buy">SUPS</Link>&nbsp; and BNB Tokens (WBNB on the BEP-20 network).
						</li>
						<li>
							<a href={`https://${PANCAKE_SWAP_ADDRESS}/add/BNB/${SUPS_CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer">
								Add liquidity
							</a>{" "}
							to the SUPS/BNB pool.
						</li>
						<li>Receive your Cake-LP tokens representing your share of the liquidity pool.</li>
						<li>
							Visit the{" "}
							<a href="https://supremacy.game/staking" target="_blank" rel="noreferrer">
								supremacy.game
							</a>{" "}
							website or game platform{" "}
							<a href="https://passport.xsyn.io/farms" target="_blank" rel="noreferrer">
								passport.xsyn.io
							</a>
							&nbsp;for the LP Staking Farm.
						</li>
						<li>Stake the Cake-LP tokens into the yield farming contract.</li>
						<li>Collect more SUPS rewards the longer the Cake-LP tokens are staked in the contract.</li>
						<li>Enjoy up to 6 months of LP Staking rewards for your support.</li>
					</ol>
					<iframe
						width="100%"
						height="100%"
						src="https://www.youtube.com/embed/b4Tyl8OIRkA"
						title="Release Trailer"
						frameBorder={0}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
						allowFullScreen
						style={{
							padding: "0 1rem",
							minHeight: "18rem",
							maxWidth: "35rem",
						}}
					/>
				</Stack>
			</Box>
		</ModalWithClose>
	)
}
