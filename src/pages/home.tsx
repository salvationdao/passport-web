import { Box, Button, Typography } from "@mui/material"
import { keyframes, styled } from "@mui/system"
import CompatibleGames from "../assets/images/Compatible-Games.png"
import SyncYourCurrency from "../assets/images/Sync-Your-Currency.png"
import XSYNLogoImage from "../assets/images/XSYN Stack White.svg"
import XSYNWordmarkImage from "../assets/images/XSYN Wordmark White.png"

export const Home = () => {
	return (
		<>
			<Box
				sx={{
					position: "relative",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}
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
						backgroundSize: "100% 100%",
						animation: `${gradientAnimation} 4s ease infinite`
					}} />
				</OuterCircle>
				<Box sx={{
					position: "absolute",
					top: "3rem",
					left: "50%",
					transform: "translate(-50%, 0)",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					width: "100%",
					maxWidth: "1700px",
				}}>
					<Box component="img" src={XSYNLogoImage} alt="XSYN Logo" />
					<Box sx={{
						position: "relative",
						height: "3rem",
						width: "3rem",
					}}>
						<Box component="span" sx={(theme) => ({
							position: "absolute",
							top: 0,
							left: 0,
							height: "2rem",
							width: ".2rem",
							transform: "rotate(30deg)",
							backgroundColor: theme.palette.common.white,
						})} />
						<Box component="span" sx={(theme) => ({
							position: "absolute",
							top: 0,
							left: "1rem",
							height: "2rem",
							width: ".2rem",
							transform: "rotate(30deg)",
							backgroundColor: theme.palette.common.white,
						})} />
						<Box component="span" sx={(theme) => ({
							position: "absolute",
							top: 0,
							left: "2rem",
							height: "2rem",
							width: ".2rem",
							transform: "rotate(30deg)",
							backgroundColor: theme.palette.common.white,
						})} />
					</Box>
				</Box>
				<Typography variant="h1" fontSize="4rem" sx={{
					width: "100%",
					maxWidth: "600px",
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
			</Box >
			<Typography variant="h1" component="p" sx={(theme) => ({
				marginTop: "16rem",
				padding: "4rem 3rem",
				fontSize: "3rem",
				textAlign: "center",
				borderBottom: `1px solid ${theme.palette.secondary.main}`
			})}>
				Start exploring blockchain apps in seconds
			</Typography>
			<Box sx={(theme) => ({
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				padding: "4rem 1rem",
				backgroundColor: "#0a061f",
				borderBottom: `1px solid ${theme.palette.secondary.main}`
			})}>
				<Box component="img" src={SyncYourCurrency} alt="Sync Your Currency" />
				<Box component="img" src={CompatibleGames} alt="Compatible Games" />
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
				padding: "4rem 1rem",
				paddingBottom: "1rem",
			}}>
				<Typography variant="h1" component="h2" sx={{
					width: "100%",
					maxWidth: "800px",
					fontSize: "3rem"
				}}>Start Exploring Blockchain Apps In Seconds</Typography>
				<OuterCircle sx={{
					top: "initial",
					bottom: "-70%",
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
						backgroundSize: "100% 100%",
						animation: `${gradientAnimation} 4s ease infinite`
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
					<p>Privacy Policy</p>
					<p>Terms And Conditions</p>
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