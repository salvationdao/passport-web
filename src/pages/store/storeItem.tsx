import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Link, Paper, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { SupTokenIcon } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"
import { SocketState, useWebsocket } from "../../containers/socket"
import { getStringFromShoutingSnakeCase } from "../../helpers"
import { supFormatter, usdFormatter } from "../../helpers/items"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Rarity } from "../../types/enums"
import { AssetStatPercentageResponse } from "../../types/purchased_item"
import { StoreItem, StoreItemAttibutes, StoreItemResponse } from "../../types/store_item"
import { Attribute, AttributeWithPercentage, Collection } from "../../types/types"
import { PercentageDisplay } from "../profile/percentageDisplay"
import { rarityTextStyles } from "../profile/profile"

export const StoreItemPage = () => {
	const { store_item_id: id, collection_slug } = useParams<{ store_item_id: string; collection_slug: string }>()
	const history = useHistory()
	const { subscribe, state } = useWebsocket()
	const { user } = useAuth()

	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	// Store item data
	const [storeItem, setStoreItem] = useState<StoreItem>()
	const [collection, setCollection] = useState<Collection>()
	const [priceInSups, setPriceInSups] = useState<string | null>(null)
	const [numberAttributes, setNumberAttributes] = useState<AttributeWithPercentage[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")

	// Purchase store item
	const [showPurchaseModal, setShowPurchaseModal] = useState(false)
	useEffect(() => {
		if (state !== SocketState.OPEN || !collection_slug) return
		return subscribe<Collection>(
			HubKey.CollectionUpdated,
			(payload) => {
				if (!payload) return
				setCollection(payload)
			},
			{
				slug: collection_slug,
			},
		)
	}, [collection_slug, subscribe, state])
	useEffect(() => {
		if (state !== SocketState.OPEN || !user) return

		setLoading(true)
		try {
			return subscribe<StoreItemResponse>(
				HubKey.StoreItemSubscribe,
				async (payload) => {
					if (!payload) return
					let assetAttributes = new Array<Attribute>()
					let numberAttributes = new Array<AttributeWithPercentage>()
					let regularAttributes = new Array<Attribute>()
					const att = StoreItemAttibutes(payload.item)
					for (let a of att) {
						if (a.asset_hash) {
							// If is an asset attribute
							assetAttributes.push(a)
						} else if (a.display_type === "number") {
							// If is a number attribute
							const resp = await fetch(
								`${window.location.protocol}//${window.location.hostname}:8084/api/stat/mech?stat=${a.identifier}&value=${a.value}`,
							)
							if (!resp.ok || resp.status !== 200) {
								console.warn(`Could not fetch percentile data for ${a.identifier} (${a.label})`)
								continue
							}
							const body = (await resp.json()) as AssetStatPercentageResponse
							numberAttributes.push({
								...a,
								...body,
							})
						} else {
							// Is a regular attribute
							regularAttributes.push(a)
						}
					}
					// setAssetAttributes(assetAttributes)
					setNumberAttributes(numberAttributes)
					// setRegularAttributes(regularAttributes)
					setStoreItem(payload.item)
					setPriceInSups(payload.price_in_sups)
					setLoading(false)
				},
				{ store_item_id: id },
			)
		} catch (e) {
			setError(typeof e === "string" ? e : "Something went wrong while fetching store item data. Please try again.")
		}
	}, [subscribe, id, state, user])

	if (error) {
		return (
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100%",
				}}
			>
				<Navbar
					sx={{
						marginBottom: "2rem",
					}}
				/>
				<Typography variant="subtitle1">{error}</Typography>
			</Box>
		)
	}

	if (loading || !storeItem || !priceInSups || !collection) {
		return <Loading />
	}

	return (
		<>
			<PurchaseStoreItemModal
				open={showPurchaseModal}
				onClose={() => setShowPurchaseModal(false)}
				storeItem={storeItem}
				collection_slug={collection_slug}
			/>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100%",
				}}
			>
				<Navbar
					sx={{
						marginBottom: "2rem",
					}}
				/>
				<Box
					sx={{
						flex: 1,
						display: "flex",
						width: "100%",
						maxWidth: "1700px",
						margin: "0 auto",
						marginBottom: "3rem",
						padding: "0 3rem",
						"@media (max-width: 1000px)": {
							flexDirection: "column",
						},
					}}
				>
					<Paper
						sx={{
							flexGrow: 1,
							display: "flex",
							flexDirection: "column",
							padding: "2rem",
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						}}
					>
						<Link
							variant="h5"
							underline="hover"
							sx={{
								alignSelf: "start",
								display: "flex",
								alignItems: "center",
								marginBottom: "1rem",
								textTransform: "uppercase",
							}}
							color={colors.white}
							component={"button"}
							onClick={() => history.goBack()}
						>
							<ChevronLeftIcon />
							Go Back
						</Link>
						<Box
							sx={{
								display: "flex",
								flexWrap: "wrap",
								gap: "1rem",
								justifyContent: "center",
							}}
						>
							<Box
								sx={{
									position: "relative",
									width: "100%",
									maxWidth: "350px",
								}}
							>
								<Box
									component="img"
									src={storeItem.data.template.image_url}
									alt="Store Item Image"
									sx={{
										width: "100%",
									}}
								/>
								<Box
									component="img"
									src={storeItem.data.template.avatar_url}
									alt="Store Item avatar"
									sx={{
										position: "absolute",
										bottom: "1rem",
										right: "1rem",
										height: "60px",
										width: "60px",
										objectFit: "contain",
										border: `1px solid ${colors.darkGrey}`,
										backgroundColor: colors.darkGrey,
									}}
								/>
							</Box>
							<Box
								sx={{
									flex: 1,
									flexBasis: "400px",
									display: "flex",
									flexDirection: "column",
								}}
							>
								<Typography
									variant="h2"
									component="h1"
									sx={{
										marginBottom: ".3rem",
										textTransform: "uppercase",
									}}
								>
									{storeItem.data.template.label}
								</Typography>
								<Typography
									variant="h4"
									component="p"
									sx={{
										fontFamily: fonts.bizmoblack,
										fontStyle: "italic",
										letterSpacing: "2px",
										textTransform: "uppercase",
										...rarityTextStyles[storeItem.data.template.tier as Rarity],
									}}
								>
									{getStringFromShoutingSnakeCase(storeItem.data.template.tier)}
								</Typography>
								<Box
									sx={{
										display: "flex",
										alignItems: "baseline",
										gap: ".5rem",
									}}
								>
									<Typography
										variant="subtitle1"
										sx={{
											display: "flex",
											justifyContent: "center",
											alignItems: "center",
											letterSpacing: "1px",
										}}
									>
										<Box
											component={SupTokenIcon}
											sx={{
												height: "1rem",
												marginRight: ".2rem",
											}}
										/>
										{supFormatter(priceInSups)}
									</Typography>
								</Box>
								<Divider
									sx={{
										margin: ".5rem 0",
										marginBottom: "1rem",
									}}
								/>
								<Box
									sx={{
										alignSelf: isWiderThan1000px ? "start" : "unset",
										marginBottom: "1rem",
										padding: "1rem",
										borderRadius: ".5rem",
										backgroundColor: "rgba(255, 255, 255, 0.3)",
									}}
								>
									<Typography
										variant="h4"
										component="p"
										sx={{
											marginBottom: ".5rem",
											textTransform: "uppercase",
										}}
									>
										Sale ends in
									</Typography>
									<Box
										sx={{
											display: "flex",
											"& > *:not(:last-child)": {
												marginRight: "1rem",
											},
										}}
									>
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
											}}
										>
											<Typography variant="h3" component="p" color={colors.skyBlue}>
												--
											</Typography>
											<Typography
												variant="subtitle2"
												color={colors.darkGrey}
												sx={{
													textTransform: "uppercase",
												}}
											>
												Days
											</Typography>
										</Box>
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
											}}
										>
											<Typography variant="h3" component="p" color={colors.skyBlue}>
												--
											</Typography>
											<Typography
												variant="subtitle2"
												color={colors.darkGrey}
												sx={{
													textTransform: "uppercase",
												}}
											>
												Hours
											</Typography>
										</Box>
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
											}}
										>
											<Typography variant="h3" component="p" color={colors.skyBlue}>
												--
											</Typography>
											<Typography
												variant="subtitle2"
												color={colors.darkGrey}
												sx={{
													textTransform: "uppercase",
												}}
											>
												Minutes
											</Typography>
										</Box>
										<Box
											sx={{
												display: "flex",
												flexDirection: "column",
											}}
										>
											<Typography variant="h3" component="p" color={colors.skyBlue}>
												--
											</Typography>
											<Typography
												variant="subtitle2"
												color={colors.darkGrey}
												sx={{
													textTransform: "uppercase",
												}}
											>
												Seconds
											</Typography>
										</Box>
									</Box>
								</Box>

								{!isWiderThan1000px && (
									<>
										<Box
											sx={{
												marginBottom: "1rem",
											}}
										>
											<Typography
												variant="h2"
												sx={{
													display: "flex",
													alignItems: "center",
													marginBottom: ".5rem",
													letterSpacing: "1px",
												}}
											>
												<Box
													component={SupTokenIcon}
													sx={{
														height: "2rem",
														marginRight: ".5rem",
													}}
												/>
												{supFormatter(priceInSups)}
											</Typography>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
												}}
											>
												<Typography variant="caption" color={colors.darkGrey}>
													({usdFormatter(storeItem.usd_cent_cost)} USD)
												</Typography>
												<Typography variant="caption">
													Stock: {storeItem.amount_available - storeItem.amount_sold} / {storeItem.amount_available}
												</Typography>
											</Box>
										</Box>
										<FancyButton
											disabled={storeItem.amount_available - storeItem.amount_sold <= 0}
											onClick={() => setShowPurchaseModal(true)}
										>
											{storeItem.amount_available - storeItem.amount_sold <= 0 ? "Sold out" : "Purchase Item"}
										</FancyButton>
									</>
								)}
							</Box>
						</Box>
						<Box
							sx={{
								display: "flex",
								flexWrap: "wrap",
								gap: "1rem",
								justifyContent: "center",
							}}
						>
							<Box
								sx={{
									flex: 1,
									flexBasis: "400px",
								}}
							>
								<Typography
									variant="subtitle1"
									color={colors.neonPink}
									sx={{
										textTransform: "uppercase",
										marginBottom: ".5rem",
									}}
								>
									Properties
								</Typography>
								<Box
									sx={{
										display: "grid",
										gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
										gap: "1rem",
									}}
								>
									{numberAttributes &&
										numberAttributes.map((attr, i) => {
											return (
												<PercentageDisplay
													key={`${attr.label}-${attr.value}-${i}`}
													displayValue={`${attr.value}`}
													label={attr.label}
													percentage={attr.percentage}
												/>
											)
										})}
								</Box>
							</Box>
							<Box
								sx={{
									flex: 1,
									flexBasis: "400px",
									"& > *:not(:last-child)": {
										marginBottom: "1rem",
									},
								}}
							>
								<Box>
									<Typography
										variant="subtitle1"
										color={colors.neonPink}
										sx={{
											textTransform: "uppercase",
										}}
									>
										Description
									</Typography>
									<Divider
										sx={{
											margin: ".5rem 0",
										}}
									/>
									<Typography variant="body1">{storeItem.data.template.label}</Typography>
								</Box>
								<Box>
									<Typography
										variant="subtitle1"
										color={colors.neonPink}
										sx={{
											textTransform: "uppercase",
										}}
									>
										Info
									</Typography>
									<Divider
										sx={{
											margin: ".5rem 0",
										}}
									/>
									<Typography variant="body1">Part of the {collection.name} collection.</Typography>
								</Box>
							</Box>
						</Box>
					</Paper>
					{isWiderThan1000px && (
						<>
							<Box minHeight="2rem" minWidth="2rem" />
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									width: "100%",
									maxWidth: "340px",
									padding: "2rem 0",
									"& > *:not(:last-child)": {
										marginBottom: "1rem",
									},
									"@media (max-width: 1000px)": {
										alignSelf: "center",
										maxWidth: "600px",
									},
								}}
							>
								<Box>
									<Typography
										variant="h2"
										sx={{
											display: "flex",
											alignItems: "center",
											marginBottom: ".5rem",
											letterSpacing: "1px",
										}}
									>
										<Box
											component={SupTokenIcon}
											sx={{
												height: "2rem",
												marginRight: ".5rem",
											}}
										/>
										{supFormatter(priceInSups)}
									</Typography>
									<Box
										sx={{
											display: "flex",
											justifyContent: "center",
										}}
									>
										<Typography variant="caption">
											Stock: {storeItem.amount_available - storeItem.amount_sold} / {storeItem.amount_available}
										</Typography>
									</Box>
								</Box>
								<FancyButton disabled={storeItem.amount_available - storeItem.amount_sold <= 0} onClick={() => setShowPurchaseModal(true)}>
									{storeItem.amount_available - storeItem.amount_sold <= 0 ? "Sold out" : "Purchase Item"}
								</FancyButton>
							</Box>
						</>
					)}
				</Box>
			</Box>
		</>
	)
}

