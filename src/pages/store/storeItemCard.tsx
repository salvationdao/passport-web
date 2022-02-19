import { Box, Skeleton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { PlaceholderMechImagePath, SupTokenIconPath } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { API_ENDPOINT_HOSTNAME, useWebsocket } from "../../containers/socket"
import { getItemAttributeValue, supFormatter } from "../../helpers/items"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { StoreItem } from "../../types/types"

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
	const { push } = useHistory()

	useEffect(() => {
		if (!subscribe) return
		return subscribe<StoreItem>(
			HubKey.StoreItemSubscribe,
			(payload) => {
				setItem(payload)
			},
			{ storeItemID: storeItemID },
		)
	}, [subscribe, storeItemID])

	if (!item) {
		return <StoreItemCardSkeleton />
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
					<Box
						component="img"
						src={`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${item.faction?.logoBlobID}`}
						alt="Faction Logo"
						sx={{
							width: 30,
							height: 30,
						}}
					/>
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
						<Box
							component="img"
							src={SupTokenIconPath}
							alt="Currency Logo"
							sx={{
								height: "1rem",
								marginRight: ".3rem",
							}}
						/>
						<Typography
							variant="subtitle2"
							sx={{
								width: "100%",
								whiteSpace: "nowrap",
								textOverflow: "ellipsis",
							}}
						>
							{supFormatter(item.supCost)}
						</Typography>
					</Box>
				</Box>
				<Typography
					variant="caption"
					sx={{
						...rarityTextStyles[getItemAttributeValue(item.attributes, "Rarity") as Rarity],
					}}
				>
					{getItemAttributeValue(item.attributes, "Rarity")}
				</Typography>
			</Box>
			<Typography
				variant="caption"
				sx={{
					alignSelf: "end",
					marginBottom: ".5rem",
				}}
			>
				{item.amountAvailable - item.amountSold} in stock
				<Box
					component="span"
					sx={{
						marginLeft: ".2rem",
						color: colors.darkGrey,
					}}
				>
					(out of {item.amountAvailable})
				</Box>
			</Typography>
			<FancyButton onClick={() => push(`/stores/${item.collection.name}/${item.ID}`)}>View Item</FancyButton>
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
