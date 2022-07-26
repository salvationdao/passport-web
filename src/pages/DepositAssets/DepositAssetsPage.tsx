import React, { useEffect, useState } from "react"
import { API_ENDPOINT_HOSTNAME, ETHEREUM_CHAIN_ID } from "../../config"
import { Box, Paper, Typography } from "@mui/material"
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
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (!isCorrectChain) return
		;(async () => {
			try {
				setError(undefined)
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/collection/1155/all`)
				const body = (await resp.clone().json()) as Collections1155
				setCollections(body)
			} catch (e) {
				setError(typeof e === "string" ? e : "Something went wrong while fetching collection data")
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
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
			}}
		>
			<Navbar />
			<Box
				sx={{
					display: "flex",
					flex: 1,
					m: "0 2rem 2rem 2rem",
				}}
			>
				<Paper
					sx={{
						display: "flex",
						flex: 1,
						flexDirection: "column",
						alignItems: "center",
						padding: "1rem",
						overflow: "auto",
						borderRadius: 1.5,
						gap: "1rem",
						justifyContent: "center",
						position: "relative",
					}}
				>
					{!isCorrectChain && (
						<SwitchNetworkOverlay changeChain={changeChain} currentChainId={currentChainId} newChainID={ETHEREUM_CHAIN_ID} />
					)}
					{error && (
						<Typography variant={"h2"} sx={{ color: `${colors.errorRed}` }}>
							{error}
						</Typography>
					)}

					{collectionsLoading && <Loading />}
					{collections &&
						collections.collections.length > 0 &&
						collections.collections.map((collection, index) => {
							return <CollectionCard collection={collection} key={index} />
						})}
				</Paper>
			</Box>
		</Box>
	)
}
