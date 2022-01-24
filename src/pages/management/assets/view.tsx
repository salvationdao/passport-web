import { Box, Paper, styled, Typography } from "@mui/material"
import { useParams } from "react-router-dom"
import { Navbar } from "../../../components/home/navbar"
import PlaceholderMech from "../../../assets/images/placeholder_mech.png"
import { FancyButton } from "../../../components/fancyButton"
import { colors } from "../../../theme"

export const AssetPage = () => {
	const { tokenID } = useParams<{ tokenID: string }>()

	console.log("yoyo", tokenID)

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<Navbar />

			<Paper
				sx={{
					width: "100%",
					maxWidth: "1768px",
					margin: "0 auto",
					borderRadius: 0,
					backgroundColor: "transparent",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
				}}
			>
				<AssetContainer>
					<Box
						sx={{
							width: "100%",
							maxWidth: "1768px",
							margin: "50px",
							borderRadius: 0,
							backgroundColor: "transparent",
							display: "flex",
						}}
					>
						{/* image */}
						<Box
							component="img"
							src={PlaceholderMech}
							alt="placeholder"
							sx={{
								width: "566px",
								height: "732px",
								marginRight: "50px",
							}}
						/>

						{/* Info */}
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								maxWidth: "800px",
								alignItems: "space-between",
								justifyContent: "flex-start",
								marginRight: "50px",
							}}
						>
							<Section>
								<Typography
									variant="h1"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Yeah boi
								</Typography>

								<Typography
									variant="body1"
									fontSize={18}
									sx={{
										textTransform: "uppercase",
									}}
								>
									BattleMechs are controlled by pilots known as MechWarriors. Seated in the cockpit of their ‘Mech, MechWarriors connect to
									their machine by wearing a neurohelmet, which reads their brainwaves in order to provide the ‘Mech a sense of balance and
									other necessary functions.
								</Typography>
							</Section>

							<Section>
								<Typography
									variant="h3"
									sx={{
										textTransform: "uppercase",
									}}
								>
									Properties
								</Typography>

								<PropertiesSection>
									{[1, 2, 3, 4, 5, 6].map((b) => (
										<Box
											key={b}
											sx={{
												width: 170,
												height: 170,
												margin: "10px 10px 10px 0px",
												backgroundColor: "transparent",
												border: "2px solid #fff",
											}}
										></Box>
									))}
								</PropertiesSection>
							</Section>
						</Box>

						<Box>
							<FancyButton fancy>Deploy</FancyButton>
						</Box>
					</Box>
				</AssetContainer>
			</Paper>
		</Box>
	)
}

const AssetContainer = styled((props) => <Box {...props} />)(({ theme }) => ({
	display: "flex",
	overflowX: "auto",
	// marginBottom: "10px",
	margin: "76px",
	backgroundColor: theme.palette.background.paper,
}))

const Section = styled((props) => <Box {...props} />)(({ theme }) => ({
	display: "flex",
	overflowX: "auto",
	flexDirection: "column",
	marginBottom: "35px",
}))

const PropertiesSection = styled((props) => <Box {...props} />)(({ theme }) => ({
	display: "flex",
	overflowX: "auto",
	marginBottom: "35px",
	flexWrap: "wrap",
}))
