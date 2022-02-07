import { Box, Link, Typography } from "@mui/material"
import { useHistory } from "react-router-dom"
import {
	AxieInfinityLogoImagePath,
	BinanceCoinBnbLogoImagePath,
	BinanceUsdBusdLogoImagePath,
	BitcoinBtcLogoImagePath,
	DashDashLogoImagePath,
	DecentralandManaLogoImagePath,
	EthereumEthLogoImagePath,
	IlluviumLogoImagePath,
	LitecoinLtcLogoImagePath,
	MobloxLogoImagePath,
	MoneroXmrLogoImagePath,
	NexoNexoLogoImagePath,
	OmgOmgLogoImagePath,
	SandboxLogoImagePath,
	SolanaSolLogoImagePath,
	SomethingLogoImagePath,
	StarAtlasLogoImagePath,
	SteemSteemLogoImagePath,
	TheSandboxSandLogoImagePath,
	XSYNWordmarkImagePath,
} from "../assets"
import BottomRightMatrix from "../assets/images/Bottom right corner matrix accent.png"
import BottomLeftMatrix from "../assets/images/Left Corner Matrix.png"
import { FancyButton } from "../components/fancyButton"
import { GradientCircleThing } from "../components/home/gradientCircleThing"
import { Navbar } from "../components/home/navbar"
import { SidebarLayout } from "../components/sidebarLayout"
import { useAuth } from "../containers/auth"
import { useSidebarState } from "../containers/sidebar"
import { colors } from "../theme"

