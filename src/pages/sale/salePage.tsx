import { Box, LinearProgress, Stack, styled, Typography } from "@mui/material"
import { formatUnits } from "ethers/lib/utils"
import { useRef, useState } from "react"
import { Helmet } from "react-helmet"
import { SupremacyTC } from "../../assets"
import BWSupToken from "../../assets/images/BW-sup-token.png"
import { BuyTokens } from "../../components/buyTokens"
import { BackgroundVideo } from "../../components/supremacy/backgroundVideo"
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
	const { account, checkNeoBalance, setLoadingAmountRemaining } = useWeb3()
	const { amountRemaining } = useWeb3()
	const { loadingAmountRemaining } = useWeb3()
	//const [disableSimulation, setDisableSimulation] = useState(true)
	//const [countdown, setCountdown] = useState<Date | undefined>()

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
	// interface WhitelistTime {
	// 	time: Date
	// 	next_phase: "whitelist" | "death" | "public"
	// }

	// const fetchTime = useCallback(async () => {
	// 	try {
	// 		const response = await fetch("https://stories.supremacy.game/api/whitelist/time")
	// 		const data = (await response.clone().json()) as WhitelistTime
	// 		// if (!["death", "alpha"].includes(data.next_phase)) setDisableSimulation(true)

	// 		const endDate = new Date(data.time)
	// 		setCountdown(endDate)
	// 	} catch (err) {
	// 		console.error(err)
	// 		setCountdown(undefined)
	// 	}
	// }, [])

	// useEffect(() => {
	// 	;(async () => await fetchTime())()
	// }, [fetchTime])

	let progressAmount = 0
	let amtRemainingStr = parseInt(formatUnits(amountRemaining, 18))
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
	progressAmount = 100 - (parseInt(formatUnits(amountRemaining, 18)) / web3Constants.totalSaleSups) * 100
	if (amountRemaining.eq(0) || progressAmount === 0) {
		amtRemainingStr = "???"
		progressAmount = 32
	}

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
							minHeight: "100%",
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
					<Loading loading={loadingAmountRemaining} setLoading={setLoadingAmountRemaining} />
					<SupremacyNavbar loading={loadingAmountRemaining} />
					{
						//!disableSimulation &&
						<WhiteListModal open={showSimulation} setOpen={setShowSimulation} handleJoinBtn={handleJoinBtn} />
					}
					<Box
						sx={{
							opacity: loadingAmountRemaining ? 0 : 1,
							minHeight: "100%",
							background: colors.black2Background,
						}}
					>
						<Stack
							sx={{
								pt: `${NAVBAR_HEIGHT}px`,
								pb: "2em",
								justifyContent: "center",
								minHeight: "100%",
								alignItems: "center",
								gap: "4em",
								px: "2em",
								"@media (max-width:600px)": {
									gap: "1em",
								},
							}}
						>
							<Stack alignItems="center" gap="1em">
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
								<Stack gap="0">
									<Title sx={{ lineHeight: 0.7 }}>Public TOKEN SALE</Title>
									<SubHeading>LIMITED</SubHeading>
								</Stack>
							</Stack>

							<Box
								sx={{
									display: "flex",
									width: "100%",
									height: "100%",
									alignItems: "stretch",
									justifyContent: "center",
									gap: "5em",
									px: "2em",
									"@media (max-width: 900px)": {
										alignItems: "center",
										flexDirection: "column-reverse",
										gap: "2em",
									},
								}}
							>
								<Stack gap="2em" sx={{ maxWidth: "30rem", justifyContent: "space-between", height: "100%" }}>
									<SubHeading>PURCHASE $SUPS TO ACCESS THE BATTLE ARENA</SubHeading>
									{/* Progress Bar */}

									<Box sx={{ position: "relative" }}>
										<FancyLinearProgress variant="determinate" value={progressAmount} aria-label="Tokens sold progressive bar" />
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
												visibility: loadingAmountRemaining ? "hidden" : "unset",
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
													textShadow: `2px 2px ${colors.black}`,
													whiteSpace: "nowrap",
													fontWeight: "600",
												}}
											>
												{amtRemainingStr} $SUPS remaining
											</Typography>
										</Box>
									</Box>
									{/* {countdown && <CountdownTimer date={countdown} publicSale />} */}
									<Box
										sx={{
											"& p": {
												fontSize: ".8rem",
												"@media (max-width:800px)": {
													fontSize: "3vmin",
												},
											},
										}}
									>
										<Typography>
											$SUPS tokens will be dispersed into your game account linked to your wallet. You'll be able to access and use them
											in the game when the Battle Arena launches, where you can purchase NFTs with your $SUPS and participate in the
											Battle stream.
											<br />
											<br />
										</Typography>
										<Typography>
											After the Public Sale, once the liquidity pool on Pancake Swap is set up: withdrawals on-chain to BSC will be
											enabled. Thank you for your patience.
										</Typography>
									</Box>
								</Stack>
								<BuyTokens publicSale />
							</Box>

							<Typography
								component="a"
								href={SupremacyTC}
								sx={{ color: colors.skyBlue, textDecoration: "unset", fontFamily: "Nostromo Regular Black" }}
							>
								Terms and Conditions
							</Typography>
						</Stack>
					</Box>
					<BackgroundVideo loading={loadingAmountRemaining} />
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
	WebkitTextStrokeWidth: "1px",
	WebkitTextStrokeColor: colors.black,
	textShadow: `1px 3px ${colors.black}`,
	"@media (max-width:800px)": {
		fontSize: "4vmin",
	},
	"@media (max-width:600px)": {
		textShadow: "unset",
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
	textShadow: `1px 3px ${colors.black}`,
	"@media (max-width:600px)": {
		textShadow: "unset",
	},
	"@media (max-width:400px)": {
		fontSize: "4vmin",
	},
})

const GameFrame = styled("iframe")({
	position: "fixed",
	top: 0,
	left: 0,
	bottom: 0,
	right: 0,
	width: "100%",
	height: "100%",
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
	"@media (max-width:600px)": {
		height: "4rem",
	},
	clipPath: `polygon(0 0, calc(100% - 1rem) 0%, 100% 1rem, 100% 100%, 1rem 100%, 0% calc(100% - 1rem))`,
	backgroundColor: "rgba(55,185,255,.3)",
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
				"0%": {
					backgroundPosition: "-100px 0",
				},
				"20%": {
					backgroundPosition: "0px 0",
				},
				"50%": {
					backgroundPosition: "100px 0",
				},
				"70%": {
					backgroundPosition: "200px 0",
				},
				"100%": {
					backgroundPosition: "300px 0",
				},
			},
		},
	},
})
