import SearchIcon from "@mui/icons-material/Search"
import { Box, BoxProps, Stack, Typography } from "@mui/material"
import { useHistory } from "react-router-dom"
import { getStringFromShoutingSnakeCase } from "../../helpers"
import { colors, fonts } from "../../theme"
import { Rarity } from "../../types/enums"
import { UserAsset } from "../../types/purchased_item"
import { rarityTextStyles } from "../profile/profile"

export interface CollectionItemCardProps {
	userAsset: UserAsset
	username: string
}

export const CollectionItemCard: React.VoidFunctionComponent<CollectionItemCardProps> = ({ userAsset, username }) => {
	const history = useHistory()

	const { tier, name, hash, image_url, card_animation_url } = userAsset
	const rarityStyles = rarityTextStyles[tier as Rarity]

	return (
		<Stack
			justifyContent="space-between"
			onClick={() => history.push(`/profile/${username}/asset/${hash}`)}
			sx={{
				position: "relative",
				p: "1rem",
				pb: "2rem",
				pr: "2rem",
				textAlign: "center",
				font: "inherit",
				color: "inherit",
				border: "none",
				outline: "none",
				backgroundColor: "transparent",
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
				variant="h5"
				component="p"
				sx={{
					mb: ".5",
					textTransform: "uppercase",
				}}
			>
				{name}
			</Typography>

			<Box sx={{ position: "relative" }}>
				<Box
					className="asset-image"
					component="img"
					src={image_url}
					alt="Asset image"
					sx={{
						width: "100%",
						mb: ".3rem",
						visibility: "visible",
						opacity: 1,
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

export const ViewButton = (props: BoxProps) => (
	<Box
		{...props}
		className="view-button"
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
