import SearchIcon from "@mui/icons-material/Search"
import { Box, ButtonProps, ButtonUnstyled, Skeleton, styled, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { PlaceholderMechImagePath } from "../../assets"
import { useWebsocket } from "../../containers/socket"
import { getItemAttributeValue } from "../../helpers/items"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Asset } from "../../types/types"
import { Rarity } from "../store/storeItemCard"

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
	username: string
}

export const CollectionItemCard: React.VoidFunctionComponent<CollectionItemCardProps> = ({ tokenID, username }) => {
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
				textAlign: "center",
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
				src={PlaceholderMechImagePath}
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
					fontFamily: fonts.bizmoblack,
					fontStyle: "italic",
					...rarityTextStyles[getItemAttributeValue(item.attributes, "Rarity") as Rarity],
				}}
			>
				{getItemAttributeValue(item.attributes, "Rarity")}
			</Typography>
			<CustomButton onClick={() => history.push(`/collections/${username}/${item.collection.name}/${item.tokenID}`)}>
				<SearchIcon />
			</CustomButton>
		</Box>
	)
}

const CustomButtonBase = styled("button")({
	position: "absolute",
	right: 0,
	bottom: 0,
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	height: "2.6rem",
	width: "2.6rem",
	backgroundColor: "transparent",
	border: `1px solid ${colors.purple}`,
	color: "inherit",
	font: "inherit",
	transform: "rotate(45deg)",
	transition: "transform .2s ease-out, border-radius .2s ease-out, background-color .2s ease-out",
	cursor: "pointer",
	"& > *": {
		transition: "transform .2s ease-out",
		transform: "rotate(-45deg)",
	},
	":hover": {
		borderRadius: "50%",
		backgroundColor: colors.purple,
		transform: "scale(1.6)",
		"& > *": {
			transform: "rotate(0deg)",
		},
	},
})

interface CustomButtonProps extends ButtonProps {}

const CustomButton = ({ ...props }: CustomButtonProps) => {
	return <ButtonUnstyled {...props} component={CustomButtonBase} />
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
