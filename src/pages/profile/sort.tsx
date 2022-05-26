import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Box, Typography, useMediaQuery } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getStringFromShoutingSnakeCase } from "../../helpers"
import HubKey from "../../keys"
import { FilterChip, SortChip } from "./profile"
import { colors } from "../../theme"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import { useAuth } from "../../containers/auth"
import { UserAsset } from "../../types/purchased_item"

interface SortProps {
	page?: number
	pageSize?: number
	search: string
	pillSizeSmall?: boolean
	showOffWorldFilter?: boolean
	setUserAssets: React.Dispatch<React.SetStateAction<UserAsset[]>>
	setTotal: React.Dispatch<React.SetStateAction<number>>
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	setError: React.Dispatch<React.SetStateAction<string | undefined>>
}

export const Sort = ({
	search,
	page,
	pageSize,
	pillSizeSmall = false,
	showOffWorldFilter = true,
	setUserAssets,
	setTotal,
	setLoading,
	setError,
}: SortProps) => {
	const [showOffWorldOnly, setShowOffWorldOnly] = useState<boolean>()
	const [acquisitionDir, setAcquisitionDir] = useState<boolean>()
	const [alphabetical, setAlphabetical] = useState<boolean>()
	const [rarities, setRarities] = useState<Set<string>>(new Set())
	const [sort, setSort] = useState<{ column: string; direction: string }>({ column: "name", direction: "asc" })
	const { send } = usePassportCommandsUser("/commander")
	const { user, userID } = useAuth()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const { username } = useParams<{ username: string }>()

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

	const toggleAcquisitionSort = () => {
		setAlphabetical(undefined)
		setAcquisitionDir((prev) => {
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
		setAcquisitionDir(undefined)
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
		const newSort = {
			column: "",
			direction: "",
		}

		if (alphabetical !== undefined) {
			newSort.column = "name"

			if (alphabetical) {
				newSort.direction = "asc"
			} else {
				newSort.direction = "desc"
			}
		} else if (acquisitionDir !== undefined) {
			newSort.column = "created_at"

			if (acquisitionDir) {
				newSort.direction = "desc"
			} else {
				newSort.direction = "asc"
			}
		}

		setSort(newSort)
	}, [alphabetical, acquisitionDir])

	useEffect(() => {
		const filtersItems: any[] = []

		if (showOffWorldOnly !== undefined) {
			filtersItems.push({
				// filter by on_chain_status
				columnField: "on_chain_status",
				operatorValue: showOffWorldOnly ? "=" : "!=",
				value: "STAKABLE",
			})
		}

		const attributeFilterItems: any[] = []
		rarities.forEach((v) =>
			attributeFilterItems.push({
				// NOTE: "rarity" trait is now "tier" on the backend
				trait: "tier",
				value: v,
				operatorValue: "contains",
			}),
		)

		setLoading(true)
		;(async () => {
			try {
				const resp = await send<{ assets: UserAsset[]; total: number }>(HubKey.AssetList721, {
					user_id: userID,
					search,
					page,
					page_size: pageSize,
					attribute_filter: {
						linkOperator: "or",
						items: attributeFilterItems,
					},
					filter: {
						linkOperator: "and",
						items: filtersItems,
					},
					sort,
				})

				if (!resp) return
				setUserAssets(resp.assets)
				setTotal(resp.total)
			} catch (e) {
				console.error(e)
				setError(typeof e === "string" ? e : "Something went wrong, please try again.")
			} finally {
				setLoading(false)
			}
		})()
	}, [user, rarities, search, username, sort, showOffWorldOnly, page, pageSize, userID, setLoading, send, setUserAssets, setTotal, setError])

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
								icon={acquisitionDir ? <ExpandLessIcon /> : acquisitionDir === false ? <ExpandMoreIcon /> : undefined}
								active={sort?.column === "created_at"}
								label={acquisitionDir !== false ? "Newest First" : "Oldest First"}
								variant="outlined"
								onClick={toggleAcquisitionSort}
							/>
							<SortChip
								icon={alphabetical ? <ExpandLessIcon /> : alphabetical === false ? <ExpandMoreIcon /> : undefined}
								active={sort?.column === "name"}
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
				</>
			)}{" "}
		</>
	)

	return <div>{renderFilters()}</div>
}
