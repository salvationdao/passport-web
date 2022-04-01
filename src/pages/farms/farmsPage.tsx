import { formatUnits, parseUnits } from "@ethersproject/units"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { Box, Button, InputBase, Paper, Stack, styled, Typography, useMediaQuery } from "@mui/material"
import { formatDistanceToNow, fromUnixTime, isPast } from "date-fns"
import { BigNumber, constants } from "ethers"
import { useEffect, useState } from "react"
import { useInterval } from "react-use"
import Axe from "../../assets/images/gradient/axe.png"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
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
import { colors } from "../../theme"

export const FarmsPage = () => {
	const { changeChain, currentChainId, account } = useWeb3()

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100%",
			}}
		>
			<Navbar sx={{ marginBottom: "2rem" }} />
			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					padding: "0 3rem",
					marginBottom: "3rem",
					"@media (max-width:600px)": {
						p: 0,
						mb: 0,
					},
				}}
			>
				<Paper
					sx={{
						flexGrow: 1,
						position: "relative",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "100%",
						maxWidth: "1700px",
						margin: "0 auto",
						padding: "2rem",
						"@media (max-width:600px)": {
							p: "1em",
						},
					}}
				>
					{currentChainId && currentChainId.toString() !== BINANCE_CHAIN_ID && (
						<SwitchNetworkOverlay changeChain={changeChain} currentChainId={currentChainId} />
					)}
					{!account && <ConnectWalletOverlay walletIsConnected={!!account} />}
					<Box
						component="img"
						src={Axe}
						alt="Image of a Safe"
						sx={{
							height: "12rem",
						}}
					/>
					<Typography variant="h1" sx={{ textTransform: "uppercase" }}>
						Liquidity Farming
					</Typography>
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
	earned: BigNumber
	userRewardRate: BigNumber
	rewardRate: BigNumber
	yieldPercentage: number
	periodFinish: BigNumber
}

const InfoLabel = styled("span")({
	fontFamily: "bizmosemi_bold",
	fontWeight: 800,
	textTransform: "uppercase",
	display: "flex",
	justifyContent: "flex-end",
	width: "15rem",
	"@media (max-width:500px)": {
		width: "calc(50% - 1rem)",
		fontSize: "3vw",
	},
})
const InfoValue = styled("span")({
	fontFamily: "bizmomedium",
	textTransform: "uppercase",
	justifySelf: "flex-start",
	width: "fit-content",
	minWidth: "15rem",
	"@media (max-width:500px)": {
		minWidth: "calc(50% - 1rem)",
		fontSize: "3vw",
	},
})

const LabelContainer = styled("div")({
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	gap: "1rem",
	width: "100%",
})

const FarmInfo = (props: FarmInfoProps) => {
	const [displayEarned, setDisplayEarned] = useState((+formatUnits(props.earned, 18)).toFixed(4))
	const [currentEarned, setCurrentEarned] = useState(props.earned)
	const [remainingTime, setRemainingTime] = useState<string | null>(null)
	useInterval(() => {
		const newCurrent = currentEarned.add(props.userRewardRate.div(10))
		setCurrentEarned(newCurrent)
		setDisplayEarned((+formatUnits(newCurrent, 18)).toFixed(4))
		if (isPast(fromUnixTime(props.periodFinish.toNumber()))) {
			setRemainingTime("Rewards are inactive")
		} else {
			setRemainingTime(`Ends in ${formatDistanceToNow(fromUnixTime(props.periodFinish.toNumber()))}`)
		}
	}, 100)
	useEffect(() => {
		setCurrentEarned(props.earned)
	}, [props.earned])

	let apr = props.loading ? "--- %" : `${(props.yieldPercentage * 100).toFixed(4)}%`
	if (props.yieldPercentage === 0) {
		apr = "--- %"
	}
	return (
		<Stack gap=".5rem" justifyContent="center" sx={{ width: "100%" }}>
			<Stack justifyContent="center" sx={{ width: "100%" }}>
				<LabelContainer>
					<InfoLabel>Earned:</InfoLabel> <InfoValue>{props.loading ? "---" : `${displayEarned} SUPS`}</InfoValue>
				</LabelContainer>
				<LabelContainer>
					<InfoLabel>APR:</InfoLabel> <InfoValue>{apr}</InfoValue>
				</LabelContainer>
			</Stack>
			<Typography sx={{ fontFamily: "bizmosemi_bold", alignSelf: "center", fontSize: "1.2rem" }}>{props.loading ? "---" : remainingTime}</Typography>
			<LabelContainer>
				<InfoLabel>Global reward rate:</InfoLabel>
				<InfoValue>{props.loading ? "--- %" : `${(+formatUnits(props.rewardRate)).toFixed(8)} SUPS/s`}</InfoValue>
			</LabelContainer>
			<LabelContainer>
				<InfoLabel>Your reward rate:</InfoLabel>{" "}
				<InfoValue>{props.loading ? "--- %" : `${(+formatUnits(props.userRewardRate)).toFixed(8)} SUPS/s`}</InfoValue>
			</LabelContainer>
		</Stack>
	)
}

