import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Box, Typography, useMediaQuery } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useSnackbar } from "../containers/snackbar"
import { getStringFromShoutingSnakeCase } from "../helpers"
import { useQuery } from "../hooks/useSend"
import HubKey from "../keys"
import { FilterChip, SortChip } from "../pages/profile/profile"
import { colors } from "../theme"
import { Collection } from "../types/types"
import { usePassportCommandsUser } from "../hooks/usePassport"
import { useAuth } from "../containers/auth"

interface SortProps {
	assetType?: string
	page?: number
	pageSize?: number
	search: string
	pillSizeSmall?: boolean
	showOffWorldFilter?: boolean
	showCollectionFilter?: boolean
	setAssetHashes: React.Dispatch<React.SetStateAction<string[]>>
	setTotal?: React.Dispatch<React.SetStateAction<number>>
	setLoading?: React.Dispatch<React.SetStateAction<boolean>>
	setError?: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const Sort = ({
	assetType,
	search,
	page,
	pageSize,
	pillSizeSmall = false,
	showOffWorldFilter = true,
	showCollectionFilter = true,
	setAssetHashes,
	setTotal,
	setLoading,
	setError,
}: SortProps) => {
	const [showOffWorldOnly, setShowOffWorldOnly] = useState<boolean>()
	const [aquisitionDir, setAquisitionDir] = useState<boolean>()
	const [alphabetical, setAlphabetical] = useState<boolean>()
	const [collection, setCollection] = useState<Collection>()
	const [collections, setCollections] = useState<Collection[]>()
	const [rarities, setRarities] = useState<Set<string>>(new Set())
	const [sort, setSort] = useState<{ sortBy: string; sortDir: string }>()
	const { state, send } = usePassportCommandsUser("/commander")
	const { displayMessage } = useSnackbar()
	const { user } = useAuth()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const { username } = useParams<{ username: string }>()

	const { loading, error, payload, query } = useQuery<{ assets: string[]; total: number }>(HubKey.AssetList, false)

	const toggleRarity = (rarity: string) => {
		setRarities((prev) => {
			const exists = prev.has(rarity)
			const temp = new Set(prev)
			if (exists) {
				temp.delete(rarity)
				return temp
			}
			return temp.add(rarity)
		})
	}

	const toggleCollection = (collection: Collection) => {
		setCollection((prev) => {
			if (prev?.id === collection.id) {
				return undefined
			}
			return collection
		})
	}

	const toggleOnOffWorld = () => {
		setShowOffWorldOnly((prev) => {
			if (prev === undefined) {
				return true
			}
			if (prev === true) {
				return false
			}
			if (prev === false) {
				return undefined
			}
		})
	}

	const toggleAquisitionSort = () => {
		setAlphabetical(undefined)
		setAquisitionDir((prev) => {
			if (prev === undefined) {
				return true
			}
			if (prev === true) {
				return false
			}
			if (prev === false) {
				return undefined
			}
		})
	}

	const toggleAlphabeticalSort = () => {
		setAquisitionDir(undefined)
		setAlphabetical((prev) => {
			if (prev === undefined) {
				return true
			}
			if (prev === true) {
				return false
			}
			if (prev === false) {
				return undefined
			}
		})
	}

	useEffect(() => {
		if (state !== WebSocket.OPEN || !send) return
		;(async () => {
			try {
				const resp = await send<{ records: Collection[]; total: number }>(HubKey.CollectionList)
				setCollections(resp.records)
			} catch (e) {
				displayMessage(typeof e === "string" ? e : "An error occurred while loading collection data.", "error")
			}
		})()
	}, [send, state, user, displayMessage])

	useEffect(() => {
		const newSort = {
			sortBy: "",
			sortDir: "",
		}

		if (alphabetical !== undefined) {
			newSort.sortBy = "name"

			if (alphabetical) {
				newSort.sortDir = "asc"
			} else {
				newSort.sortDir = "desc"
			}
		} else if (aquisitionDir !== undefined) {
			newSort.sortBy = "created_at"

			if (aquisitionDir) {
				newSort.sortDir = "desc"
			} else {
				newSort.sortDir = "asc"
			}
		}

		setSort(newSort)
	}, [alphabetical, aquisitionDir])

	useEffect(() => {
		if (state !== WebSocket.OPEN) return

		const filtersItems: any[] = [
			// filter by user id
			{
				columnField: "username",
				operatorValue: "=",
				value: username || user?.username,
			},
		]

		if (collection && collection.id) {
			filtersItems.push({
				// filter by collection id
				columnField: "collection_id",
				operatorValue: "=",
				value: collection.id,
			})
		}

		if (showOffWorldOnly !== undefined) {
			filtersItems.push({
				// filter by on_chain_status
				columnField: "on_chain_status",
				operatorValue: showOffWorldOnly ? "=" : "!=",
				value: "STAKABLE",
			})
		}

		const attributeFilterItems: any[] = []
		if (assetType && assetType !== "All") {
			attributeFilterItems.push({
				trait: "asset_type",
				value: assetType,
				operatorValue: "contains",
			})
		}
		rarities.forEach((v) =>
			attributeFilterItems.push({
				// NOTE: "rarity" trait is now "tier" on the backend
				trait: "tier",
				value: v,
				operatorValue: "contains",
			}),
		)

		query({
			search,
			page,
			page_size: pageSize,
			attribute_filter: {
				linkOperator: assetType && assetType !== "All" ? "and" : "or",
				items: attributeFilterItems,
			},
			filter: {
				linkOperator: "and",
				items: filtersItems,
			},
			...sort,
		})
	}, [user, query, collection, state, assetType, rarities, search, username, sort, showOffWorldOnly, page, pageSize])

	useEffect(() => {
		if (!payload || loading || error) return
		if (setTotal) setTotal(payload.total)
		setAssetHashes(payload.assets)
	}, [payload, loading, error, setAssetHashes, setTotal])

	useEffect(() => {
		if (!setLoading) return
		setLoading(loading)
	}, [loading, setLoading])

	useEffect(() => {
		if (!setError) return
		setError(error)
	}, [error, setError])

	const renderRarities = () => {
		const rarityArray: string[] = []

		for (const rarityType in colors.rarity) {
			rarityArray.push(rarityType)
		}

		return rarityArray.map((rarity, index) => {
			const colorValue = colors.rarity[rarity as keyof typeof colors.rarity]

			return (
				<FilterChip
					key={`${rarity}-${index}`}
					active={rarities.has(rarity)}
					label={getStringFromShoutingSnakeCase(rarity)}
					color={colorValue}
					variant="outlined"
					onClick={() => toggleRarity(rarity)}
				/>
			)
		})
	}

	const renderFilters = () => (
		<>
			<Box sx={{ display: showOffWorldFilter ? "block" : "none" }}>
				<Typography
					variant="subtitle1"
					sx={{
						marginBottom: ".5rem",
					}}
				>
					On World / Off World
				</Typography>

				<Box
					sx={{
						display: "flex",
						flexDirection: isWiderThan1000px ? "column" : "row",
						flexWrap: isWiderThan1000px ? "initial" : "wrap",
						gap: ".5rem",
					}}
				>
					<SortChip
						active={showOffWorldOnly !== undefined}
						label={showOffWorldOnly === undefined ? "Both" : showOffWorldOnly === false ? "On World Only" : "Off World Only"}
						variant="outlined"
						onClick={() => {
							toggleOnOffWorld()
						}}
					/>
				</Box>
			</Box>
			{!showOffWorldOnly && (
				<>
					<Box>
						<Typography
							variant="subtitle1"
							sx={{
								display: "flex",
								alignItems: "center",
								margin: ".5rem 0",
							}}
						>
							Sort By
						</Typography>

						<Box
							sx={{
								display: "flex",
								flexDirection: isWiderThan1000px && !pillSizeSmall ? "column" : "row",
								flexWrap: isWiderThan1000px ? "initial" : "wrap",
								gap: ".5rem",
							}}
						>
							<SortChip
								icon={aquisitionDir ? <ExpandLessIcon /> : aquisitionDir === false ? <ExpandMoreIcon /> : undefined}
								active={sort?.sortBy === "created_at"}
								label={aquisitionDir !== false ? "Newest First" : "Oldest First"}
								variant="outlined"
								onClick={toggleAquisitionSort}
							/>
							<SortChip
								icon={alphabetical ? <ExpandLessIcon /> : alphabetical === false ? <ExpandMoreIcon /> : undefined}
								active={sort?.sortBy === "name"}
								label={alphabetical !== false ? "Alphabetical" : "Reverse Alphabetical"}
								variant="outlined"
								onClick={toggleAlphabeticalSort}
							/>
						</Box>
					</Box>
					<Box>
						<Typography
							variant="subtitle1"
							sx={{
								margin: ".5rem 0",
							}}
						>
							Rarity
						</Typography>
						<Box
							sx={{
								display: "flex",
								flexWrap: "wrap",
								gap: ".5rem",
							}}
						>
							{renderRarities()}
						</Box>
					</Box>
					<Box>
						<Typography
							variant="subtitle1"
							sx={{
								margin: ".5rem 0",
							}}
						>
							Collection
						</Typography>
						<Box
							sx={{
								display: "flex",
								flexDirection: isWiderThan1000px && !pillSizeSmall ? "column" : "row",
								flexWrap: isWiderThan1000px ? "initial" : "wrap",
								gap: ".5rem",
							}}
						>
							{collections?.map((c, index) => {
								return (
									<FilterChip
										key={`${c.id}-${index}`}
										active={c.id === collection?.id}
										label={c.name}
										variant="outlined"
										onClick={() => toggleCollection(c)}
									/>
								)
							})}
						</Box>
					</Box>
				</>
			)}{" "}
		</>
	)

	return <div>{renderFilters()}</div>
}
