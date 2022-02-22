import { Box, LinearProgress, Stack, styled, Typography } from "@mui/material"
import { formatUnits } from "ethers/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { useHistory } from "react-router-dom"
import { useContainer } from "unstated-next"
import BWSupToken from "../../assets/images/BW-sup-token.png"
import { BuyTokens } from "../../components/buyTokens"
import { BackgroundVideo } from "../../components/supremacy/backgroundVideo"
import { CountdownTimer } from "../../components/supremacy/countdownTimer"
import { Loading } from "../../components/supremacy/loading"
import { SupremacyNavbar } from "../../components/supremacy/navbar"
import { WhiteListModal } from "../../components/supremacy/whiteListModal"
import { AppState, useSupremacyApp } from "../../containers/supremacy/app"
import { useWeb3, web3Constants } from "../../containers/web3"
import { colors } from "../../theme"

export const TEXT_GAME_LOCATION = "./TextGame/TextAdventure.html"
export const IMAGE_FOLDER = "https://afiles.ninja-cdn.com/supremacy/images"
export const VIDEO_FOLDER = "https://afiles.ninja-cdn.com/supremacy/videos"
export const NAVBAR_HEIGHT = 100

export const SalePage = () => {
	const [disableSimulation, setDisableSimulation] = useState(false)
	const [countdown, setCountdown] = useState(new Date())

	// Game state
	const [showGame, setShowGame] = useState(false)
	const contentRef = useRef<HTMLIFrameElement>(null)
	const { showSimulation, setShowSimulation } = useSupremacyApp()
	const { account, checkNeoBalance } = useWeb3()
	const { loading, setLoading, amountRemaining } = useContainer(AppState)

	const handleJoinBtn = async () => {
		if (account) {
			await checkNeoBalance(account)
			window.localStorage.setItem("wallet", account)
			setShowGame(true)
		}
	}

	//  Fetch time for countdown
	//  Check when to disable simulation
	interface WhitelistTime {
		time: Date
		next_phase: "whitelist" | "death" | "public"
	}

	const fetchTime = useCallback(async () => {
		const response = await fetch("https://stories.supremacy.game/api/whitelist/time")
		const data = (await response.clone().json()) as WhitelistTime
		if (!data.next_phase.includes("whitelist")) setDisableSimulation(true)
		return new Date(data.time)
	}, [])

	useEffect(() => {
		;(async () => {
			const endDate = await fetchTime()
			setCountdown(endDate)
		})()
	}, [fetchTime])

	return showGame ? (
		<>
			<Box
				sx={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					minHeight: "100vh",
					background: colors.black,
					zIndex: 9999,
				}}
			/>
			<GameFrame title="text game" src={TEXT_GAME_LOCATION} ref={contentRef}>
				Your browser doesnt support iframes
			</GameFrame>
		</>
	) : (
		<>
			<Loading loading={loading} setLoading={setLoading} />
			<SupremacyNavbar />
			<Box
				sx={{
					opacity: loading ? 0 : 1,
					minHeight: "100vh",
					background: colors.black2Background,
				}}
			>
				<Stack
					sx={{
						pt: `${NAVBAR_HEIGHT}px`,
						pb: "2em",
						justifyContent: "center",
						minHeight: "100vh",
						alignItems: "center",
						gap: "1em",
						px: "2em",
					}}
				>
					<Stack alignItems="center">
						<a href="https://supremacy.game/home">
							<Box
								component="img"
								src={IMAGE_FOLDER + "/home/logo.webp"}
								alt="Supremacy metaverse game"
								sx={{
									mt: "1rem",
									cursor: "pointer",
									width: "100%",
									maxWidth: "40vw",
									"@media (max-width: 1600px)": {
										maxWidth: "50rem",
									},
								}}
							/>
						</a>
						<Title>Game Launch and TOKEN SALE</Title>
					</Stack>

					<Box
						sx={{
							display: "flex",
							width: "100%",
							alignItems: "center",
							justifyContent: "center",
							gap: "5em",
							px: "2em",
							"@media (max-width: 900px)": {
								flexDirection: "column-reverse",
								gap: "2em",
							},
						}}
					>
						<Stack gap="2em" sx={{ maxWidth: "30rem", justifyContent: "center", height: "100%" }}>
							<SubHeading>PURCHASE $SUPS TO ACCESS THE BATTLE ARENA</SubHeading>
							{/* Progress Bar */}
							<Box sx={{ position: "relative" }}>
								<FancyLinearProgress
									variant="determinate"
									value={100 - (parseInt(formatUnits(amountRemaining, 18)) / web3Constants.totalSaleSups) * 100}
									aria-label="Tokens sold progressive bar"
								/>
								<Box
									sx={{
										position: "absolute",
										top: "50%",
										transform: `translate(-100%,-50%)`,
										left:
											100 - (parseInt(formatUnits(amountRemaining, 18)) / web3Constants.totalSaleSups) * 100 < 40
												? "75%"
												: `${100 - (parseInt(formatUnits(amountRemaining, 18)) / web3Constants.totalSaleSups) * 100}%`,
										display: "flex",
										alignItems: "center",
										pr: ".5em",
										gap: ".5em",
									}}
								>
									<Box
										component="img"
										src={BWSupToken}
										alt="token image"
										sx={{
											ml: "auto",
											height: "1.5rem",
										}}
									/>
									<Typography
										variant="body1"
										sx={{
											fontSize: "1rem",
											textTransform: "uppercase",
											color: colors.white,
											textShadow: `1px 2px ${colors.black}`,
											whiteSpace: "nowrap",
											fontWeight: "600",
										}}
									>
										{(parseInt(formatUnits(amountRemaining, 18)) / 10 ** 6).toFixed(2)}m $SUPS remaining
									</Typography>
								</Box>
							</Box>
							<CountdownTimer date={countdown} publicSale />
						</Stack>
						{!disableSimulation && <WhiteListModal open={showSimulation} setOpen={setShowSimulation} handleJoinBtn={handleJoinBtn} />}
						<BuyTokens publicSale />
					</Box>
				</Stack>
			</Box>
			<BackgroundVideo />
		</>
	)
}

