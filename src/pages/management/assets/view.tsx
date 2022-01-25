import { Box, Paper, styled, Typography } from "@mui/material"
import { Link, useParams } from "react-router-dom"
import PlaceholderMech from "../../../assets/images/placeholder_mech.png"
import { FancyButton } from "../../../components/fancyButton"
import { Navbar } from "../../../components/home/navbar"
import { AuthContainer } from "../../../containers"
import { useWebsocket } from "../../../containers/socket"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { Asset } from "../../../types/types"
import SupremacyLogo from "../../../assets/images/supremacy-logo.svg"
import { useState, useEffect } from "react"

export const AssetPage = () => {
	const { tokenID } = useParams<{ tokenID: string }>()
	const { user } = AuthContainer.useContainer()

	const { subscribe } = useWebsocket()
	const [asset, setAsset] = useState<Asset>()

	const isWarMachine = (): boolean => {
		if (!asset) return false
		// loops through asset's attributes checks if it has a trait_type of "Asset Type", and value of "War Machine"
		const wm = asset.attributes.filter((a) => a.trait_type === "Asset Type" && a.value === "War Machine")
		return wm.length > 0
	}

	// Effect: get/set asset via token id
	useEffect(() => {
		if (!user || !user.id) return
		return subscribe<Asset>(
			HubKey.AssetUpdated,
			(payload) => {
				if (!payload || !user || !user.id) return
				setAsset(payload)
			},
			{
				userID: user.id,
				tokenID: parseInt(tokenID),
			},
		)
	}, [user?.id, subscribe, tokenID])

	if (!asset) return <></>

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
					maxWidth: "1000px",
					margin: "0 auto",
					marginBottom: "2rem",
					padding: "2rem",
					borderRadius: 0,
					background: "transparent",
				}}
			>
				<Box
					sx={{
						display: "flex",
						width: "100%",

						justifyContent: "center",
					}}
				>
					<Box
						component="img"
						src={SupremacyLogo}
						alt="Collection Logo"
						sx={{
							width: "306px",
							height: 35,
							marginBottom: "5px",
						}}
					/>
				</Box>
			</Paper>

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
								<Box
									sx={{
										display: "flex",
										marginBottom: "48px",
									}}
								>
									<Typography
										variant="h1"
										sx={{
											textTransform: "uppercase",
											fontSize: "33px",
										}}
									>
										{asset.name}
									</Typography>
									{asset.frozenAt && (
										<Typography
											variant="h1"
											color={colors.skyBlue}
											sx={{
												textTransform: "uppercase",
												fontSize: "33px",
												marginLeft: "1rem",
											}}
										>
											(Frozen)
										</Typography>
									)}
								</Box>

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
										marginBottom: "37px",
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
												<Link key={i} style={{ textDecoration: "none" }} to={`/collections/assets/${attr.token_id}`}>
													<Box
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
														color={colors.neonPink}
														sx={{
															textTransform: "uppercase",
														}}
													>
														{attr.trait_type}
													</Typography>
												</Link>
											)
										})}
								</PropertiesSection>
							</Section>
						</Box>

						{/* if owner, not frozen and is a war machine */}
						{asset.userID === user?.id && !asset.frozenAt && isWarMachine() && (
							<Box
								sx={{
									marginLeft: "100px",
									"@media (max-width: 1380px)": {
										marginLeft: "0px",
									},
								}}
							>
								<FancyButton onClick={() => {}} sx={{ fontSize: 23, padding: "1rem 2.25rem" }} fancy>
									Deploy
								</FancyButton>
							</Box>
						)}
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
