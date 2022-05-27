import { useEffect, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { Box, Stack } from "@mui/material"
import { Navbar } from "../../components/home/navbar"
import { colors } from "../../theme"
import { Collections1155 } from "../../types/types"
import { Loading } from "../../components/loading"
import { CollectionCard } from "./CollectionCard"

export const DepositAssetsPage = () => {
	const [collections, setCollections] = useState<Collections1155>()
	const [collectionsLoading, setCollectionsLoading] = useState<boolean>(true)

	useEffect(() => {
		;(async () => {
			try {
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/collection/1155/all`)
				const body = (await resp.clone().json()) as Collections1155
				setCollections(body)
				setCollectionsLoading(false)
			} catch (e) {
				console.error(e)
			}
		})()
	}, [])

	return (
		<Stack spacing="2rem" sx={{ height: "100%", overflowX: "hidden" }}>
			<Navbar />

			<Box sx={{ flex: 1, position: "relative", px: "3rem", py: "2rem" }}>
				<Stack
					spacing=".8rem"
					sx={{
						px: "3rem",
						py: "2rem",
						height: "100%",
						backgroundColor: colors.darkNavyBlue,
						boxShadow: 3,
					}}
				>
					{collectionsLoading && <Loading />}
					{collections &&
						collections.collections.map((collection, index) => {
							return <CollectionCard collection={collection} key={index} />
						})}
				</Stack>
			</Box>
		</Stack>
	)
}
