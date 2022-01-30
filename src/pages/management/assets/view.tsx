import { Box, Paper, Skeleton, styled, Typography } from "@mui/material"
import { Link, useHistory, useParams } from "react-router-dom"
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
import { Loading } from "../../../components/loading"

export const AssetPage = () => {
	const { tokenID } = useParams<{ tokenID: string }>()
	const { user } = AuthContainer.useContainer()
	const history = useHistory()

	const { subscribe, send } = useWebsocket()
	const [asset, setAsset] = useState<Asset>()
	const [attributes, setAttributes] = useState<Asset[]>([])

	const [submitting, setSubmitting] = useState(false)
	const [loading, setLoading] = useState(false)

	const [frozen, setFrozen] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string>()

	const isWarMachine = (): boolean => {
		if (!asset) return false
		// loops through asset's attributes checks if it has a trait_type of "Asset Type", and value of "War Machine"
		const wm = asset.attributes.filter((a) => a.trait_type === "Asset Type" && a.value === "War Machine")
		return wm.length > 0
	}

	const onDeploy = async () => {
		if (!tokenID) return
		setSubmitting(true)
		try {
			await send(HubKey.AssetJoinQue, { AssetTokenID: parseInt(tokenID) })
			setSubmitting(false)
			setErrorMessage(undefined)
		} catch (e) {
			setSubmitting(false)
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setSubmitting(false)
			setFrozen(true)
			setErrorMessage(undefined)
		}
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

	// Effect: get/set attributes as assets
	useEffect(() => {
		setAttributes([])
		if (!user || !user.id || !asset) return
		// get list of token ids from asset's attributes
		const tokenIDs = asset.attributes.filter((a) => !!a.token_id).map((aa) => aa.token_id)
		return subscribe<{ records: Asset[]; total: number }>(
			HubKey.AssetListUpdated,
			(payload) => {
				if (!payload) return
				setAttributes(payload.records)
			},
			{
				userID: user.id,
				includedTokenIDs: tokenIDs,
			},
		)
	}, [user?.id, asset?.tokenID, subscribe, tokenID])

	useEffect(() => {
		if (user) return
		history.push("/login")
	}, [user])

	// if (!asset || !attributes) return <Skeleton variant="rectangular" width={210} height={118} />

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
						flexDirection: "column",
						alignContent: "center",
						justifyContent: "center",
						alignItems: "center",
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

					<Typography
						variant="h1"
						sx={{
							textTransform: "uppercase",
							fontSize: "2rem",
							color: colors.neonPink,
						}}
					>
						Collection
					</Typography>
				</Box>
			</Paper>

			<Paper
				sx={{
					maxWidth: "1768px",
					margin: "0 auto",
					borderRadius: 0,
					backgroundColor: "transparent",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",

					"@media (max-width: 1100px)": {
						flexDirection: "column",
						margin: "0 ",
					},
				}}
			>
				<AssetContainer>
					<Box
						sx={{
							width: "100%",
							maxWidth: "1768px",
							overflowY: "hidden",
							margin: "50px",
							borderRadius: 0,
							backgroundColor: "transparent",
							display: "flex",
							"@media (max-width: 1100px)": {
								flexDirection: "column",
								margin: "0",
							},
						}}
					>
						{/* image */}
						{!asset && (
							<Skeleton
								variant="rectangular"
								sx={{
									marginRight: "50px",
								}}
								width={210}
								height={118}
							/>
						)}

						{!!asset && (
							<Box
								component="img"
								src={PlaceholderMech}
								alt="placeholder"
								sx={{
									marginRight: "50px",
									"@media (max-width: 1100px)": {
										// height: "10%",
										marginRight: "0",
									},
								}}
							/>
						)}

						{/* Info */}
						{!asset && <Skeleton variant="rectangular" width={"100%"} sx={{ minWidth: "200px" }} height={118} />}
						{!!asset && (
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									maxWidth: "800px",
									alignItems: "space-between",
									justifyContent: "flex-start",
									marginRight: "50px",
									"@media (max-width: 1100px)": {
										marginLeft: "50px",
									},
								}}
							>
								<Section
									sx={{
										"@media (max-width: 1100px)": {
											marginTop: "-120px",
										},
									}}
								>
									<Box
										sx={{
											display: "flex",
											marginBottom: "48px",
											"@media (max-width: 1380px)": {
												flexDirection: "column",
												textAlign: "center",
											},
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
										{/* if owner, not frozen and is a war machine */}

										{!!asset && asset.userID === user?.id && !asset.frozenAt && !frozen && isWarMachine() && (
											<Box
												sx={{
													marginLeft: "100px",
													display: "none",
													"@media (max-width: 1380px)": {
														display: "block",
														marginLeft: "0px",
													},
												}}
											>
												<FancyButton
													loading={submitting}
													onClick={onDeploy}
													sx={{ fontSize: "1.438rem", padding: "1rem 2.25rem" }}
													fancy
												>
													Deploy
												</FancyButton>
											</Box>
										)}
										{(asset.frozenAt || frozen) && (
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
										{attributes.map((attr, i) => {
											return (
												<Link key={i} style={{ textDecoration: "none" }} to={`/collections/assets/${attr.tokenID}`}>
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
														{attr.name}
													</Typography>
												</Link>
											)
										})}
									</PropertiesSection>
								</Section>
							</Box>
						)}

						{/* if owner, not frozen and is a war machine */}
						{!!asset && asset.userID === user?.id && !asset.frozenAt && !frozen && isWarMachine() && (
							<Box
								sx={{
									marginLeft: "100px",
									"@media (max-width: 1380px)": {
										marginLeft: "0px",
										display: "none",
									},
								}}
							>
								<FancyButton loading={submitting} onClick={onDeploy} sx={{ fontSize: "1.438rem", padding: "1rem 2.25rem" }} fancy>
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
	// margin: "76px",
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
