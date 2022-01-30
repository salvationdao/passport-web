import { Box, Link, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { useHistory } from "react-router-dom"
import BottomRightMatrix from "../assets/images/Bottom right corner matrix accent.png"
import BinanceCoinBnbLogo from "../assets/images/crypto/binance-coin-bnb-logo.svg"
import AxieInfinityLogo from "../assets/images/games/axie infinity.png"
import BottomLeftMatrix from "../assets/images/Left Corner Matrix.png"
import XSYNWordmarkImage from "../assets/images/XSYN Wordmark White.png"
import { FancyButton } from "../components/fancyButton"
import { GradientCircleThing } from "../components/home/gradientCircleThing"
import { Navbar } from "../components/home/navbar"
import { AuthContainer } from "../containers"
import { colors } from "../theme"

export const Home = () => {
	const history = useHistory()
	const { user } = AuthContainer.useContainer()

	return (
		<>
			<Box
				sx={{
					overflow: "hidden",
					position: "relative",
					minHeight: "max(100vh, 60rem)",
				}}
			>
				<GradientCircleThing
					sx={{
						zIndex: -1,
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
				/>
				<Navbar />
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
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
					marginTop: "10vw",
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
							gridTemplateColumns: "repeat(4, 100px)",
							columnGap: "8rem",
							rowGap: "4rem",
							justifyItems: "center",
							marginBottom: "4rem",
							"@media (max-width: 800px)": {
								gridTemplateColumns: "repeat(3, 100px)",
								columnGap: "4rem",
								rowGap: "2rem",
							},
							"@media (max-width: 500px)": {
								gridTemplateColumns: "repeat(2, 100px)",
							},
						}}
					>
						<LogoImage src={BinanceCoinBnbLogo} alt="Binance Coin BNB Logo" />
						<LogoImage src={BinanceCoinBnbLogo} alt="Binance Coin BNB Logo" />
						<LogoImage src={BinanceCoinBnbLogo} alt="Binance Coin BNB Logo" />
						<LogoImage src={BinanceCoinBnbLogo} alt="Binance Coin BNB Logo" />
						<LogoImage src={BinanceCoinBnbLogo} alt="Binance Coin BNB Logo" />
						<LogoImage src={BinanceCoinBnbLogo} alt="Binance Coin BNB Logo" />
						<LogoImage src={BinanceCoinBnbLogo} alt="Binance Coin BNB Logo" />
						<LogoImage src={BinanceCoinBnbLogo} alt="Binance Coin BNB Logo" />
						<LogoImage src={BinanceCoinBnbLogo} alt="Binance Coin BNB Logo" />
						<LogoImage src={BinanceCoinBnbLogo} alt="Binance Coin BNB Logo" />
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
							display: "grid",
							gridTemplateColumns: "repeat(4, 100px)",
							columnGap: "8rem",
							rowGap: "4rem",
							justifyItems: "center",
							"@media (max-width: 800px)": {
								gridTemplateColumns: "repeat(3, 100px)",
								columnGap: "4rem",
								rowGap: "2rem",
							},
							"@media (max-width: 500px)": {
								gridTemplateColumns: "repeat(2, 100px)",
							},
						}}
					>
						<LogoImage src={AxieInfinityLogo} alt="Axie Infinity Logo" />
						<LogoImage src={AxieInfinityLogo} alt="Axie Infinity Logo" />
						<LogoImage src={AxieInfinityLogo} alt="Axie Infinity Logo" />
						<LogoImage src={AxieInfinityLogo} alt="Axie Infinity Logo" />
						<LogoImage src={AxieInfinityLogo} alt="Axie Infinity Logo" />
						<LogoImage src={AxieInfinityLogo} alt="Axie Infinity Logo" />
						<LogoImage src={AxieInfinityLogo} alt="Axie Infinity Logo" />
						<LogoImage src={AxieInfinityLogo} alt="Axie Infinity Logo" />
						<LogoImage src={AxieInfinityLogo} alt="Axie Infinity Logo" />
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
						bottom: "-30rem",
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
					src={XSYNWordmarkImage}
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
		</>
	)
}

const LogoImage = styled("img")({
	width: "100%",
})
