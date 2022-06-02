import React, { useEffect, useState } from "react"
import { API_ENDPOINT_HOSTNAME, ETHEREUM_CHAIN_ID } from "../../config"
import { Box, Stack, Typography } from "@mui/material"
import { Navbar } from "../../components/home/navbar"
import { colors } from "../../theme"
import { Collections1155 } from "../../types/types"
import { Loading } from "../../components/loading"
import { CollectionCard } from "./CollectionCard"
import { useWeb3 } from "../../containers/web3"
import { SwitchNetworkOverlay } from "../../components/transferStatesOverlay/switchNetworkOverlay"

export const DepositAssetsPage = () => {
	const [collections, setCollections] = useState<Collections1155>()
	const [collectionsLoading, setCollectionsLoading] = useState<boolean>(true)
	const [isCorrectChain, setIsCorrectChain] = useState<boolean>(false)
	const { currentChainId, changeChain } = useWeb3()

	useEffect(() => {
		if (!isCorrectChain) return
		;(async () => {
			try {
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/collection/1155/all`)
				const body = (await resp.clone().json()) as Collections1155
				setCollections(body)
			} catch (e) {
				console.error(e)
			} finally {
				setCollectionsLoading(false)
			}
		})()
	}, [isCorrectChain])

	useEffect(() => {
		if (!currentChainId) return
		if (currentChainId.toString() !== ETHEREUM_CHAIN_ID) {
			setIsCorrectChain(false)
			setCollectionsLoading(false)
			return
		} else {
			setIsCorrectChain(true)
			setCollectionsLoading(false)
		}
	}, [currentChainId])

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
					{!isCorrectChain && (
						<SwitchNetworkOverlay changeChain={changeChain} currentChainId={currentChainId} newChainID={ETHEREUM_CHAIN_ID} />
					)}
					{collectionsLoading && <Loading />}
					{collections &&
						collections.collections.length > 0 &&
						collections.collections.map((collection, index) => {
							return <CollectionCard collection={collection} key={index} />
						})}
				</Stack>
			</Box>
		</Stack>
	)
}
