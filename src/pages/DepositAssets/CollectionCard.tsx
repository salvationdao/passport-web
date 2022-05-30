import { Collection1155 } from "../../types/types"
import { Box } from "@mui/system"
import { colors } from "../../theme"
import { Stack, Typography } from "@mui/material"
import React from "react"
import { useHistory } from "react-router-dom"

interface CollectionCardProps {
	collection: Collection1155
}

export const CollectionCard = ({ collection }: CollectionCardProps) => {
	const history = useHistory()
	return (
		<Box sx={{ p: "1rem" }}>
			<Box
				sx={{
					maxWidth: "35rem",
					backgroundColor: `${colors.darkerNavyBlue}90`,
					borderRadius: "5px",
					boxShadow: 1,
					mb: "1rem",
					overflow: "hidden",
					transition: "all .2s",
					cursor: "pointer",
					":hover": {
						boxShadow: 10,
						transform: "translateY(-5px)",
					},
				}}
				onClick={() => {
					history.push(`/deposit-assets/${collection.slug}`)
				}}
			>
				<Stack
					sx={{
						height: "100%",
					}}
				>
					<Box
						sx={{
							position: "relative",
							background: `url(${collection.background_url})`,
							height: "10rem",
							backgroundPosition: "center",
							backgroundSize: "cover",
						}}
					>
						<Box
							component={"img"}
							src={collection.logo_url}
							alt={`${collection.slug}-logo`}
							sx={{ position: "absolute", bottom: "0.4rem", right: "0.6rem", height: "2.3rem" }}
						/>
					</Box>
					<Box sx={{ px: "2rem", py: "1.6rem" }}>
						<Typography variant={"h3"} sx={{ mb: "1rem" }}>
							{collection.name}
						</Typography>
						<Typography
							sx={{
								display: "-webkit-box",
								overflow: "hidden",
								overflowWrap: "anywhere",
								textOverflow: "ellipsis",
								WebkitLineClamp: 3,
								WebkitBoxOrient: "vertical",
							}}
						>
							{collection.description}
						</Typography>
					</Box>
				</Stack>
			</Box>
		</Box>
	)
}
