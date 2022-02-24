import { Box, Link, Typography } from "@mui/material"
import { useHistory } from "react-router-dom"
import PrivacyPolicy from "../assets/documents/XSYN-Privacy-Policy.pdf"
import TermsAndConditions from "../assets/documents/XSYN-Terms-and-Conditions.pdf"
import { FancyButton } from "../components/fancyButton"
import { GradientCircleThing } from "../components/home/gradientCircleThing"
import { Navbar } from "../components/home/navbar"
import { useAuth } from "../containers/auth"

export const Home = () => {
	const history = useHistory()
	const { user } = useAuth()

	return (
		<>
			<Box
				sx={{
					position: "relative",
					minHeight: "100vh",
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
						Your ticket to the metaverse
					</Typography>
					<FancyButton onClick={() => history.push(!!user ? "/profile" : "/login")} fancy>
						{!!user ? "View Profile" : "Login"}
					</FancyButton>
				</Box>
			</Box>

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
