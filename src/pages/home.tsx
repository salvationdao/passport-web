import ButtonUnstyled from '@mui/base/ButtonUnstyled'
import { Box, Button, Link, Typography } from "@mui/material"
import { keyframes, styled } from "@mui/system"
import BinanceCoinBnbLogo from "../assets/images/crypto/binance-coin-bnb-logo.svg"
import AxieInfinityLogo from "../assets/images/games/axie infinity.png"
import XSYNLogoImage from "../assets/images/XSYN Stack White.svg"
import XSYNWordmarkImage from "../assets/images/XSYN Wordmark White.png"

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
				<OuterCircle>
					<Box sx={(theme) => ({
						zIndex: 1,
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: theme.palette.background.default,
						opacity: .6
					})} />
					<Box sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						height: "60%",
						width: "60%",
						transform: "translate(-50%, -50%)",
						borderRadius: "50%",
						background: "linear-gradient(300deg,#5072d9,#8020ec,#d957cc,#449deb)",
						backgroundSize: "130% 130%",
						animation: `${gradientAnimation} 16s ease infinite`
					}} />
				</OuterCircle>
				<Box sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
					maxWidth: "1700px",
					margin: "0 auto",
					marginTop: "3rem",
					padding: "0 3rem",
				}}>
					<Link href="/">
						<Box component="img" src={XSYNLogoImage} alt="XSYN Logo" />
					</Link>
					<ButtonUnstyled component={styled("button")({
						position: "relative",
						height: "3.3rem",
						width: "3.3rem",
						padding: 0,
						borderRadius: "50%",
						cursor: "pointer",
						backgroundColor: "transparent",
						border: "none",
						"&:hover": {
							"& > *:nth-of-type(1)": {
								transform: "rotate(30deg) translate(-3px, 0)",
							},
							"& > *:nth-of-type(2)": {

							},
							"& > *:nth-of-type(3)": {
								transform: "rotate(30deg) translate(3px, 0)",
							},
						},
						"&:active": {
							"& > *:nth-of-type(1)": {
								transform: "rotate(30deg) translate(1px, 0)",
							},
							"& > *:nth-of-type(2)": {

							},
							"& > *:nth-of-type(3)": {
								transform: "rotate(30deg) translate(-1px, 0)",
							},
						}
					})}
					>
						<Box component="span" sx={(theme) => ({
							position: "absolute",
							top: ".5rem",
							left: ".5rem",
							height: "2rem",
							width: ".2rem",
							transform: "rotate(30deg)",
							transition: "transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
							backgroundColor: theme.palette.common.white,
						})} />
						<Box component="span" sx={(theme) => ({
							position: "absolute",
							top: ".5rem",
							left: "1.5rem",
							height: "2rem",
							width: ".2rem",
							transform: "rotate(30deg)",
							transition: "transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
							backgroundColor: theme.palette.common.white,
						})} />
						<Box component="span" sx={(theme) => ({
							position: "absolute",
							top: ".5rem",
							left: "2.5rem",
							height: "2rem",
							width: ".2rem",
							transform: "rotate(30deg)",
							transition: "transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
							backgroundColor: theme.palette.common.white,
						})} />
					</ButtonUnstyled>
				</Box>
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
								opacity: 1,
							},
							"&::after": {
								opacity: 1,
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
				<OuterCircle sx={{
					top: "initial",
					bottom: "-35vw",
					transform: "translate(-50%, 0)",
				}}>
					<Box sx={(theme) => ({
						zIndex: 1,
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: theme.palette.background.default,
						opacity: .6
					})} />
					<Box sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						height: "60%",
						width: "60%",
						transform: "translate(-50%, -50%)",
						borderRadius: "50%",
						background: "linear-gradient(300deg,#5072d9,#8020ec,#d957cc,#449deb)",
						backgroundSize: "130% 130%",
						animation: `${gradientAnimation} 16s ease infinite`
					}} />
				</OuterCircle>
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
					<Link href="/privacy-policy" underline="none">Privacy Policy</Link>
					<Link href="/terms-and-conditions" underline="none">Terms And Conditions</Link>
				</Box>
			</Box>
		</>
	)
}

const OuterCircle = styled("div")(({ theme }) => ({
	zIndex: -1,
	overflow: "hidden",
	position: "absolute",
	top: "50%",
	left: "50%",
	height: "70vw",
	width: "70vw",
	transform: "translate(-50%, -50%)",
	borderRadius: "50%",
	border: `2px solid ${theme.palette.secondary.main}`
}))

const LogoImage = styled("img")({
	width: "100%"
})

const gradientAnimation = keyframes`
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`