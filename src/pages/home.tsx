import { LoadingButton } from "@mui/lab"
import { Box, Button, Link, Menu, MenuItem, MenuList, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { useState } from 'react'
import BinanceCoinBnbLogo from "../assets/images/crypto/binance-coin-bnb-logo.svg"
import AxieInfinityLogo from "../assets/images/games/axie infinity.png"
import SupremacyLogo from "../assets/images/supremacy-logo.svg"
import XSYNLogoImage from "../assets/images/XSYN Stack White.svg"
import XSYNWordmarkImage from "../assets/images/XSYN Wordmark White.png"
import { GradientCircleThing } from "../components/home/gradientCircleThing"

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
					<MenuButton />
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

const OuterCircle = styled("div")(({ theme }) => ({
	zIndex: -1,
	overflow: "hidden",
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	height: "70vw",
	width: "70vw",
	borderRadius: "50%",
	border: `2px solid ${theme.palette.secondary.main}`
}))

const LogoImage = styled("img")({
	width: "100%"
})

const MenuButton: React.FC = () => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const open = Boolean(anchorEl);

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
				PaperProps={{
					sx: (theme) => ({
						padding: "1rem",
						backgroundColor: theme.palette.background.default
					})
				}}
			>
				<MenuList>
					<MenuItem onClick={handleClose} sx={(theme) => ({
						padding: ".5rem 0",
						fontSize: "2rem",
						lineHeight: 1,
						color: theme.palette.primary.main
					})}><Box component="span" sx={{
						marginRight: ".5rem"
					}}>&#62;</Box>Profile</MenuItem>
					<MenuItem onClick={handleClose} sx={(theme) => ({
						padding: ".5rem 0",
						fontSize: "2rem",
						lineHeight: 1,
						color: theme.palette.primary.main
					})}><Box component="span" sx={{
						marginRight: ".5rem"
					}}>&#62;</Box>Wallet</MenuItem>
					<MenuItem onClick={handleClose} sx={(theme) => ({
						padding: ".5rem 0",
						fontSize: "2rem",
						lineHeight: 1,
						color: theme.palette.primary.main
					})}><Box component="span" sx={{
						marginRight: ".5rem"
					}}>&#62;</Box>Badges</MenuItem>
				</MenuList>
				<Box sx={(theme) => ({
					marginBottom: ".5rem",
					fontSize: "1rem",
					color: "#807f82"
				})}>My Games</Box>
				<Link href="https://supremacy.game"><Box component="img" sx={{
					width: "100%",
				}} src={SupremacyLogo} alt="Supremacy Logo" /></Link>
			</Menu>
			<LoadingButton sx={{
				position: "relative",
				height: "3.3rem",
				width: "3.3rem",
				minWidth: "auto",
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
			}}
				onClick={handleClick}
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
			</LoadingButton>
		</>
	)
}