import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { Box, Link, Paper, TextField, Typography } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { PlaceholderMechImagePath, SupremacyLogoImagePath, SupTokenIconPath } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import { getItemAttributeValue, supFormatter } from "../../helpers/items"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Attribute, StoreItem } from "../../types/types"
import { AssetBox, PercentageDisplay } from "../collections/collectionItem"
import { Rarity, rarityTextStyles } from "./storeItemCard"

export const StoreItemPage = () => {
	const { store_item_id: id } = useParams<{ store_item_id: string }>()
	const history = useHistory()
	const { displayMessage } = useSnackbar()
	const { user } = useAuth()

	const { subscribe, send, state } = useWebsocket()
	const [storeItem, setStoreItem] = useState<StoreItem>()

	// Attributes
	const [regularAttributes, setRegularAttributes] = useState<Attribute[]>()
	const [numberAttributes, setNumberAttributes] = useState<Attribute[]>()
	const [assetAttributes, setAssetAttributes] = useState<Attribute[]>()

	// Purchase asset
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
		if (!subscribe || state !== SocketState.OPEN || !user) return

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
				setAssetAttributes(assetAttributes.length > 0 ? assetAttributes : undefined)
				setNumberAttributes(numberAttributes.length > 0 ? numberAttributes : undefined)
				setRegularAttributes(regularAttributes.length > 0 ? regularAttributes : undefined)
				setStoreItem(payload)
			},
			{ storeItemID: id },
		)
	}, [subscribe, id, state, user])

	if (!storeItem) {
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
					display: "flex",
					width: "100%",
					flexDirection: "column",
					alignItems: "center",
					marginBottom: "2rem",
					padding: "0 2rem",
				}}
			>
				<Box
					component="img"
					src={SupremacyLogoImagePath}
					alt="Collection Logo"
					sx={{
						width: "100%",
						maxWidth: "300px",
						padding: ".5rem",
					}}
				/>
				<Typography
					variant="h1"
					sx={{
						textTransform: "uppercase",
						fontSize: "1.6rem",
						color: colors.neonPink,
					}}
				>
					Collection
				</Typography>
			</Box>

			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					width: "100%",
					maxWidth: "1700px",
					margin: "0 auto",
					marginBottom: "3rem",
					padding: "0 3rem",
					borderRadius: 0,
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

				<Paper
					sx={{
						display: "flex",
						padding: "2rem",
						borderRadius: 0,
						"@media (max-width: 1000px)": {
							flexDirection: "column",
						},
					}}
				>
					{/* Image */}
					<Box
						component="img"
						src={PlaceholderMechImagePath}
						alt="Mech image"
						sx={{
							alignSelf: "start",
							flex: 1,
							width: "100%",
							minWidth: 0,
							// maskImage: "linear-gradient(to bottom, rgba(0, 0, 0, 1.0) 50%, transparent 100%)",
							"@media (max-width: 1000px)": {
								alignSelf: "center",
								flex: "unset",
								maxWidth: "300px",
							},
						}}
					/>
					<Box
						sx={{
							minWidth: "2rem",
							minHeight: "2rem",
						}}
					/>

					{/* Info */}
					<Box
						sx={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
						}}
					>
						<Box
							sx={{
								marginBottom: "1.5rem",
							}}
						>
							<Typography
								variant="h1"
								sx={{
									textTransform: "uppercase",
									fontSize: "2rem",
								}}
							>
								{storeItem.name}
							</Typography>
							<Typography
								variant="h6"
								component="p"
								sx={{
									...rarityTextStyles[getItemAttributeValue(storeItem.attributes, "Rarity") as Rarity],
								}}
							>
								{getItemAttributeValue(storeItem.attributes, "Rarity")}
							</Typography>
							<Typography variant="body1">{storeItem.description}</Typography>
						</Box>

						<Box
							sx={{
								marginBottom: "1.5rem",
							}}
						>
							<Typography
								variant="h6"
								component="p"
								color={colors.darkGrey}
								sx={{
									marginBottom: "1rem",
									textTransform: "uppercase",
								}}
							>
								Properties
							</Typography>

							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
									gap: "1rem",
								}}
							>
								{regularAttributes &&
									regularAttributes.map((attr, i) => {
										return (
											<TextField
												key={`${attr.trait_type}-${attr.value}-${i}`}
												label={attr.trait_type}
												value={attr.value}
												InputProps={{
													sx: {
														borderRadius: 0,
													},
												}}
												disabled
											/>
										)
									})}
							</Box>
						</Box>

						<Box
							sx={{
								marginBottom: "1.5rem",
							}}
						>
							<Typography
								variant="h6"
								component="p"
								color={colors.darkGrey}
								sx={{
									marginBottom: "1rem",
									textTransform: "uppercase",
								}}
							>
								Stats
							</Typography>

							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
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
								marginBottom: "1.5rem",
							}}
						>
							<Typography
								variant="h6"
								component="p"
								color={colors.darkGrey}
								sx={{
									marginBottom: "1rem",
									textTransform: "uppercase",
								}}
							>
								Equipment
							</Typography>

							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
									gap: "1rem",
								}}
							>
								{assetAttributes && assetAttributes.map((a) => <AssetBox tokenID={a.token_id!} label={a.trait_type} />)}
								<AssetBox tokenID={30} label="Shield" />
								<AssetBox tokenID={30} label="Shield" />
								<AssetBox tokenID={30} label="Shield" />
								<AssetBox tokenID={30} label="Shield" />
							</Box>
						</Box>

						<Box flex="1" />

						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								marginBottom: "1rem",
							}}
						>
							<Box
								component="img"
								src={SupTokenIconPath}
								alt="Currency Logo"
								sx={{
									height: "2rem",
									marginRight: ".3rem",
								}}
							/>
							<Typography variant="h2" component="p">
								{supFormatter(storeItem.supCost)}
								<Typography
									sx={{
										marginLeft: ".5rem",
										whiteSpace: "nowrap",
									}}
									variant="caption"
									component="span"
								>
									In stock: {storeItem.amountAvailable - storeItem.amountSold}
									<Box
										component="span"
										sx={{
											marginLeft: ".2rem",
											color: colors.darkGrey,
										}}
									>
										(out of {storeItem.amountAvailable})
									</Box>
								</Typography>
							</Typography>
						</Box>

						<FancyButton onClick={() => purchase()} loading={submitting}>
							Purchase
						</FancyButton>
					</Box>
				</Paper>
			</Box>
		</Box>
	)
}
