import { Box, Paper, styled, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import PlaceholderMech from "../../../assets/images/placeholder_mech.png"
import { FancyButton } from "../../../components/fancyButton"
import { Navbar } from "../../../components/home/navbar"
import { AuthContainer } from "../../../containers"
import { useWebsocket } from "../../../containers/socket"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { Asset } from "../../../types/types"

export const AssetPage = () => {
	const { tokenID } = useParams<{ tokenID: string }>()
	const { user, hasPermission } = AuthContainer.useContainer()

	const { subscribe } = useWebsocket()
	const [asset, setAsset] = useState<Asset>()

	// Effect: get/set asset via token id
	useEffect(() => {
		if (!user || !user.id) return
		return subscribe<Asset>(
			HubKey.AssetGet,
			(payload) => {
				console.log("th is is pay", payload)
				console.log("th is is user", user)

				if (!payload || !user || !user.id) return
				setAsset(payload)

				console.log("after")
			},
			{
				userID: user.id,
				tokenID: parseInt(tokenID),
			},
		)
	}, [user?.id, subscribe])

	if (!asset) return <></>
	console.log("yoyo", tokenID)
	console.log("this is asset", asset)

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
							"@media (max-width: 1380px)": {
								flexDirection: "column",
							},
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
									{asset.name}
								</Typography>

								<Typography
									variant="body1"
									fontSize={18}
									sx={{
										textTransform: "uppercase",
									}}
								>
									{asset.description}
								</Typography>
							</Section>

							<Section>
								<Typography
									variant="h3"
									color={colors.skyBlue}
									sx={{
										textTransform: "uppercase",
									}}
								>
									Properties
								</Typography>

								<PropertiesSection>
									{asset.attributes
										.filter((a) => {
											return !!a.token_id
										})
										.map((attr, i) => {
											return (
												<Box>
													<Box
														key={i}
														sx={{
															width: 170,
															height: 170,
															margin: "10px 10px 10px 0px",
															backgroundColor: "transparent",
															border: "2px solid #fff",
														}}
													></Box>
													<Typography
														variant="h5"
														// fontSize={18}
														color={colors.neonPink}
														sx={{
															textTransform: "uppercase",
														}}
													>
														{attr.trait_type}
													</Typography>
												</Box>
											)
										})}
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
