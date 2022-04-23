import SearchIcon from "@mui/icons-material/Search"
import { Box, BoxProps, Skeleton, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { getStringFromShoutingSnakeCase } from "../../helpers"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Rarity } from "../../types/enums"
import { PurchasedItem, PurchasedItemResponse } from "../../types/purchased_item"
import { rarityTextStyles } from "../profile/profile"
import useCommands from "../../containers/ws/useCommands"

export interface CollectionItemCardProps {
	assetHash: string
	username: string
}

export const CollectionItemCard: React.VoidFunctionComponent<CollectionItemCardProps> = ({ assetHash, username }) => {
	const history = useHistory()
	const { send } = useCommands()
	const [item, setItem] = useState<PurchasedItem>()
	//const [ownerUsername, setOwnerUsername] = useState<string | null>(null)
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
		if (!assetHash || assetHash === "") return
		send<PurchasedItemResponse>(HubKey.AssetUpdated, {
			asset_hash: assetHash,
		}).then((payload) => {
			if (!payload || !payload.purchased_item) {
				setNoAsset(true)
				return
			}
			setItem(payload.purchased_item)
		})
	}, [assetHash])

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
				{item.data.mech.name}
			</Typography>

			{/* image */}
			<Box
				sx={{
					position: "relative",
				}}
			>
				<Box
					component="img"
					src={item.data.mech.image_url}
					alt="Mech image"
					sx={{
						width: "100%",
						marginBottom: ".3rem",
						visibility: item.data.mech.card_animation_url ? (showPreview ? "hidden" : "visible") : "visible",
						opacity: item.data.mech.card_animation_url ? (showPreview ? 0 : 1) : "visible",
						transition: "all .2s ease-in",
					}}
				/>
				{item.data.mech.card_animation_url && (
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
						<source src={item.data.mech.card_animation_url} type="video/webm"></source>
					</Box>
				)}
			</Box>
			<Typography
				variant="body1"
				sx={{
					textTransform: "uppercase",
				}}
			>
				{"War Machine"}
			</Typography>
			<Typography
				variant="h4"
				sx={{
					fontFamily: fonts.bizmoblack,
					fontStyle: "italic",
					letterSpacing: "2px",
					textTransform: "uppercase",
					...rarityTextStyles[item.tier as Rarity],
				}}
			>
				{getStringFromShoutingSnakeCase(item.tier)}
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
