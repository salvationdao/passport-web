import { Box, Paper, Skeleton, styled, Typography, Link as MuiLink, Snackbar, Alert } from "@mui/material"
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
import { GradientCircleThing } from "../../../components/home/gradientCircleThing"
import XSYNWordmarkImage from "../../../assets/images/XSYN Wordmark White.png"

export const AssetPage = () => {
	const { tokenID } = useParams<{ tokenID: string }>()
	const { user } = AuthContainer.useContainer()
	const history = useHistory()

	const { subscribe, send } = useWebsocket()
	const [asset, setAsset] = useState<Asset>()
	const [attributes, setAttributes] = useState<Asset[]>([])

	const [submitting, setSubmitting] = useState(false)

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
			console.log("err", e)

			setSubmitting(false)
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setSubmitting(false)
		}
	}

	// Effect: get/set asset via token id
	useEffect(() => {
		if (!user || !user.id) return
		return subscribe<Asset>(
			HubKey.AssetUpdated,
			(payload) => {
				if (!payload) return
				setAsset(payload)
			},
			{
				tokenID: parseInt(tokenID),
			},
		)
	}, [user?.id, subscribe, asset?.tokenID])

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

		const userTimeout = setTimeout(() => {
			history.push("/")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	console.log("this is error message", !!errorMessage)

	return (
		<>
			<Snackbar
				open={!!errorMessage}
				autoHideDuration={6000}
				onClose={(_, reason) => {
					if (reason === "clickaway") {
						return
					}

					setErrorMessage(undefined)
				}}
				message={errorMessage}
			>
				<Alert severity="error">{errorMessage}</Alert>
			</Snackbar>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
					overflowX: "hidden",
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
							overflow: "hidden",
						}}
					>
						<Box
							component="img"
							src={SupremacyLogo}
							alt="Collection Logo"
							sx={{
								height: 35,
								marginBottom: 5,
								"@media (max-width: 550px)": {
									height: 30,
								},
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
						maxWidth: "1803px",
						margin: "0 auto",
						borderRadius: 0,
						backgroundColor: "transparent",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						overflow: "hidden",
					}}
				>
					<AssetContainer>
						<Box
							sx={{
								width: "100%",
								maxWidth: "1768px",
								overflow: "hidden",
								margin: "50px",
								borderRadius: 0,
								backgroundColor: "transparent",
								display: "flex",
								"@media (max-width: 550px)": {
									flexDirection: "column",
									margin: 0,
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
									sx={{
										"@media (max-width: 550px)": {
											maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1.0) 50%, transparent 100%)",
										},
									}}
								>
									<Box
										component="img"
										src={PlaceholderMech}
										alt="placeholder"
										sx={{
											marginRight: "50px",
											"@media (max-width: 1300px)": {
												height: "400px",
											},
											"@media (max-width: 1000px)": {
												height: "300px",
											},
											"@media (max-width: 550px)": {
												height: "auto",
												margin: 0,
											},
											"@media (max-width: 470px)": {
												width: "100%",
											},
										}}
									/>
								</Box>
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
										"@media (max-width: 550px)": {
											marginRight: 0,
										},
									}}
								>
									<Section
										sx={{
											"@media (max-width: 550px)": {
												marginTop: "-120px",
												justifyContent: "center",
											},
										}}
									>
										<Box
											sx={{
												display: "flex",
												alignContent: "center",
												marginBottom: "48px",
												alignItems: "center",
												"@media (max-width: 550px)": {
													textAlign: "center",
													flexDirection: "column",
												},
											}}
										>
											<Typography
												variant="h1"
												sx={{
													textTransform: "uppercase",
													fontSize: "2rem",
													zIndex: 3,
												}}
											>
												{asset.name}
											</Typography>
											{/* if owner, not frozen and is a war machine */}

											{!!asset && asset.userID === user?.id && !asset.frozenAt && isWarMachine() && (
												<Box
													sx={{
														marginLeft: "100px",
														display: "none",
														"@media (max-width: 1000px)": {
															marginTop: "5px",
															display: "block",
															marginLeft: "0px",
														},
													}}
												>
													<FancyButton
														loading={submitting}
														onClick={onDeploy}
														sx={{ fontSize: "1.438rem", padding: "1rem 1rem" }}
														fancy
													>
														Deploy
													</FancyButton>
												</Box>
											)}
											{asset.frozenAt && (
												<Typography
													variant="h3"
													color={colors.skyBlue}
													sx={{
														textTransform: "uppercase",
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
												"@media (max-width: 550px)": {
													display: "none",
												},
											}}
										>
											{asset.description}
										</Typography>
									</Section>

									<Section
										sx={{
											"@media (max-width: 550px)": {
												margin: "0 40px 0 40px",
											},
										}}
									>
										<Typography
											variant="h3"
											color={colors.skyBlue}
											sx={{
												textTransform: "uppercase",
												marginBottom: "30px",
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
																"@media (max-width: 550px)": {
																	width: 140,
																	height: 140,
																},
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
							{!!asset && asset.userID === user?.id && !asset.frozenAt && isWarMachine() && (
								<Box
									sx={{
										"@media (max-width: 1000px)": {
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

			<Box
				sx={{
					overflow: "hidden",
					position: "relative",
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
					width: "100%",
					maxWidth: "1700px",
					margin: "0 auto",
					padding: "4rem 3rem",
					paddingBottom: "1rem",
				}}
			>
				<GradientCircleThing
					innerOpacity={0.6}
					sx={{
						zIndex: -1,
						position: "absolute",
						left: "50%",
						bottom: "-30rem",
						transform: "translate(-50%, 0)",
					}}
				/>
				<Box
					sx={{
						flex: 1,
					}}
				/>
				<Box
					component="img"
					src={XSYNWordmarkImage}
					alt="XSYN Wordmark"
					sx={{
						alignSelf: "center",
						marginBottom: "3rem",
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
					<MuiLink href="/privacy-policy" underline="none" color="white">
						Privacy Policy
					</MuiLink>
					<MuiLink href="/terms-and-conditions" underline="none" color="white">
						Terms And Conditions
					</MuiLink>
				</Box>
			</Box>
		</>
	)
}

const AssetContainer = styled((props) => <Box {...props} />)(({ theme }) => ({
	display: "flex",
	overflowX: "hidden",
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
