import { Box, Skeleton, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { PlaceholderMechImagePath } from "../../../assets"
import { FancyButton } from "../../../components/fancyButton"
import { useWebsocket } from "../../../containers/socket"
import { getItemAttributeValue } from "../../../helpers/items"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { Asset } from "../../../types/types"
import { Rarity } from "../../store/storeItemCard"

const rarityTextStyles: { [key in Rarity]: any } = {
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

export interface CollectionItemCardProps {
	tokenID: number
	collectionName: string
	username: string
}

export const CollectionItemCard: React.VoidFunctionComponent<CollectionItemCardProps> = ({ tokenID, collectionName, username }) => {
	const history = useHistory()
	const { subscribe } = useWebsocket()
	const [item, setItem] = useState<Asset>()

	useEffect(() => {
		if (!subscribe) return
		return subscribe<Asset>(
			HubKey.AssetUpdated,
			(payload) => {
				setItem(payload)
			},
			{ tokenID },
		)
	}, [subscribe, tokenID])

	if (!item) {
		return <CollectionItemCardSkeleton />
	}

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
			<Typography
				variant="h5"
				component="p"
				sx={{
					marginBottom: "1rem",
					textAlign: "center",
					textTransform: "uppercase",
				}}
			>
				{item.name}
			</Typography>

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
				<Box
					component="img"
					src={PlaceholderMechImagePath}
					alt="Mech image"
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
					<Typography
						variant="body1"
						sx={{
							textTransform: "uppercase",
						}}
					>
						{getItemAttributeValue(item.attributes, "Asset Type")}
					</Typography>
				</Box>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "end",
					width: "100%",
					marginBottom: ".5rem",
				}}
			>
				<Typography
					variant="caption"
					sx={{
						...rarityTextStyles[getItemAttributeValue(item.attributes, "Rarity") as Rarity],
					}}
				>
					{getItemAttributeValue(item.attributes, "Rarity")}
				</Typography>
			</Box>
			<FancyButton onClick={() => history.push(`/collections/${username}/${collectionName}/${tokenID}`)}>View Item</FancyButton>
		</Box>
	)
}

const CollectionItemCardSkeleton: React.VoidFunctionComponent = () => {
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
				</Box>
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
