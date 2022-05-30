import React, { useEffect, useState } from "react"
import { API_ENDPOINT_HOSTNAME, ETHEREUM_CHAIN_ID } from "../../config"
import { Box, Stack, Typography } from "@mui/material"
import { Navbar } from "../../components/home/navbar"
import { colors } from "../../theme"
import { AvantBalances, AvantUserBalance, Collection1155 } from "../../types/types"
import { Loading } from "../../components/loading"
import { useWeb3 } from "../../containers/web3"
import { useParams } from "react-router-dom"
import { SwitchNetworkOverlay } from "../../components/transferStatesOverlay/switchNetworkOverlay"
import { DepositAssetCard } from "./DepositAssetCard"

export const ContractAssetPage = () => {
	const [collection, setCollections] = useState<Collection1155>()
	const [collectionsLoading, setCollectionsLoading] = useState<boolean>(true)
	const [isCorrectChain, setIsCorrectChain] = useState<boolean>(false)
	const [loadError, setLoadError] = useState<string>("")
	const [uri, setURI] = useState<string>()
	const { collection_slug } = useParams<{ collection_slug: string }>()
	const { account, getURI1177, currentChainId, changeChain } = useWeb3()

	const [balances, setBalances] = useState<number[]>()

	useEffect(() => {
		if (!collection_slug || !account || !isCorrectChain) return
		;(async () => {
			try {
				const ppResp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/collection/${collection_slug}/${account}`)
				const collections = (await ppResp.clone().json()) as Collection1155
				if (!collections.mint_contract) {
					setLoadError("Failed to get mint contract")
					return
				}
				const uri = await getURI1177(collections.mint_contract, 0)
				if (!uri) {
					setLoadError("Failed to get uri from contract")
					setCollectionsLoading(false)
					return
				}
				setURI(uri)
				setCollections(collections)
				console.log(collections)
				setCollectionsLoading(false)
			} catch (e) {
				setLoadError("Error getting collection details")
				console.log(e)
			}
		})()
	}, [collection_slug, account, isCorrectChain, getURI1177])

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
						width: "100%",
					}}
				>
					{currentChainId && currentChainId.toString() !== ETHEREUM_CHAIN_ID && (
						<SwitchNetworkOverlay changeChain={changeChain} currentChainId={currentChainId} newChainID={ETHEREUM_CHAIN_ID} />
					)}
					{collectionsLoading && <Loading />}
					{loadError !== "" && <Typography sx={{ marginTop: "1rem", color: colors.supremacy.red }}>{loadError}</Typography>}
					{collection && loadError === "" && !collectionsLoading && uri && collection.balances && collection.balances.balances && (
						<Box>
							<Typography variant="h1">{collection.name}</Typography>
							<ContractAssetPagetInner collectionBalance={collection.balances.balances} uri={uri} />
						</Box>
					)}
				</Stack>
			</Box>
		</Stack>
	)
}

interface ContractAssetPageInnerProp {
	collectionBalance: AvantBalances[]
	uri: string
	balances: number[]
}

const ContractAssetPagetInner = ({ collectionBalance, uri, balances }: ContractAssetPageInnerProp) => {
	return (
		<Stack direction="row" alignItems="flex-start" sx={{ flexWrap: "wrap", height: "fit-content" }}>
			{collectionBalance.length > 0 &&
				collectionBalance.map((balance, i) => {
					return <DepositAssetCard uri={uri} balance={balance} key={balance.token_id} />
				})}
		</Stack>
	)
}
