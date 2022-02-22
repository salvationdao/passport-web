import { Box, Link, styled, Typography } from "@mui/material"
import { useHistory } from "react-router-dom"
import { XSYNWordmarkImagePath } from "../assets"
import BottomRightMatrix from "../assets/images/Bottom right corner matrix accent.png"
import BottomLeftMatrix from "../assets/images/Left Corner Matrix.png"
import { FancyButton } from "../components/fancyButton"
import { GradientCircleThing } from "../components/home/gradientCircleThing"
import { Navbar } from "../components/home/navbar"
import { useAuth } from "../containers/auth"
import { colors } from "../theme"
import PrivacyPolicy from "../assets/documents/XSYN-Privacy-Policy.pdf"
import TermsAndConditions from "../assets/documents/XSYN-Terms-and-Conditions.pdf"

export const Home = () => {
	const history = useHistory()
	const { user } = useAuth()

	return (
		<>
			<Box
				sx={{
					overflow: "hidden",
					position: "relative",
					minHeight: "max(100vh, 70rem)",
					height: "100%",
				}}
			>
				<GradientCircleThing
					sx={{
						zIndex: -1,
						position: "absolute",
						top: "31%",
						left: "50%",
						transform: "translate(-50%, calc(-50% + (100vh - 70rem) / 2))",
					}}
				/>
				<Navbar />
				<Box
					sx={{
						position: "absolute",
						top: "31%",
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
						Your ticket to the metaverse
					</Typography>
					<FancyButton onClick={() => history.push(!!user ? "/profile" : "/login")} fancy>
						{!!user ? "View Profile" : "Login"}
					</FancyButton>
				</Box>
			</Box>

			{/* <Box
				sx={(theme) => ({
					position: "relative",
					padding: "4rem 3rem",
					backgroundColor: colors.darkNavyBlue,
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
				<Box>
					<StatsFrame src="https://stats.supremacy.game/#/" scrolling="no">
						Iframe not supported
					</StatsFrame>
				</Box>
			</Box> */}
			<Box
				sx={{
					overflow: "hidden",
					position: "relative",
					display: "flex",
					flexDirection: "column",
					width: "100%",
					maxWidth: "1700px",
					margin: "0 auto",
					padding: "4rem 3rem",
					paddingBottom: "1rem",
				}}
			>
				{/* <Typography
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
				</Typography> */}

				<Box
					sx={{
						flex: 1,
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
					<Link href={PrivacyPolicy} target="_blank" underline="none" color="white">
						Privacy Policy
					</Link>
					<Link href={TermsAndConditions} underline="none" color="white">
						Terms And Conditions
					</Link>
				</Box>
			</Box>
		</>
	)
}

const StatsFrame = styled("iframe")({
	width: "100%",
	border: "none",
	height: "100vh",
})
