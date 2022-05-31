import { Box, Stack, Typography } from "@mui/material"
import { useHistory } from "react-router-dom"
import { colors, fonts } from "../../../../theme"
import { User1155Asset } from "../../../../types/purchased_item"
import { ViewButton } from "../Common/ViewButton"
import MoveUpRoundedIcon from "@mui/icons-material/MoveUpRounded"
import React, { useState } from "react"
import { Withdraw1155AssetModal } from "./Withdraw1155AssetModal"

export interface Asset721ItemCardProps {
	userAsset: User1155Asset
	username: string
}

export const Asset1155ItemCard: React.VoidFunctionComponent<Asset721ItemCardProps> = ({ userAsset, username }) => {
	const { animation_url, image_url, external_token_id, label, description } = userAsset
	const [open, setOpen] = useState<boolean>(false)

	console.log(userAsset)

	return (
		<>
			<Stack
				spacing=".3rem"
				justifyContent="space-between"
				onClick={() => {
					setOpen(true)
				}}
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
						display: "-webkit-box",
						overflow: "hidden",
						overflowWrap: "anywhere",
						textOverflow: "ellipsis",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
					}}
				>
					{label}
				</Typography>

				<Box sx={{ position: "relative", height: "15rem" }}>
					<Box
						className="asset-animation"
						component="video"
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							width: "100%",
							transform: "translate(-50%, -50%)",
							transition: "all .2s ease-in",
						}}
						muted
						autoPlay
						loop
						poster={`${image_url}`}
					>
						{animation_url && <source src={animation_url} type="video/webm"></source>}
					</Box>
				</Box>

				<Box>
					<Typography
						sx={{
							fontFamily: fonts.bizmoblack,
							fontStyle: "italic",
							letterSpacing: "2px",
						}}
					>
						{description}
					</Typography>
				</Box>

				<ViewButton
					sx={{
						position: "absolute",
						right: "1rem",
						bottom: "1rem",
					}}
					onClick={() => {
						setOpen(true)
					}}
				>
					<MoveUpRoundedIcon />
				</ViewButton>
			</Stack>

			<Withdraw1155AssetModal open={open} tokenID={external_token_id.toString()} asset={userAsset} />
		</>
	)
}
