import SearchIcon from "@mui/icons-material/Search"
import { Box, Skeleton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { SupTokenIcon } from "../../assets"
import SoldOut from "../../assets/images/SoldOutTrimmed.png"
import { useWebsocket } from "../../containers/socket"
import { getStringFromShoutingSnakeCase } from "../../helpers"
import { supFormatter } from "../../helpers/items"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Rarity } from "../../types/enums"
import { StoreItem, StoreItemResponse } from "../../types/store_item"
import { Collection } from "../../types/types"
import { ViewButton } from "../collections/collectionItemCard"
import { rarityTextStyles } from "../profile/profile"

interface StoreItemCardProps {
	storeItemID: string
	collection: Collection
}

export const StoreItemCard: React.VoidFunctionComponent<StoreItemCardProps> = ({ collection, storeItemID }) => {
	const history = useHistory()
	const { subscribe } = useWebsocket()
	const [item, setItem] = useState<StoreItem>()
	const [showPreview, setShowPreview] = useState(false)
	const [priceInSups, setPriceInSups] = useState<string | null>(null)

	useEffect(() => {
		if (!subscribe) return
		return subscribe<StoreItemResponse>(
			HubKey.StoreItemSubscribe,
			(payload) => {
				setItem(payload.item)
				setPriceInSups(payload.price_in_sups)
			},
			{ store_item_id: storeItemID },
		)
	}, [subscribe, storeItemID])

	if (!item || !priceInSups) {
		return <StoreItemCardSkeleton />
	}

	return (
		<Box
			component="button"
			disabled={item.amount_available - item.amount_sold <= 0}
			onClick={() => history.push(`/stores/${collection.slug}/${item.id}`)}
			onMouseOver={() => setShowPreview(true)}
			onMouseLeave={() => setShowPreview(false)}
			onFocus={() => setShowPreview(true)}
			onBlur={() => setShowPreview(false)}
			sx={{
				position: "relative",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "1rem",
				textAlign: "center",
				font: "inherit",
				color: "inherit",
				border: "none",
				outline: "none",
				backgroundColor: "transparent",
				"&:hover .ViewButton, &:focus .ViewButton":
					item.amount_available - item.amount_sold <= 0
						? null
						: {
								borderRadius: "50%",
								backgroundColor: colors.purple,
								transform: "scale(1.6)",
								"& > *": {
									transform: "rotate(0deg)",
								},
						  },
			}}
		>
			<Box
				sx={{
					display: item.amount_available - item.amount_sold <= 0 ? "flex" : "none",
					padding: ".3rem",
					justifyContent: "center",
					zIndex: "1",
					position: "absolute",
					width: "100%",
					transform: "rotate(-15deg) translate(0,-50%)",
					textTransform: "uppercase",
					borderRadius: "2px",
					top: "45%",
				}}
			>
				<Box component="img" src={SoldOut} sx={{ height: "4.5rem" }} />
			</Box>
			<Box
				sx={{
					cursor: item.amount_available - item.amount_sold <= 0 ? "default" : "pointer",
				}}
			>
				<Typography
					variant="h5"
					component="p"
					sx={{
						marginBottom: ".5",
						textTransform: "uppercase",
					}}
				>
					{item.data.template.label}
				</Typography>

				{/* image */}
				<Box
					sx={{
						position: "relative",
					}}
				>
					<Box
						component="img"
						src={item.data.template.image_url}
						alt="Mech image"
						sx={{
							width: "100%",
							marginBottom: ".3rem",
							visibility: item.data.template.card_animation_url ? (showPreview ? "hidden" : "visible") : "visible",
							opacity: item.data.template.card_animation_url ? (showPreview ? 0 : 1) : "visible",
							transition: "all .2s ease-in",
						}}
					/>
					{item.data.template.card_animation_url && (
						<Box
							component="video"
							sx={{
								position: "absolute",
								top: "50%",
								left: "50%",
								width: "120%",
								transform: "translate(-50%, -50%)",
								visibility: showPreview ? "visible" : "hidden",
								opacity: showPreview ? 1 : 0,
								transition: "all .2s ease-in",
							}}
							muted
							autoPlay
							loop
							tabIndex={-1}
							poster={item.data.template.image_url}
						>
							<source src={item.data.template.card_animation_url} type="video/webm"></source>
							<img src={item.data.template.image_url} alt="Mech" />
						</Box>
					)}
				</Box>
				<Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
					<Typography
						variant="body1"
						sx={{
							textTransform: "uppercase",
						}}
					>
						{item.data.template.asset_type}
					</Typography>
					<Typography
						variant="h4"
						sx={{
							marginBottom: ".3rem",
							fontFamily: fonts.bizmoblack,
							fontStyle: "italic",
							letterSpacing: "2px",
							textTransform: "uppercase",
							...rarityTextStyles[item.data.template.tier as Rarity],
						}}
					>
						{getStringFromShoutingSnakeCase(item.data.template.tier)}
					</Typography>
					<Typography
						variant="subtitle1"
						sx={{
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
				<ViewButton
					sx={{
						position: "absolute",
						right: "1rem",
						bottom: "1rem",
					}}
				>
					<SearchIcon />
				</ViewButton>
			</Box>
		</Box>
	)
}

const StoreItemCardSkeleton: React.VoidFunctionComponent = () => {
	return (
		<Box
			sx={{
				position: "relative",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "1rem",
				border: `1px solid ${colors.white}`,
			}}
		>
			<Skeleton
				variant="text"
				width="100%"
				height="1.125rem"
				sx={{
					marginBottom: "1rem",
				}}
			/>

			<Box
				sx={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					marginBottom: ".5rem",
				}}
			>
				{/* image */}
				<Skeleton
					variant="rectangular"
					height={220}
					sx={{
						width: "100%",
					}}
				/>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						width: "100%",
						backgroundColor: "black",
						padding: "10px",
					}}
				>
					<Skeleton variant="text" width={110} height="1rem" />
					<Skeleton variant="rectangular" width={30} height={30} />
				</Box>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "baseline",
						justifyContent: "space-between",
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
						}}
					>
						<Skeleton variant="text" width={90} height=".875rem" />
					</Box>
				</Box>
				<Skeleton variant="text" width={70} height=".75rem" />
			</Box>
			<Skeleton
				variant="text"
				width={130}
				height="0.75rem"
				sx={{
					alignSelf: "end",
					marginBottom: ".5rem",
				}}
			/>
			<Skeleton variant="rectangular" height={45} width="100%" />
		</Box>
	)
}
