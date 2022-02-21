import { Box, Stack, styled, Typography } from "@mui/material"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useEffect, useRef, useState } from "react"
import { useHistory } from "react-router-dom"
import { useContainer } from "unstated-next"
import { BackgroundVideo } from "../../components/supremacy/backgroundVideo"
import { CountdownTimer } from "../../components/supremacy/countdownTimer"
import { Loading } from "../../components/supremacy/loading"
import { WhiteListModal } from "../../components/supremacy/whiteListModal"
import { AppState, SnackState } from "../../containers/supremacy/app"
import { useWeb3 } from "../../containers/web3"
import { colors } from "../../theme"

export const TEXT_GAME_LOCATION = "TextGame/TextAdventure.html"
export const IMAGE_FOLDER = "https://afiles.ninja-cdn.com/supremacy/images"
export const VIDEO_FOLDER = "https://afiles.ninja-cdn.com/supremacy/videos"

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
	const { loading, setLoading, saleActive } = useContainer(AppState)
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
				}}
			>
				<Stack
					sx={{
						pb: "2em",
						background: colors.black2Background,
						justifyContent: "center",
						height: "100vh",
						alignItems: "center",
						gap: "3vmin",
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
						<Typography variant="h1" sx={{ textAlign: "center" }}>
							Game launch and TOKEN SALE
						</Typography>
						<Typography sx={{ color: colors.neonBlue, fontSize: "2rem" }}>PURCHASE $SUPS TO ACCESS THE BATTLE ARENA</Typography>
					</Stack>
					<CountdownTimer publicSale />
					<Box
						sx={{
							display: "flex",
							width: "100%",
							alignItems: "center",
							justifyContent: "center",
							gap: "5em",
						}}
					>
						<WhiteListModal
							publicSale={saleActive}
							smallerScreen={smallerScreen}
							shorterScreen={shorterScreen}
							open={open}
							setOpen={setOpen}
							handleJoinBtn={handleJoinBtn}
							isTouchDevice={isTouchDevice}
						/>

						<Box
							component="iframe"
							src={"http://localhost:5003/if-buy"}
							onLoadedData={() => setLoading(false)}
							allowTransparency
							sx={{
								mt: "-10%",
								width: "100%",
								maxWidth: "30rem",
								height: "100%",
								minHeight: "40rem",
								overflow: "hidden",
								border: "none",
							}}
						/>
					</Box>
				</Stack>
			</Box>

			<BackgroundVideo />
		</>
	)
}

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
