import { useEffect, useState } from "react"
import { API_ENDPOINT_HOSTNAME, AVANT_API_ENDPOINT } from "../../config"
import { Box, Stack } from "@mui/material"
import { Navbar } from "../../components/home/navbar"
import { colors } from "../../theme"
import { AvantUserBalance, Collection1155 } from "../../types/types"
import { Loading } from "../../components/loading"
import { CollectionCard } from "./CollectionCard"
import { useWeb3 } from "../../containers/web3"
import { useAuth } from "../../containers/auth"
import { useParams } from "react-router-dom"

export const ContractAssetPage = () => {
	const [collection, setCollections] = useState<Collection1155>()
	const [userBalances, setUserBalances] = useState<AvantUserBalance>()
	const [collectionsLoading, setCollectionsLoading] = useState<boolean>(true)
	const { collection_slug } = useParams<{ collection_slug: string }>()
	const { account } = useWeb3()

	useEffect(() => {
		if (!collection_slug || !account) return
		;(async () => {
			try {
				const ppResp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/collection/${collection_slug}/${account}`)
				const collections = (await ppResp.clone().json()) as Collection1155

				setCollections(collections)
				setCollectionsLoading(false)
			} catch (e) {
				console.error(e)
			}
		})()
	}, [collection_slug, account])

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
				</Stack>
			</Box>
		</Stack>
	)
}