const PurchaseStoreItemModal = (props: { open: boolean; onClose: () => void; storeItem: StoreItem; collection_slug: string }) => {
	const { open, onClose, storeItem, collection_slug } = props
	const { send, state } = useWebsocket()
	const [loading, setLoading] = useState(false)
	const [purchasedOpen, setPurchasedOpen] = useState(false)
	const [errorOpen, setErrorOpen] = useState(false)
	const [errorString, setErrorString] = useState<string>("")

	const theme = useTheme()
	const history = useHistory()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	const purchase = useCallback(async () => {
		if (state !== SocketState.OPEN) return
		setLoading(true)
		try {
			await send(HubKey.StorePurchase, {
				store_item_id: storeItem.id,
			})
			onClose()
			setPurchasedOpen(true)
		} catch (e) {
			if (typeof e === "string") {
				setErrorString(e)
			}
			setErrorOpen(true)
			onClose()
		} finally {
			setLoading(false)
		}
	}, [send, state, storeItem, onClose])

	return (
		<Box>
			<Dialog onClose={() => onClose()} open={open}>
				<Box sx={{ padding: "1rem", border: `4px solid ${colors.darkNavyBackground}` }}>
					<DialogTitle>
						<Typography variant="h2" sx={{ textAlign: "center" }}>
							Confirm Purchase
						</Typography>
					</DialogTitle>
					<DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
						<Typography variant="body1" sx={{ textAlign: "center", lineHeight: "1.3", fontSize: "120%" }}>
							Please confirm purchase of{" "}
							<Box component="span" sx={{ color: theme.palette.primary.main }}>
								{storeItem.data.template.label}
							</Box>
							<Box component="span">?</Box>
						</Typography>
					</DialogContent>
					<DialogActions sx={{ display: "flex", justifyContent: "center" }}>
						<Button
							size="large"
							variant="contained"
							type="submit"
							color="primary"
							disabled={loading || storeItem.amount_available - storeItem.amount_sold === 0}
							onClick={() => purchase()}
							sx={{ marginRight: "1rem" }}
						>
							Purchase
						</Button>
						<Button
							size="large"
							variant="contained"
							type="button"
							color="error"
							disabled={loading}
							onClick={() => {
								onClose()
							}}
						>
							Cancel
						</Button>
					</DialogActions>
				</Box>
			</Dialog>

			<Dialog open={purchasedOpen} onClose={() => setPurchasedOpen(false)}>
				<Box sx={{ padding: "1rem", border: `4px solid ${colors.darkNavyBackground}` }}>
					<DialogTitle>
						<Typography variant="h2" sx={{ textAlign: "center" }}>
							Confirmation of Purchase
						</Typography>
					</DialogTitle>
					<DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
						<Box
							component="img"
							src={storeItem.data.template.image_url}
							alt="Asset Image"
							sx={{
								display: isWiderThan1000px ? "block" : "none",
								width: "100%",
								maxWidth: "350px",
								marginBottom: "1rem",
							}}
						/>
						<Typography variant="h3" sx={{ textAlign: "center", lineHeight: "1.3" }}>
							Congratulations on your purchase of{" "}
							<Box component="span" sx={{ color: theme.palette.primary.main }}>
								{storeItem.data.template.label}
							</Box>
							<Box component="span">!</Box>
						</Typography>
					</DialogContent>
					<DialogActions sx={{ display: "flex", justifyContent: "center" }}>
						<Button
							size="large"
							variant="contained"
							type="button"
							color="error"
							disabled={loading}
							onClick={() => {
								history.push(`/stores/${collection_slug}`)
								setPurchasedOpen(false)
							}}
						>
							Close
						</Button>
					</DialogActions>
				</Box>
			</Dialog>

			<Dialog open={errorOpen} onClose={() => setErrorOpen(false)}>
				<Box sx={{ border: `4px solid ${colors.darkNavyBackground}`, padding: ".5rem", maxWidth: "500px" }}>
					<DialogTitle sx={{ display: "flex", width: "100%", alignItems: "center" }}>
						<ErrorOutlineIcon sx={{ fontSize: "2.5rem" }} color="error" />

						<Typography variant="h2" sx={{ padding: "1rem" }}>
							Error
						</Typography>
					</DialogTitle>
					<DialogContent>
						<Typography>{errorString ? errorString : "Something went wrong, please try again."}</Typography>
					</DialogContent>
					<DialogActions>
						<Button size="large" variant="contained" onClick={() => setErrorOpen(false)}>
							Close
						</Button>
					</DialogActions>
				</Box>
			</Dialog>
		</Box>
	)
}