const Title = styled("h1")({
	fontFamily: ["Nostromo Regular Black"].join(","),
	textAlign: "center",
	fontSize: "3rem",
	margin: 0,
	"@media (max-width:600px)": {
		fontSize: "2.5rem",
	},
	"@media (max-width:559px)": {
		fontSize: "1.4rem",
	},
	"@media (max-width:400px)": {
		fontSize: "1.2rem",
	},
	"@media (max-width:350px)": {
		fontSize: "1.4rem",
	},
})

const SubHeading = styled("span")({
	fontFamily: "Nostromo Regular Heavy",
	fontSize: "1.5rem",
	color: colors.gold,
	textAlign: "center",
	WebkitTextStrokeWidth: "1px",
	WebkitTextStrokeColor: colors.black,
})

const GameFrame = styled("iframe")({
	position: "fixed",
	top: 0,
	left: 0,
	bottom: 0,
	right: 0,
	width: "100vw",
	height: "100vh",
	border: "none",
	margin: 0,
	padding: 0,
	overflow: "hidden",
	zIndex: 9999,
})

const FancyLinearProgress = styled(LinearProgress)({
	width: "90vw",
	maxWidth: "30rem",
	height: "3.5rem",
	"@media (max-width:559px)": {
		height: "40px",
	},
	clipPath: `polygon(0 0, calc(100% - 1rem) 0%, 100% 1rem, 100% 100%, 1rem 100%, 0% calc(100% - 1rem))`,
	backgroundColor: "rgba(0, 136, 136, 0.4)",
	"&>span": {
		backgroundColor: colors.neonBlue,
		opacity: 0.5,
	},
})
