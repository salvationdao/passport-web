import { Box, LinearProgress, Stack, styled, Typography } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useEffect, useRef, useState } from "react"
import { useHistory } from "react-router-dom"
import { useContainer } from "unstated-next"
import { BuyTokens } from "../../components/buyTokens"
import { BackgroundVideo } from "../../components/supremacy/backgroundVideo"
import { CountdownTimer } from "../../components/supremacy/countdownTimer"
import { Loading } from "../../components/supremacy/loading"
import { SupremacyNavbar } from "../../components/supremacy/navbar"
import { AppState, SnackState } from "../../containers/supremacy/app"
import { colors } from "../../theme"
import BWSupToken from "../../assets/images/BW-sup-token.png"
import { useWeb3, web3Constants } from "../../containers/web3"

export const TEXT_GAME_LOCATION = "TextGame/TextAdventure.html"
export const IMAGE_FOLDER = "https://afiles.ninja-cdn.com/supremacy/images"
export const VIDEO_FOLDER = "https://afiles.ninja-cdn.com/supremacy/videos"
export const NAVBAR_HEIGHT = 100

export const SalePage = () => {
	const smallerScreen = useMediaQuery("(max-width:1300px)")
	const shorterScreen = useMediaQuery("(max-height:800px)")
	const [open, setOpen] = useState(false)
	const [isTouchDevice, setIsTouchDevice] = useState(false)

	// Game state
	const [showGame, setShowGame] = useState(false)
	const contentRef = useRef<HTMLIFrameElement>(null)
	const history = useHistory()

	const { account, connect, wcConnect } = useWeb3()
	const { loading, setLoading, saleActive, amountRemaining } = useContainer(AppState)
	const { setSnackMessage } = useContainer(SnackState)

	useEffect(() => {
		let check = window.matchMedia("(hover: none), (pointer: coarse)").matches ? true : false
		setIsTouchDevice(check)
	}, [])

	const handleJoinBtn = async () => {
		if (!account) {
			if ((window as any).ethereum) {
				const err = await connect(setShowGame)
				err && setSnackMessage(err)
			} else {
				await wcConnect(setShowGame)
			}
		} else {
			// Make request to server and send account address
			// Receive response, if accepted, show game
			window.localStorage.setItem("wallet", account)
			setShowGame(true)
		}
	}
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
			<GameFrame src={TEXT_GAME_LOCATION} ref={contentRef}>
				Your browser doesnt support iframes
			</GameFrame>
		</>
	) : (
		<>
			<Loading loading={loading} setLoading={setLoading} />
			<Box
				sx={{
					opacity: loading ? 0 : 1,
					minHeight: "100vh",
					background: colors.black2Background,
				}}
			>
				<SupremacyNavbar />
				<Stack
					sx={{
						pt: `${NAVBAR_HEIGHT}px`,
						pb: "2em",
						justifyContent: "center",
						height: "100vh",
						alignItems: "center",
						gap: "1em",
						px: "2em",
					}}
				>
					<Stack alignItems="center">
						<Box
							component="img"
							src={IMAGE_FOLDER + "/home/logo.webp"}
							alt="Supremacy metaverse game"
							sx={{
								mt: "1rem",
								cursor: "pointer",
								width: "100%",
								maxWidth: "30vw",
								"@media (max-width: 1440px)": {
									maxWidth: "30rem",
								},
							}}
							onClick={() => history.push("https://supremacy.game/home")}
						/>
						<Title>Game Launch and TOKEN SALE</Title>
						<SubHeading>PURCHASE $SUPS TO ACCESS THE BATTLE ARENA</SubHeading>
					</Stack>
					<CountdownTimer publicSale />
					{/* Progress Bar */}
					<Box sx={{ position: "relative" }}>
						<FancyLinearProgress
							variant="determinate"
							value={100 - (amountRemaining / web3Constants.totalSaleSups) * 100}
							aria-label="Tokens sold progressive bar"
						/>
						<Box
							sx={{
								position: "absolute",
								top: "50%",
								transform: `translate(-100%,-50%)`,
								left: `${100 - (amountRemaining / web3Constants.totalSaleSups) * 100}%`,
								display: "flex",
								alignItems: "center",
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
									textTransform: "uppercase",
									color: colors.darkNavyBlue,
									whiteSpace: "nowrap",
									fontWeight: "600",
								}}
							>
								{(amountRemaining / 10 ** 6).toFixed(2)}m $SUPS remaining
							</Typography>
						</Box>
					</Box>
					<Box
						sx={{
							display: "flex",
							width: "100%",
							alignItems: "center",
							justifyContent: "center",
							gap: "5em",
						}}
					>
						{/* <WhiteListModal
							publicSale={saleActive}
							smallerScreen={smallerScreen}
							shorterScreen={shorterScreen}
							open={open}
							setOpen={setOpen}
							handleJoinBtn={handleJoinBtn}
							isTouchDevice={isTouchDevice}
						/> */}
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
	fontSize: "3rem",
	margin: 0,
	"@media (max-width:600px)": {
		fontSize: "2.5rem",
	},
	"@media (max-width:559px)": {
		fontSize: "1.8rem",
	},
	"@media (max-width:375px)": {
		fontSize: "1.6rem",
	},
	"@media (max-width:350px)": {
		fontSize: "1.4rem",
	},
})

const SubHeading = styled("span")({
	fontFamily: ["Share Tech"].join(","),
	fontSize: "2rem",
	color: colors.neonBlue,
	textAlign: "center",
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
	maxWidth: "40rem",
	height: "45px",
	"@media (max-width:559px)": {
		height: "40px",
	},
	clipPath: `polygon(0 0, calc(100% - 1rem) 0%, 100% 1rem, 100% 100%, 1rem 100%, 0% calc(100% - 1rem))`,
	backgroundColor: "rgba(0, 136, 136, 0.4)",
	"&>span": {
		backgroundColor: colors.neonBlue,
	},
})
