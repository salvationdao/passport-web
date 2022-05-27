import SearchIcon from "@mui/icons-material/Search"
import { Box, Stack, Typography } from "@mui/material"
import { useHistory } from "react-router-dom"
import { getStringFromShoutingSnakeCase } from "../../../../helpers"
import { rarityTextStyles } from "../../../../helpers/items"
import { colors, fonts } from "../../../../theme"
import { Rarity } from "../../../../types/enums"
import { UserAsset } from "../../../../types/purchased_item"
import { ViewButton } from "../Common/ViewButton"

export interface Asset721ItemCardProps {
	userAsset: UserAsset
	username: string
}

export const Asset721ItemCard: React.VoidFunctionComponent<Asset721ItemCardProps> = ({ userAsset, username }) => {
	const history = useHistory()

	const { tier, name, hash, image_url, card_animation_url } = userAsset
	const rarityStyles = rarityTextStyles[tier as Rarity]

	return (
		<Stack
			spacing=".3rem"
			justifyContent="space-between"
			onClick={() => history.push(`/profile/${username}/asset/${hash}`)}
			sx={{
				position: "relative",
				px: "1.5rem",
				py: "1.3rem",
				font: "inherit",
				color: "inherit",
				outline: "none",
				backgroundColor: `${colors.darkerNavyBlue}60`,
				border: "#00000060 1px solid",
				boxShadow: 3,
				cursor: "pointer",
				":hover": {
					"& .asset-image": {
						visibility: card_animation_url ? "hidden" : "visible",
						opacity: card_animation_url ? 0 : 1,
					},
					"& .asset-animation": {
						visibility: card_animation_url ? "visible" : "hidden",
						opacity: card_animation_url ? 1 : 0,
					},
				},
				"&:hover .view-button, &:focus .ViewButton": {
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
				variant="h6"
				sx={{
					mb: ".5",
					textTransform: "uppercase",
					display: "-webkit-box",
					overflow: "hidden",
					overflowWrap: "anywhere",
					textOverflow: "ellipsis",
					WebkitLineClamp: 2,
					WebkitBoxOrient: "vertical",
				}}
			>
				{name}
			</Typography>

			<Box sx={{ position: "relative", height: "15rem" }}>
				<Box
					className="asset-image"
					component="img"
					src={image_url}
					alt="Asset image"
					sx={{
						width: "100%",
						height: "100%",
						mb: ".3rem",
						visibility: "visible",
						opacity: 1,
						objectFit: "contain",
						objectPosition: "center",
						transition: "all .2s ease-in",
					}}
				/>
				{card_animation_url && (
					<Box
						className="asset-animation"
						component="video"
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							width: "120%",
							transform: "translate(-50%, -50%)",
							visibility: "hidden",
							opacity: 0,
							transition: "all .2s ease-in",
						}}
						muted
						autoPlay
						loop
						tabIndex={-1}
					>
						<source src={card_animation_url} type="video/webm"></source>
					</Box>
				)}
			</Box>

			<Box>
				<Typography sx={{ textTransform: "uppercase" }}>{"War Machine"}</Typography>
				<Typography
					variant="h4"
					sx={{
						fontFamily: fonts.bizmoblack,
						fontStyle: "italic",
						letterSpacing: "2px",
						textTransform: "uppercase",
						...rarityStyles,
					}}
				>
					{getStringFromShoutingSnakeCase(tier)}
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
		</Stack>
	)
}
