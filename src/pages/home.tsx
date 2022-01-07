import { Box, Button, Link, Typography } from "@mui/material"
import { styled } from "@mui/system"
import BinanceCoinBnbLogo from "../assets/images/crypto/binance-coin-bnb-logo.svg"
import AxieInfinityLogo from "../assets/images/games/axie infinity.png"
import XSYNWordmarkImage from "../assets/images/XSYN Wordmark White.png"
import { GradientCircleThing } from "../components/home/gradientCircleThing"
import { Navbar } from "../components/home/navbar"

export const Home = () => {
	return (
		<>
			<Box
				sx={(theme) => ({
					position: "relative",
					minHeight: "100vh",
					borderBottom: `1px solid ${theme.palette.secondary.main}`
				})}
			>
				<GradientCircleThing sx={{
					zIndex: -1,
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
				}} />
				<Navbar />
				<Box sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					display: 'flex',
					flexDirection: "column",
					alignItems: "center",
					width: "100%",
					maxWidth: "600px",
				}}>
					<Typography variant="h1" fontSize="4rem" sx={{
						textAlign: "center",
						marginBottom: "2rem",
					}}>
						A Crypto Wallet & Gateway To Blockchain Apps
					</Typography>
					<Button sx={(theme) => ({
						boxSizing: "content-box",
						position: "relative",
						padding: ".5rem 3rem",
						borderRadius: 0,
						border: `2px solid ${theme.palette.primary.main}`,
						textTransform: "uppercase",
						"&:hover": {
							"&::before": {
								opacity: .4,
							},
							"&::after": {
								opacity: .2,
								transitionDelay: ".1s",
							},
						},
						"&::before": {
							content: "''",
							position: "absolute",
							top: "4px",
							left: "4px",
							width: "100%",
							height: "100%",
							border: `2px solid ${theme.palette.primary.main}`,
							opacity: 0,
							transition: "opacity .3s ease-in",
							pointerEvents: "none",
						},
						"&::after": {
							content: "''",
							position: "absolute",
							top: "10px",
							left: "10px",
							width: "100%",
							height: "100%",
							border: `2px solid ${theme.palette.primary.main}`,
							opacity: 0,
							transition: "opacity .3s ease-in",
							pointerEvents: "none",
						},
					})}>Connect Wallet</Button>
				</Box>
			</Box >
			{/* <Typography variant="h1" component="p" sx={(theme) => ({
				marginTop: "16rem",
				padding: "4rem 3rem",
				fontSize: "3rem",
				textAlign: "center",
				borderBottom: `1px solid ${theme.palette.secondary.main}`
			})}>
				Start exploring blockchain apps in seconds
			</Typography> */}
			<Box sx={(theme) => ({
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				padding: "4rem 3rem",
				backgroundColor: "#0a061f",
				borderBottom: `1px solid ${theme.palette.secondary.main}`
			})}>
				<Typography variant="h1" component="h2" sx={(theme) => ({
					marginBottom: "3rem",
					fontSize: "3rem",
					color: theme.palette.secondary.main
				})}>Sync Your Currency</Typography>
				<Box sx={{
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
					}
				}}>
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
				<Typography variant="h1" component="h2" sx={(theme) => ({
					marginBottom: "3rem",
					fontSize: "3rem",
					color: theme.palette.primary.main
				})}>Compatible Games</Typography>
				<Box sx={{
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
					}
				}}>
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
			<Box sx={{
				overflowY: "hidden",
				position: "relative",
				display: "flex",
				flexDirection: "column",
				minHeight: '100vh',
				width: "100%",
				maxWidth: "1700px",
				margin: "0 auto",
				padding: "4rem 3rem",
				paddingBottom: "1rem",
			}}>
				<Typography variant="h1" component="h2" sx={{
					width: "100%",
					maxWidth: "800px",
					fontSize: "3rem"
				}}>Start Exploring Blockchain Apps In Seconds</Typography>
				<GradientCircleThing sx={{
					zIndex: -1,
					position: "absolute",
					left: "50%",
					bottom: "-35vw",
					transform: "translate(-50%, 0)",
				}} />
				<Box sx={{
					flex: 1
				}} />
				<Box component="img" src={XSYNWordmarkImage} alt="XSYN Wordmark" sx={{
					alignSelf: "center",
					marginBottom: "3rem",
				}} />
				<Box sx={{
					display: "flex",
					justifyContent: "space-between",
					width: "100%",
					maxWidth: "600px",
					margin: "0 auto",
				}}>
					<Link href="/privacy-policy" underline="none" color="white">Privacy Policy</Link>
					<Link href="/terms-and-conditions" underline="none" color="white">Terms And Conditions</Link>
				</Box>
			</Box>
		</>
	)
}

const LogoImage = styled("img")({
	width: "100%"
})
