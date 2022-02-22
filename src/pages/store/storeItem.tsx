import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { Box, Divider, Link, Paper, Typography, useMediaQuery } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { SupTokenIcon } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import { getItemAttributeValue, supFormatter, usdFormatter } from "../../helpers/items"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Attribute, StoreItem } from "../../types/types"
import { PercentageDisplay } from "../profile/profile"
import { Rarity, rarityTextStyles } from "./storeItemCard"

export const StoreItemPage = () => {
	const { store_item_id: id } = useParams<{ store_item_id: string }>()
	const history = useHistory()
	const { subscribe, send, state } = useWebsocket()
	const { displayMessage } = useSnackbar()
	const { user } = useAuth()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	// Store item data
	const [storeItem, setStoreItem] = useState<StoreItem>()
	// const [, setRegularAttributes] = useState<Attribute[]>([])
	const [numberAttributes, setNumberAttributes] = useState<Attribute[]>([])
	// const [, setAssetAttributes] = useState<Attribute[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")

	// Purchase store item
	const [submitting, setSubmitting] = useState(false)
	const purchase = useCallback(async () => {
		if (state !== SocketState.OPEN) return
		setSubmitting(true)
		try {
			await send(HubKey.StorePurchase, {
				storeItemID: id,
			})
			displayMessage(`Successfully purchased 1 ${storeItem?.name}`, "success")
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong. Please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}, [send, id, state, storeItem?.name, displayMessage])

	useEffect(() => {
		if (state !== SocketState.OPEN || !user) return

		setLoading(true)
		try {
			return subscribe<StoreItem>(
				HubKey.StoreItemSubscribe,
				(payload) => {
					if (!payload) return
					let assetAttributes = new Array<Attribute>()
					let numberAttributes = new Array<Attribute>()
					let regularAttributes = new Array<Attribute>()
					payload.attributes.forEach((a) => {
						if (a.token_id) {
							// If is an asset attribute
							assetAttributes.push(a)
						} else if (a.display_type === "number") {
							// If is a number attribute
							numberAttributes.push(a)
						} else {
							// Is a regular attribute
							regularAttributes.push(a)
						}
					})
					// setAssetAttributes(assetAttributes)
					setNumberAttributes(numberAttributes)
					// setRegularAttributes(regularAttributes)
					setStoreItem(payload)
					setLoading(false)
				},
				{ storeItemID: id },
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
					minHeight: "100vh",
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

	if (loading || !storeItem) {
		return <Loading />
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
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
							component="img"
							src={storeItem.image}
							alt="Asset Image"
							sx={{
								width: "100%",
								maxWidth: "350px",
							}}
						/>
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
								{storeItem.name}
							</Typography>
							<Typography
								variant="h4"
								component="p"
								sx={{
									fontFamily: fonts.bizmoblack,
									fontStyle: "italic",
									letterSpacing: "2px",
									textTransform: "uppercase",
									...rarityTextStyles[getItemAttributeValue(storeItem.attributes, "Rarity") as Rarity],
								}}
							>
								{getItemAttributeValue(storeItem.attributes, "Rarity")}
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
									{supFormatter(storeItem.supCost)}
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
											{supFormatter(storeItem.supCost)}
										</Typography>
										<Box
											sx={{
												display: "flex",
												justifyContent: "space-between",
											}}
										>
											<Typography variant="caption" color={colors.darkGrey}>
												({usdFormatter(storeItem.usdCentCost)} USD)
											</Typography>
											<Typography variant="caption">
												Stock: {storeItem.amountAvailable - storeItem.amountSold} / {storeItem.amountAvailable}
											</Typography>
										</Box>
									</Box>
									<FancyButton onClick={() => purchase()} loading={submitting} fancy>
										Purchase Item
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
												key={`${attr.trait_type}-${attr.value}-${i}`}
												displayValue={`${attr.value}`}
												label={attr.trait_type}
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
								{storeItem.description ? (
									<Typography variant="body1">{storeItem.description}</Typography>
								) : (
									<Typography variant="body1" color={colors.darkGrey} fontStyle="italic">
										No description available
									</Typography>
								)}
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
								<Typography variant="body1">Part of the {storeItem.collection.name} collection.</Typography>
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
									{supFormatter(storeItem.supCost)}
								</Typography>
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
									}}
								>

									<Typography variant="caption">
										Stock: {storeItem.amountAvailable - storeItem.amountSold} / {storeItem.amountAvailable}
									</Typography>
								</Box>
							</Box>
							<FancyButton onClick={() => purchase()} size="small" fancy>
								Purchase Item
							</FancyButton>
						</Box>
					</>
				)}
			</Box>
		</Box>
	)
}
