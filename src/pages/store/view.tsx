import { useParams } from "react-router-dom"
import { useAuth } from "../../containers/auth"
import { useCallback, useEffect, useState } from "react"
import { SocketState, useWebsocket } from "../../containers/socket"
import { StoreItem } from "../../types/types"

import { colors } from "../../theme"
import { Box, Grid, Paper, Snackbar, styled, TextField, Typography } from "@mui/material"
import { Alert, Skeleton } from "@mui/lab"
import SupremacyLogo from "../../assets/images/supremacy-logo.svg"
import HubKey from "../../keys"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"

export const StoreItemPage = () => {
	const { id } = useParams<{ id: string }>()
	const { user } = useAuth()

	const { subscribe, send, state } = useWebsocket()

	const [storeItem, setStoreItem] = useState<StoreItem>()

	const [errorMessage, setErrorMessage] = useState<string>()

	useEffect(() => {
		if (!user || !subscribe || state !== SocketState.OPEN) return

		return subscribe<StoreItem>(
			HubKey.StoreItemSubscribe,
			(payload) => {
				setStoreItem(payload)
			},
			{ storeItemID: id },
		)
	}, [subscribe, id, state, user])

	// TODO: add error checks notifications etc
	const purchase = useCallback(async () => {
		if (state !== SocketState.OPEN) return
		try {
			await send(HubKey.StorePurchase, {
				storeItemID: id,
			})
		} catch {
		} finally {
		}
	}, [send, id, state])

	if (!storeItem) {
		return <>Loading</>
	}

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
					<StoreItemContainer>
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
							{!storeItem && (
								<Skeleton
									variant="rectangular"
									sx={{
										marginRight: "50px",
									}}
									width={210}
									height={118}
								/>
							)}

							{!!storeItem && (
								<Box
									sx={{
										"@media (max-width: 550px)": {
											maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1.0) 50%, transparent 100%)",
										},
									}}
								>
									<Box
										component="img"
										src={storeItem.image}
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
							{!storeItem && <Skeleton variant="rectangular" width={"100%"} sx={{ minWidth: "200px" }} height={118} />}
							{!!storeItem && (
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
												{storeItem.name}
											</Typography>
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
											{storeItem.description}
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

										<Grid container spacing={2}>
											{storeItem.attributes.map((attr, i) => {
												return (
													<Grid item xs={4} key={`${attr.trait_type}-${attr.value}-${i}`}>
														<TextField label={attr.trait_type} value={attr.value} disabled />
													</Grid>
												)
											})}
										</Grid>
									</Section>
									<FancyButton onClick={() => purchase()}>Purchase</FancyButton>
								</Box>
							)}

							{/*/!* if owner, not frozen and is a war machine *!/*/}
							{/*{!!storeItem && storeItem.userID === user?.id && !storeItem.frozenAt && isWarMachine() && (*/}
							{/*	<Box*/}
							{/*		sx={{*/}
							{/*			"@media (max-width: 1000px)": {*/}
							{/*				marginLeft: "0px",*/}
							{/*				display: "none",*/}
							{/*			},*/}
							{/*		}}*/}
							{/*	>*/}
							{/*		<FancyButton loading={submitting} onClick={onDeploy}*/}
							{/*					 sx={{ fontSize: "1.438rem", padding: "1rem 2.25rem" }} fancy>*/}
							{/*			Deploy*/}
							{/*		</FancyButton>*/}
							{/*	</Box>*/}
							{/*)}*/}
						</Box>
					</StoreItemContainer>
				</Paper>
			</Box>
		</>
	)
}

const StoreItemContainer = styled((props) => <Box {...props} />)(({ theme }) => ({
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
