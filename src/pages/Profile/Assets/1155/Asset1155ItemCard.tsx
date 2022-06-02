import { Box, Stack, Tooltip, Typography } from "@mui/material"
import { colors, fonts } from "../../../../theme"
import { User1155Asset } from "../../../../types/purchased_item"
import { ViewButton } from "../Common/ViewButton"
import LockRoundedIcon from "@mui/icons-material/LockRounded"
import SearchIcon from "@mui/icons-material/Search"
import React from "react"
import { useHistory } from "react-router-dom"

export interface Asset721ItemCardProps {
	userAsset: User1155Asset
	username: string
}

export const Asset1155ItemCard: React.VoidFunctionComponent<Asset721ItemCardProps> = ({ userAsset, username }) => {
	const { animation_url, image_url, external_token_id, label, service_id, collection_slug, count } = userAsset
	const history = useHistory()

	return (
		<>
			<Stack
				spacing=".5rem"
				onClick={() => {
					history.push(`/profile/${username}/asset1155/${collection_slug}/${external_token_id}/${service_id ? "true" : "false'"}`)
				}}
				sx={{
					position: "relative",
					px: "1.5rem",
					pt: "1.3rem",
					pb: "2rem",
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
						mr: "1rem",
					}}
				>
					{label}
				</Typography>
				<Tooltip title={"Amount Owned"}>
					<Stack
						sx={{
							position: "absolute",
							top: "0%",
							right: "2%",
							borderRadius: "50%",
							border: `3px solid ${colors.darkerNeonPink}99`,
							width: "2.5rem",
							height: "2.5rem",
						}}
						justifyContent={"center"}
						alignItems={"center"}
					>
						<Typography sx={{ fontFamily: fonts.bizmoblack }}>x{count}</Typography>
					</Stack>
				</Tooltip>
				<Box sx={{ position: "relative", height: "15rem", mt: "auto !important" }}>
					<Box
						className="asset-animation"
						component="video"
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							width: "100%",
							height: "100%",
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
					{service_id && (
						<Stack
							sx={{
								position: "absolute",
								bottom: "0.7rem",
								left: "0.2rem",
								borderRadius: "50%",
								backgroundColor: "#000000",
								width: "2rem",
								height: "2rem",
								boxShadow: 1.5,
							}}
							justifyContent="center"
							alignItems="center"
						>
							<Tooltip title="Item locked in service">
								<LockRoundedIcon sx={{ fontSize: "1rem" }} />
							</Tooltip>
						</Stack>
					)}
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
		</>
	)
}
