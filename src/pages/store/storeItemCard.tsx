import SearchIcon from "@mui/icons-material/Search"
import { Box, Skeleton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { SupTokenIcon } from "../../assets"
import { useWebsocket } from "../../containers/socket"
import { getItemAttributeValue, supFormatter } from "../../helpers/items"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { StoreItem } from "../../types/types"
import { ViewButton } from "../collections/collectionItemCard"

export type Rarity = "Common" | "Rare" | "Legendary"

export const rarityTextStyles: { [key in Rarity]: any } = {
	Common: {
		color: colors.rarity.common,
	},
	Rare: {
		color: colors.rarity.rare,
	},
	Legendary: {
		color: colors.rarity.legendary,
		textShadow: `0 0 2px ${colors.rarity.legendary}`,
	},
}

interface StoreItemCardProps {
	storeItemID: string
}

export const StoreItemCard: React.VoidFunctionComponent<StoreItemCardProps> = ({ storeItemID }) => {
	const { subscribe } = useWebsocket()
	const [item, setItem] = useState<StoreItem>()
	const history = useHistory()

	useEffect(() => {
		if (!subscribe) return
		return subscribe<StoreItem>(
			HubKey.StoreItemSubscribe,
			(payload) => {
				setItem(payload)
			},
			{ storeItemID },
		)
	}, [subscribe, storeItemID])

	if (!item) {
		return <StoreItemCardSkeleton />
	}

	return (
		<Box
			component="button"
			onClick={() => history.push(`/stores/${item.collection.name}/${item.ID}`)}
			sx={{
				position: "relative",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-between",
				padding: "1rem",
				paddingBottom: "2rem",
				paddingRight: "2rem",
				textAlign: "center",
				font: "inherit",
				color: "inherit",
				border: "none",
				outline: "none",
				backgroundColor: "transparent",
				cursor: "pointer",
				"&:hover .ViewButton, &:focus .ViewButton": {
					borderRadius: "50%",
					backgroundColor: colors.purple,
					transform: "scale(1.6)",
					"& > *": {
						transform: "rotate(0deg)",
					},
				},
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
				{item.name}
			</Typography>

			{/* image */}
			<Box
				component="img"
				src={item.image}
				alt="Mech image"
				sx={{
					width: "100%",
					marginBottom: ".3rem",
				}}
			/>
			<Typography
				variant="body1"
				sx={{
					textTransform: "uppercase",
				}}
			>
				{getItemAttributeValue(item.attributes, "Asset Type")}
			</Typography>
			<Typography
				variant="h4"
				sx={{
					marginBottom: ".3rem",
					fontFamily: fonts.bizmoblack,
					fontStyle: "italic",
					letterSpacing: "2px",
					textTransform: "uppercase",
					...rarityTextStyles[getItemAttributeValue(item.attributes, "Rarity") as Rarity],
				}}
			>
				{getItemAttributeValue(item.attributes, "Rarity")}
			</Typography>
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
				{supFormatter(item.supCost)}
			</Typography>
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