const FarmCard = (props: FarmCardProps) => {
	const { provider, signer, account, block, farmInfo, farmWithdraw, farmExit, farmCheckAllowance, farmLPApproveMax, farmStake, farmGetReward } = useWeb3()
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
				setData(data)
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
	}, [block, provider, signer, account, farmCheckAllowance, farmInfo])

	let disableApproveButton = false
	if (!stakeAmount || stakeAmount.eq(0) || stakeDisplayAmount === "") disableApproveButton = true
	if (hasAllowance) disableApproveButton = true

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

	let disableExitButton = false
	if (data && data.stakingBalance.lte(0)) {
		disableExitButton = true
	}

	if (pending.claim || pending.exit || pending.withdraw) disableWithdrawButton = true
	if (pending.claim || pending.exit || pending.withdraw) disableExitButton = true
	if (pending.claim || pending.exit || pending.withdraw) disableClaimButton = true

	return (
		<Stack
			gap="2rem"
			sx={{
				"@media (max-width:500px)": {
					width: "100%",
				},
			}}
		>
			<FarmInfo
				periodFinish={data ? data.periodFinish : BigNumber.from(0)}
				rewardRate={data ? data.rewardRate : BigNumber.from(0)}
				block={block}
				loading={!data}
				lpBalance={data ? data.lpBalance : BigNumber.from(0)}
				stakingBalance={data ? data.stakingBalance : BigNumber.from(0)}
				earned={data ? data.earned : BigNumber.from(0)}
				userRewardRate={data ? data.userRewardRate : BigNumber.from(0)}
				yieldPercentage={data ? data.yieldPercentage : 0}
			/>
			<Stack gap="1rem">
				<Stack
					sx={{
						justifyContent: "space-between",
						width: isMobile ? "100%" : "30rem",
						gap: "1rem",
					}}
				>
					<Typography variant="h3" sx={{ textAlign: "center", textTransform: "uppercase" }}>
						Stake
					</Typography>

					<Stack>
						<InputBase
							sx={{
								fontSize: "1.4rem",
								color: colors.darkerGrey,
								fontFamily: "bizmosemi_bold",
								background: colors.inputBg,
								display: "flext",
								justifyContent: "center",
								p: "1rem 2rem",
								borderRadius: "7px",
								"& *": {
									textAlign: "center",
								},
								"@media (max-width:600px)": {
									fontSize: "1rem",
								},
							}}
							autoComplete="off"
							value={stakeDisplayAmount}
							onChange={(e) => {
								setWeb3Error(null)
								try {
									if (e.target.value === "") {
										setStakeDisplayAmount("")
										setStakeAmount(BigNumber.from(0))
									}
									const val = parseUnits(e.target.value, 18)
									setStakeDisplayAmount(e.target.value)
									setStakeAmount(val)
								} catch {}
							}}
						/>

						<Typography style={{ textAlign: "center", alignSelf: "flex-end" }}>
							Wallet:{" "}
							<Button
								sx={{ display: "inline", cursor: "pointer" }}
								onClick={() => {
									if (!data) return
									setStakeAmount(data.lpBalance)
									setStakeDisplayAmount((+formatUnits(data.lpBalance, 18)).toFixed(4))
								}}
							>
								{!data ? "--- SUPS-BNB LP" : `${(+formatUnits(data.lpBalance, 18)).toFixed(4)} SUP-BNB LP`}{" "}
							</Button>
						</Typography>

						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								margin: "0.5rem",
								gap: "2rem",
								"&>button": {
									p: ".5em 1em",
									textTransform: "uppercase",
									minWidth: "10rem",
								},
							}}
						>
							<FancyButton
								disabled={disableApproveButton}
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
							>
								{hasAllowance ? "Approved" : "Approve"}
							</FancyButton>
							<FancyButton
								disabled={disableStakeButton}
								loading={!!pending.stake}
								onClick={async () => {
									if (!stakeAmount) return
									setPending({ ...pending, stake: true })
									try {
										const tx = await farmStake(FARM_CONTRACT_ADDRESS, stakeAmount)
										await tx.wait()
										setPending({ ...pending, stake: false })
										setStakeDisplayAmount("")
										setStakeAmount(BigNumber.from(0))
										const newData = await farmInfo(
											FARM_CONTRACT_ADDRESS,
											PANCAKE_POOL_ADDRESS,
											LP_TOKEN_ADDRESS,
											SUPS_CONTRACT_ADDRESS,
											WRAPPED_BNB_ADDRESS,
										)
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
								}}
							>
								Stake
							</FancyButton>
						</Box>

						<Typography sx={{ color: colors.errorRed, textAlign: "center" }}>
							{web3error && web3error} {stakeError && stakeError}
						</Typography>
					</Stack>
				</Stack>

				<Stack
					sx={{
						justifyContent: "space-between",
						width: isMobile ? "100%" : "30rem",
						gap: "1rem",
					}}
				>
					<Typography variant="h3" sx={{ textAlign: "center", textTransform: "uppercase" }}>
						Unstake
					</Typography>
					<Stack>
						<InputBase
							sx={{
								fontSize: "1.4rem",
								fontFamily: "bizmosemi_bold",
								color: colors.darkerGrey,
								background: colors.inputBg,
								display: "flext",
								justifyContent: "center",
								p: "1rem 2rem",
								borderRadius: "7px",
								"& *": {
									textAlign: "center",
								},
								"@media (max-width:600px)": {
									fontSize: "1rem",
								},
							}}
							autoComplete="off"
							value={withdrawDisplayAmount}
							onChange={(e) => {
								setWeb3Error(null)
								if (e.target.value === "") {
									setWithdrawDisplayAmount("")
									setWithdrawAmount(BigNumber.from(0))
									return
								}
								try {
									const val = parseUnits(e.target.value, 18)
									setWithdrawDisplayAmount(e.target.value)
									setWithdrawAmount(val)
								} catch {}
							}}
						/>
						<Typography style={{ textAlign: "center", alignSelf: "flex-end" }}>
							Staked:{" "}
							<Button
								component={"span"}
								sx={{ display: "inline", cursor: "pointer" }}
								onClick={() => {
									if (!data) return
									setWithdrawAmount(data.stakingBalance)
									setWithdrawDisplayAmount((+formatUnits(data.stakingBalance, 18)).toFixed(4))
								}}
							>
								{!data ? "--- SUPS-BNB LP" : `${(+formatUnits(data.stakingBalance, 18)).toFixed(4)} SUP-BNB LP`}
							</Button>
						</Typography>
					</Stack>
					<Stack
						gap=".5rem"
						sx={{
							alignItems: "center",
							"&>button": {
								width: "fit-content",
								minWidth: "15rem",
							},
						}}
					>
						<FancyButton
							disabled={disableWithdrawButton}
							loading={!!pending.withdraw}
							onClick={async () => {
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

								setPending({ ...pending, withdraw: true })
								try {
									const tx = await farmWithdraw(FARM_CONTRACT_ADDRESS, withdrawAmount)
									await tx.wait()
									setPending({ ...pending, withdraw: false })
									setWithdrawDisplayAmount("")
									setWithdrawAmount(BigNumber.from(0))
									const newData = await farmInfo(
										FARM_CONTRACT_ADDRESS,
										PANCAKE_POOL_ADDRESS,
										LP_TOKEN_ADDRESS,
										SUPS_CONTRACT_ADDRESS,
										WRAPPED_BNB_ADDRESS,
									)
									if (!newData) return
									setData(newData)
								} catch {
									setPending({ ...pending, withdraw: false })
								}
							}}
						>
							Withdraw SUPS-BNB LP
						</FancyButton>
						<FancyButton
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
							Claim Rewards
						</FancyButton>
						<FancyButton
							disabled={disableExitButton}
							loading={pending.exit}
							onClick={async () => {
								if (!data) return
								try {
									setPending({ ...pending, exit: true })
									const tx = await farmExit(FARM_CONTRACT_ADDRESS)
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
									setPending({ ...pending, exit: false })
								}
							}}
						>
							Exit Pool
						</FancyButton>
					</Stack>
				</Stack>
				{withdrawError && <Typography sx={{ color: colors.errorRed, textAlign: "center" }}>{withdrawError}</Typography>}

				<Stack>
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
						href={`https://${PANCAKE_SWAP_ADDRESS}/add/BNB/${SUPS_CONTRACT_ADDRESS}`}
						target="_blank"
						rel="noopener noreferrer"
						endIcon={<OpenInNewIcon />}
					>
						Get SUPS-BNB LP tokens
					</Button>
				</Stack>
			</Stack>
		</Stack>
	)
}
