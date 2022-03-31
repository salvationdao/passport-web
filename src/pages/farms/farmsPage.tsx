import { SwitchNetworkOverlay } from "../../components/transferStatesOverlay/switchNetworkOverlay"
import { fromUnixTime, formatDistanceToNow, isPast } from "date-fns"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import Axe from "../../assets/images/gradient/axe.png"
import { Box, Paper, Typography, TextField, useMediaQuery, Button } from "@mui/material"
import { colors } from "../../theme"

import { FancyButton } from "../../components/fancyButton"
import { useEffect, useState } from "react"
import { Navbar } from "../../components/home/navbar"
import { FarmData, useWeb3 } from "../../containers/web3"
import { BigNumber, constants } from "ethers"
import { formatUnits, parseUnits } from "@ethersproject/units"
import { useInterval } from "react-use"
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
import { ConnectWalletOverlay } from "../../components/transferStatesOverlay/connectWalletOverlay"

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
					<Typography variant="h2">Liquidity Farming</Typography>
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
		<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "1rem" }}>
			<Box component={"code"} style={{ margin: 0 }}>
				Earned: {props.loading ? "---" : `${displayEarned} SUPS`}
			</Box>
			<Box component={"code"} style={{ margin: 0 }}>
				APR: {apr}
			</Box>
			<Box component={"code"} style={{ margin: 0 }}>
				{props.loading ? "---" : remainingTime}
			</Box>
			<Box component={"code"} style={{ margin: 0, marginTop: "1rem" }}>
				Global reward rate: {props.loading ? "--- %" : `${(+formatUnits(props.rewardRate)).toFixed(8)} SUPS/s`}
			</Box>
			<Box component={"code"} style={{ margin: 0 }}>
				Your reward rate: {props.loading ? "--- %" : `${(+formatUnits(props.userRewardRate)).toFixed(8)} SUPS/s`}
			</Box>
		</Box>
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
		<>
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
			{web3error && (
				<Typography variant={"body1"} color={colors.supremacy.red}>
					{web3error}
				</Typography>
			)}
			<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "100%" }}>
				<Box
					sx={{
						//  alignItems: "center",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						backgroundColor: colors.inputBg,
						borderRadius: "10px",
						width: isMobile ? "100%" : "30rem",
						padding: isMobile ? "1rem" : "5rem",
					}}
				>
					<Typography variant="h3" sx={{ textAlign: "center" }}>
						Stake
					</Typography>
					<TextField
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
					<Typography style={{ textAlign: "center", margin: "0.5rem" }}>
						Wallet:{" "}
						<Box
							component={"span"}
							sx={{ display: "inline", cursor: "pointer" }}
							onClick={() => {
								if (!data) return
								setStakeAmount(data.lpBalance)
								setStakeDisplayAmount((+formatUnits(data.lpBalance, 18)).toFixed(4))
							}}
						>
							{!data ? "--- SUPS-BNB LP" : `${(+formatUnits(data.lpBalance, 18)).toFixed(4)} SUP-BNB LP`}{" "}
						</Box>
					</Typography>

					<Box sx={{ display: "flex", justifyContent: "space-around", margin: "0.5rem", gap: "0.5rem" }}>
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
				</Box>
				{stakeError && (
					<Typography variant={"body1"} color={colors.supremacy.red}>
						{stakeError}
					</Typography>
				)}
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						backgroundColor: colors.inputBg,
						borderRadius: "10px",
						width: isMobile ? "100%" : "30rem",
						padding: isMobile ? "1rem" : "5rem",
					}}
				>
					<Typography variant="h3" sx={{ textAlign: "center" }}>
						Unstake
					</Typography>
					<TextField
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
					<Typography style={{ textAlign: "center", margin: "0.5rem" }}>
						Staked:{" "}
						<Box
							component={"span"}
							sx={{ display: "inline", cursor: "pointer" }}
							onClick={() => {
								if (!data) return
								setWithdrawAmount(data.stakingBalance)
								setWithdrawDisplayAmount((+formatUnits(data.stakingBalance, 18)).toFixed(4))
							}}
						>
							{!data ? "--- SUPS-BNB LP" : `${(+formatUnits(data.stakingBalance, 18)).toFixed(4)} SUP-BNB LP`}
						</Box>
					</Typography>
					<FancyButton
						style={{ margin: "0.5rem" }}
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
						style={{ margin: "0.5rem" }}
					>
						Claim Rewards
					</FancyButton>
					<FancyButton
						style={{ margin: "0.5rem" }}
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
				</Box>
				{withdrawError && (
					<Typography variant={"body1"} color={colors.supremacy.red}>
						{withdrawError}
					</Typography>
				)}

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
			</Box>
		</>
	)
}
