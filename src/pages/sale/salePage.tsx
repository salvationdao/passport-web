import { Box, LinearProgress, Stack, styled, Typography } from "@mui/material"
import { formatUnits } from "ethers/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet"
import BWSupToken from "../../assets/images/BW-sup-token.png"
import { BuyTokens } from "../../components/buyTokens"
import { BackgroundVideo } from "../../components/supremacy/backgroundVideo"
import { CountdownTimer } from "../../components/supremacy/countdownTimer"
import { Loading } from "../../components/supremacy/loading"
import { SupremacyNavbar } from "../../components/supremacy/navbar"
import { WhiteListModal } from "../../components/supremacy/whiteListModal"
import { useAuth } from "../../containers/auth"
import { useWeb3, web3Constants } from "../../containers/web3"
import { colors } from "../../theme"

export const TEXT_GAME_LOCATION = "./TextGame/TextAdventure.html"
export const IMAGE_FOLDER = "https://afiles.ninja-cdn.com/supremacy/images"
export const VIDEO_FOLDER = "https://afiles.ninja-cdn.com/supremacy/videos"
export const NAVBAR_HEIGHT = 100

export const SalePage = () => {
	const { showSimulation, setShowSimulation } = useAuth()
	const { account, checkNeoBalance, amountRemaining } = useWeb3()
	const [disableSimulation, setDisableSimulation] = useState(false)
	const [countdown, setCountdown] = useState<Date | undefined>()
	const [loading, setLoading] = useState(true)

	// Game state
	const [showGame, setShowGame] = useState(false)
	const contentRef = useRef<HTMLIFrameElement>(null)

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
		try {
			const response = await fetch("https://stories.supremacy.game/api/whitelist/time")
			const data = (await response.clone().json()) as WhitelistTime
			if (!data.next_phase.includes("death")) setDisableSimulation(true)

			const endDate = new Date(data.time)
			setCountdown(endDate)
		} catch (err) {
			console.error(err)
			setCountdown(undefined)
		}
	}, [])

	useEffect(() => {
		;(async () => await fetchTime())()
	}, [fetchTime])
	return (
		<>
			<Helmet>
				<title key="title">Supremacy - Fight For Glory in the Metaverse</title>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<meta name="abstract" content="Fight For Glory in the Metaverse" key="abstract" />
				<meta
					name="description"
					content="Watch War Machines battle in a 24/7 live streaming metaverse game. Battle begins in 2/22/22! Survive and join the whitelist to receive exclusive rewards!"
					key="description"
				/>
				<meta
					name="twitter:description"
					content="Watch War Machines battle in a 24/7 live streaming metaverse game. Battle begins in 2/22/22! Survive and join the whitelist to receive exclusive rewards!"
					key="twitter:description"
				/>

				<meta
					property="og:description"
					content="Watch War Machines battle in a 24/7 live streaming metaverse game. Battle begins in 2/22/22! Survive and join the whitelist to receive exclusive rewards!"
					key="og:description"
				/>
				<meta property="og:image" content="https://supremacy.game/images/seo_image.png" key="og:image" />
				<link rel="canonical" href="https://supremacy.game" key="canonical" />
				<meta name="twitter:image" content="https://supremacy.game/images/seo_image.png" key="twitter:image" />
				<meta property="og:title" content="Supremacy - Fight For Glory in the Metaverse" key="og:title" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="/" key="og:url" />
				<meta name="twitter:url" content="/" key="twitter:url" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta property="og:site_name" content="Supremacy" />
				<meta name="twitter:image:alt" content="Supremacy" />
				<meta name="twitter:site" content="@SupremacyMeta" />
				<meta name="twitter:creator" content="@SupremacyMeta" />
				<meta name="theme-color" content={colors.darkerNeonBlue} />
				<meta name="keywords" content="supremacy, metaverse, crypto, perth, game" key="keywords" />
				<link rel="icon" href="/supFavicon.ico" type="image/x-icon" />
			</Helmet>
			{showGame ? (
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
					<SupremacyNavbar loading={loading} />
					{!disableSimulation && <WhiteListModal open={showSimulation} setOpen={setShowSimulation} handleJoinBtn={handleJoinBtn} />}
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
								gap: "4em",
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
												transform: `translate(-50%,-50%)`,
												left: "50%",
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
									{countdown && <CountdownTimer date={countdown} publicSale />}
								</Stack>
								<BuyTokens publicSale />
							</Box>
						</Stack>
					</Box>
					<BackgroundVideo setLoading={setLoading} loading={loading} />
				</>
			)}
		</>
	)
}

const Title = styled("h1")({
	fontFamily: ["Nostromo Regular Black"].join(","),
	textAlign: "center",
	fontSize: "3rem",
	margin: 0,
	"@media (max-width:800px)": {
		fontSize: "4vmin",
	},
})

const SubHeading = styled("span")({
	fontFamily: "Nostromo Regular Heavy",
	fontWeight: 800,
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
		backgroundColor: "rgba(43,233,253,0.5)",
		animation: " 2s linear infinite forwards shimmer",
		"&::after": {
			content: "''",
			position: "absolute",
			top: 0,
			left: 0,
			display: "inline-block",
			width: "100%",
			height: "100%",
			transition: "all .5s",
			animation: " 2s linear infinite forwards shimmer",
			background:
				"linear-gradient(90deg, rgba(43,233,253,0.9) 0%, rgba(55,185,255,.5) 49%, rgba(43,233,253,0.5) 55%, rgba(0,182,255,0.5) 80% , rgba(43,233,253,0.9) 100%)",
			"@keyframes shimmer": {
				from: {
					backgroundPosition: "-100px 0",
				},
				to: {
					backgroundPosition: "300px 0",
				},
			},
		},
	},
})
