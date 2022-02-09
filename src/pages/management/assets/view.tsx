import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Skeleton, Snackbar, styled, Typography } from "@mui/material"
import { Link, useHistory, useParams } from "react-router-dom"
import PlaceholderMech from "../../../assets/images/placeholder_mech.png"
import SupremacyLogo from "../../../assets/images/supremacy-logo.svg"
import { FancyButton } from "../../../components/fancyButton"
import { InputField } from "../../../components/form/inputField"
import { AuthContainer } from "../../../containers"
import { useWebsocket } from "../../../containers/socket"
import { useQuery } from "../../../hooks/useSend"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { Asset } from "../../../types/types"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Navbar } from "../../../components/home/navbar"

export const AssetPage = () => {
	const { tokenID } = useParams<{ tokenID: string }>()
	const { user } = AuthContainer.useContainer()
	const history = useHistory()

	const { subscribe, send } = useWebsocket()
	const [asset, setAsset] = useState<Asset>()
	const [attributes, setAttributes] = useState<Asset[]>([])

	const [submitting, setSubmitting] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string>()

	// query asset
	const { loading, error, payload, query } = useQuery<{ records: Asset[]; total: number }>(HubKey.AssetList, false)

	const [updateModalOpen, setUpdateModalOpen] = useState(false)
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
	}, [user, subscribe, asset?.tokenID, tokenID])

	// Effect: get attributes as assets
	useEffect(() => {
		setAttributes([])
		if (!user || !user.id || !asset) return

		// get list of token ids from asset's attributes
		const tokenIDs = asset.attributes.filter((a) => !!a.token_id).map((aa) => aa.token_id)
		query({
			userID: user.id,
			includedTokenIDs: tokenIDs,
		})
	}, [user, asset, query, tokenID])

	// Effect: set attributes
	useEffect(() => {
		if (error || loading || !payload) return
		setAttributes(payload.records)
	}, [payload, loading, error])

	useEffect(() => {
		if (user) return

		const userTimeout = setTimeout(() => {
			history.push("/")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	return (
		<>
			<Snackbar
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
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
															display: "flex",
															flexDirection: "column",
															marginLeft: "1rem",
														},
													}}
												>
													<FancyButton
														loading={submitting}
														onClick={onDeploy}
														sx={{ fontSize: "1rem", padding: "1rem 1rem", marginBottom: "1rem" }}
														fancy
													>
														Deploy
													</FancyButton>
													<FancyButton
														loading={submitting}
														onClick={() => setUpdateModalOpen(true)}
														sx={{ fontSize: "1rem", padding: "1rem 2.25rem" }}
														fancy
													>
														Edit Name
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
										display: "flex",
										flexDirection: "column",
										"@media (max-width: 1000px)": {
											marginLeft: "0px",
											display: "none",
										},
									}}
								>
									<FancyButton
										loading={submitting}
										onClick={onDeploy}
										sx={{ fontSize: "1rem", padding: "1rem 2.25rem", marginBottom: "1rem" }}
										fancy
									>
										Deploy
									</FancyButton>
									<FancyButton
										loading={submitting}
										onClick={() => setUpdateModalOpen(true)}
										sx={{ fontSize: "1rem", padding: "1rem 2.25rem" }}
										fancy
									>
										Edit Name
									</FancyButton>
								</Box>
							)}
						</Box>
					</AssetContainer>
				</Paper>
			</Box>

			{!!asset && asset.userID === user?.id && !asset.frozenAt && isWarMachine() && (
				<UpdateNameModal isOpen={updateModalOpen} onClose={() => setUpdateModalOpen(false)} asset={asset} userID={user.id} />
			)}
		</>
	)
}

export const UpdateNameModal = (props: { isOpen: boolean; onClose: () => void; asset: Asset; userID: string }) => {
	const { isOpen, onClose, asset, userID } = props
	const { send } = useWebsocket()
	const { control, handleSubmit, setValue } = useForm<{ name: string }>()
	const [success, setSuccess] = useState(false)
	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState<string | null>(null)

	const getName = useCallback(() => {
		let result = ""
		const attr = asset.attributes.filter((a) => a.trait_type === "Name")
		if (attr.length > 0) {
			result = `${attr[0].value}`
		}
		return result
	}, [asset])

	const onSubmit = handleSubmit(async ({ name }) => {
		setLoading(true)
		try {
			await send<Asset>(HubKey.AssetUpdateName, {
				tokenID: asset.tokenID,
				userID,
				name,
			})
			setLoading(false)
			setSuccess(true)
			onClose()
		} catch (e) {
			setSuccess(false)
			setErrorMessage(typeof e === "string" ? e : "Something went wrong, please try again.")
			setLoading(false)
		} finally {
		}
	})

	// set default name
	useEffect(() => {
		setValue("name", getName())
	}, [getName, setValue])

	return (
		<>
			<Snackbar
				open={!!errorMessage}
				autoHideDuration={3000}
				onClose={(_, reason) => {
					if (reason === "clickaway") {
						return
					}

					setErrorMessage("")
				}}
				message={errorMessage}
			>
				<Alert severity="error">{errorMessage}</Alert>
			</Snackbar>

			<Snackbar
				open={!!success}
				autoHideDuration={3000}
				onClose={(_, reason) => {
					if (reason === "clickaway") {
						return
					}

					setSuccess(false)
				}}
			>
				<Alert severity="success">Asset successfully updated</Alert>
			</Snackbar>

			<Dialog onClose={() => onClose()} open={isOpen}>
				<DialogTitle>Update Asset Name</DialogTitle>
				<DialogContent
					sx={{
						backgroundColor: colors.navyBlue,
					}}
				>
					<form onSubmit={onSubmit}>
						<InputField
							name="name"
							label="name"
							type="name"
							control={control}
							rules={{
								required: "Name is required.",
							}}
							placeholder="name"
							style={{ width: "300px" }}
							autoFocus
							disabled={loading}
						/>
						<DialogActions>
							<>
								<Button variant="contained" type="submit" color="primary" disabled={loading}>
									Save
								</Button>
								<Button
									variant="contained"
									type="button"
									color="error"
									disabled={loading}
									onClick={() => {
										onClose()
										setSuccess(false)
										setErrorMessage("")
									}}
								>
									Cancel
								</Button>
							</>
						</DialogActions>
					</form>
				</DialogContent>
			</Dialog>
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