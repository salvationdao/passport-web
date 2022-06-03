import React, { useEffect, useState } from "react"
import { API_ENDPOINT_HOSTNAME, ETHEREUM_CHAIN_ID } from "../../config"
import { Box, FormControlLabel, FormGroup, Stack, Switch, Typography } from "@mui/material"
import { Navbar } from "../../components/home/navbar"
import { colors } from "../../theme"
import { Collection1155 } from "../../types/types"
import { Loading } from "../../components/loading"
import { useWeb3 } from "../../containers/web3"
import { useParams } from "react-router-dom"
import { SwitchNetworkOverlay } from "../../components/transferStatesOverlay/switchNetworkOverlay"
import { DepositAssetCard } from "./DepositAssetCard"
import { BigNumber } from "ethers"

export const ContractAssetPage = () => {
	const [collection, setCollections] = useState<Collection1155>()
	const [collectionsLoading, setCollectionsLoading] = useState<boolean>(true)
	const [isCorrectChain, setIsCorrectChain] = useState<boolean>(false)
	const [loadError, setLoadError] = useState<string>("")
	const [uri, setURI] = useState<string>()
	const [balance, setBalance] = useState<BigNumber[]>()
	const { collection_slug } = useParams<{ collection_slug: string }>()
	const { account, getURI1177, currentChainId, changeChain, batchBalanceOf } = useWeb3()
	const [showOwned, setShowOwned] = useState<boolean>(true)

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

					return
				}
				setURI(uri)
				setCollections(collections)
			} catch (e) {
				setLoadError("Error getting collection details")
				console.error(e)
			} finally {
				setCollectionsLoading(false)
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

	useEffect(() => {
		if (!collection) return
		;(async () => {
			try {
				if (collection.mint_contract != null) {
					const balance = await batchBalanceOf(collection.token_ids, collection.mint_contract)
					if (balance) {
						setBalance(balance)
					}
				}
			} catch (e) {
				console.error(e)
			}
		})()
	}, [batchBalanceOf, collection])

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
					{collection && loadError === "" && !collectionsLoading && uri && collection.mint_contract && collection.transfer_address && (
						<Box>
							<Typography variant="h1">{collection.name}</Typography>
							<FormGroup>
								<FormControlLabel
									control={<Switch defaultChecked value={showOwned} />}
									label="Only show owned assets"
									onChange={(e, checked) => {
										setShowOwned(checked)
										console.log(checked)
									}}
								/>
							</FormGroup>
							<ContractAssetPagetInner
								tokenIDs={collection.token_ids}
								uri={uri}
								balance={balance}
								mintAddress={collection.mint_contract}
								transferAddress={collection.transfer_address}
								showOwned={showOwned}
								collectionSlug={collection.slug}
							/>
						</Box>
					)}
				</Stack>
			</Box>
		</Stack>
	)
}

interface ContractAssetPageInnerProp {
	uri: string
	tokenIDs: number[]
	balance: BigNumber[] | undefined
	mintAddress: string
	transferAddress: string
	showOwned: boolean
	collectionSlug: string
}

const ContractAssetPagetInner = ({ tokenIDs, uri, balance, mintAddress, transferAddress, showOwned, collectionSlug }: ContractAssetPageInnerProp) => {
	return (
		<Stack direction="row" alignItems="flex-start" sx={{ flexWrap: "wrap", height: "fit-content" }}>
			{tokenIDs.length > 0 &&
				tokenIDs.map((tokenID, i) => {
					return (
						<DepositAssetCard
							uri={uri}
							balance={balance}
							key={tokenID}
							tokenID={tokenID}
							mintContract={mintAddress}
							transferAddress={transferAddress}
							showOwned={showOwned}
							collectionSlug={collectionSlug}
						/>
					)
				})}
		</Stack>
	)
}