export const Home = () => {
	const history = useHistory()
	const { user } = useAuth()
	const { sidebarOpen, setSidebarOpen } = useSidebarState()

	return (
		<SidebarLayout open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
			<Box
				sx={{
					overflow: "hidden",
					position: "relative",
					minHeight: "max(100vh, 70rem)",
				}}
			>
				<GradientCircleThing
					sx={{
						zIndex: -1,
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, calc(-50% + (100vh - 70rem) / 2))",
					}}
				/>
				<Navbar />
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, calc(-50% + (100vh - 70rem) / 2))",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "100%",
						maxWidth: "600px",
					}}
				>
					<Typography
						variant="h1"
						sx={{
							marginBottom: "2rem",
							textAlign: "center",
							fontSize: "4rem",
							"@media (max-width: 600px)": {
								fontSize: "3rem",
							},
						}}
					>
						A Crypto Wallet & Gateway To Blockchain Apps
					</Typography>
					<FancyButton onClick={() => history.push(!!user ? "/profile" : "/login")} fancy>
						{!!user ? "View Profile" : "Login"}
					</FancyButton>
				</Box>
			</Box>
			<Typography
				variant="h1"
				component="p"
				sx={(theme) => ({
					padding: "4rem 3rem",
					fontSize: "3rem",
					textAlign: "center",
					borderBottom: `1px solid ${theme.palette.secondary.main}`,
				})}
			>
				Start exploring blockchain apps in seconds
			</Typography>
			<Box
				sx={(theme) => ({
					position: "relative",
					padding: "4rem 3rem",
					backgroundColor: colors.navyBlue,
					borderBottom: `1px solid ${theme.palette.secondary.main}`,
				})}
			>
				<Box
					component="img"
					src={BottomLeftMatrix}
					alt="Background matrix image"
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "max(30vw, 20rem)",
						objectFit: "cover",
						opacity: 0.4,
					}}
				/>
				<Box
					component="img"
					src={BottomRightMatrix}
					alt="Background matrix image"
					sx={{
						position: "absolute",
						right: 0,
						bottom: 0,
						width: "max(30vw, 20rem)",
						objectFit: "cover",
						opacity: 0.4,
					}}
				/>
				<Box
					sx={{
						zIndex: 1,
						position: "relative",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
					}}
				>
					<Typography
						variant="h1"
						component="h2"
						sx={(theme) => ({
							marginBottom: "3rem",
							fontSize: "3rem",
							color: theme.palette.secondary.main,
						})}
					>
						Sync Your Currency
					</Typography>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(4, 72px)",
							gridTemplateRows: "repeat(auto-fill, 72px)",
							columnGap: "8rem",
							rowGap: "4rem",
							justifyItems: "center",
							marginBottom: "4rem",
							"@media (max-width: 700px)": {
								gridTemplateColumns: "repeat(3, 72px)",
								columnGap: "4rem",
								rowGap: "2rem",
							},
							"@media (max-width: 500px)": {
								gridTemplateColumns: "repeat(3, 64px)",
								columnGap: "2rem",
								rowGap: "2rem",
							},
							"& > *": {
								width: "100%",
								maxHeight: "100%",
							},
						}}
					>
						<Box component="img" src={BinanceCoinBnbLogoImagePath} alt="Logo" />
						<Box component="img" src={BinanceUsdBusdLogoImagePath} alt="Logo" />
						<Box component="img" src={BitcoinBtcLogoImagePath} alt="Logo" />
						<Box component="img" src={DashDashLogoImagePath} alt="Logo" />
						<Box component="img" src={EthereumEthLogoImagePath} alt="Logo" />
						<Box component="img" src={LitecoinLtcLogoImagePath} alt="Logo" />
						<Box component="img" src={MoneroXmrLogoImagePath} alt="Logo" />
						<Box component="img" src={NexoNexoLogoImagePath} alt="Logo" />
						<Box component="img" src={OmgOmgLogoImagePath} alt="Logo" />
						<Box component="img" src={SolanaSolLogoImagePath} alt="Logo" />
						<Box component="img" src={SteemSteemLogoImagePath} alt="Logo" />
						<Box component="img" src={TheSandboxSandLogoImagePath} alt="Logo" />
					</Box>
					<Typography
						variant="h1"
						component="h2"
						sx={(theme) => ({
							marginBottom: "3rem",
							fontSize: "3rem",
							color: theme.palette.primary.main,
						})}
					>
						Compatible Games
					</Typography>
					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							justifyContent: "center",
							width: "100%",
							maxWidth: "1200px",
							"& > *": {
								maxWidth: "100%",
								maxHeight: "72px",
								margin: "2rem",
							},
							"@media (max-width: 700px)": {
								"& > *": {
									maxHeight: "64px",
									margin: "1.5rem",
								},
							},
						}}
					>
						<Box component="img" src={AxieInfinityLogoImagePath} alt="Game Logo" />
						<Box component="img" src={DecentralandManaLogoImagePath} alt="Game Logo" />
						<Box component="img" src={IlluviumLogoImagePath} alt="Game Logo" />
						<Box component="img" src={SomethingLogoImagePath} alt="Game Logo" />
						<Box component="img" src={MobloxLogoImagePath} alt="Game Logo" />
						<Box component="img" src={SandboxLogoImagePath} alt="Game Logo" />
						<Box component="img" src={StarAtlasLogoImagePath} alt="Game Logo" />
					</Box>
				</Box>
			</Box>
			<Box
				sx={{
					overflow: "hidden",
					position: "relative",
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
					width: "100%",
					maxWidth: "1700px",
					margin: "0 auto",
					padding: "4rem 3rem",
					paddingBottom: "1rem",
				}}
			>
				<Typography
					variant="h1"
					component="h2"
					sx={{
						width: "100%",
						maxWidth: "800px",
						fontSize: "3rem",
						"@media (max-width: 600px)": {
							fontSize: "2rem",
						},
					}}
				>
					Start Exploring Blockchain Apps In Seconds
				</Typography>
				<GradientCircleThing
					innerOpacity={0.6}
					sx={{
						zIndex: -1,
						position: "absolute",
						left: "50%",
						bottom: "-50%",
						transform: "translate(-50%, 0)",
					}}
				/>
				<Box
					sx={{
						flex: 1,
					}}
				/>
				<Box
					component="img"
					src={XSYNWordmarkImagePath}
					alt="XSYN Wordmark"
					sx={{
						alignSelf: "center",
						marginBottom: "3rem",
					}}
				/>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						width: "100%",
						maxWidth: "600px",
						margin: "0 auto",
					}}
				>
					<Link href="/privacy-policy" underline="none" color="white">
						Privacy Policy
					</Link>
					<Link href="/terms-and-conditions" underline="none" color="white">
						Terms And Conditions
					</Link>
				</Box>
			</Box>
		</SidebarLayout>
	)
}
