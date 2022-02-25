import SearchIcon from "@mui/icons-material/Search"
import { Box, BoxProps, Skeleton, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { useWebsocket } from "../../containers/socket"
import { getItemAttributeValue } from "../../helpers/items"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Asset } from "../../types/types"
import { Rarity, rarityTextStyles } from "../profile/profile"

export interface CollectionItemCardProps {
	assetHash: string
	username: string
}

export const CollectionItemCard: React.VoidFunctionComponent<CollectionItemCardProps> = ({ assetHash, username }) => {
	const history = useHistory()
	const { subscribe } = useWebsocket()
	const [item, setItem] = useState<Asset>()
	const [showPreview, setShowPreview] = useState(false)
	const [noAsset, setNoAsset] = useState<boolean>(false) //used if asset doesn't exist in our metadata (shouldn't happen, fixes local dev stuff)

	useEffect(() => {
		;(async () => {
			try {
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/asset/${assetHash}`)
				if (!resp.ok || resp.status !== 200) {
					setNoAsset(true)
				}
			} catch (e) {
				setNoAsset(true)
			}
		})()
	}, [history, assetHash])

	useEffect(() => {
		if (!subscribe || assetHash === "") return
		return subscribe<Asset>(
			HubKey.AssetUpdated,
			(payload) => {
				setItem(payload)
			},
			{ assetHash },
		)
	}, [subscribe, assetHash])

	if (noAsset) return <></>

	if (!item) {
		return <CollectionItemCardSkeleton />
	}

	return (
		<Box
			component="button"
			onClick={() => history.push(`/profile/${username}/asset/${item?.hash}`)}
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
				sx={{
					position: "relative",
				}}
			>
				<Box
					component="img"
					src={item.image}
					alt="Mech image"
					sx={{
						width: "100%",
						marginBottom: ".3rem",
						visibility: item.animation_url ? (showPreview ? "hidden" : "visible") : "visible",
						opacity: item.animation_url ? (showPreview ? 0 : 1) : "visible",
						transition: "all .2s ease-in",
					}}
				/>
				{item.animation_url && (
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
					>
						<source src={item.animation_url} type="video/webm"></source>
					</Box>
				)}
			</Box>
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
					letterSpacing: "2px",
					textTransform: "uppercase",
					...rarityTextStyles[getItemAttributeValue(item.attributes, "Rarity") as Rarity],
				}}
			>
				{getItemAttributeValue(item.attributes, "Rarity")}
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

export const ViewButton = (props: BoxProps) => (
	<Box
		{...props}
		className="ViewButton"
		sx={{
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
			"& > *": {
				transition: "transform .2s ease-out",
				transform: "rotate(-45deg)",
			},
			...props.sx,
		}}
	/>
)

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
