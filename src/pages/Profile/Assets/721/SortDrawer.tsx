import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { Box, Stack, SwipeableDrawer, Typography, useMediaQuery } from "@mui/material"
import React, { Dispatch, useCallback, useEffect, useState } from "react"
import { FancyButton } from "../../../../components/fancyButton"
import { getStringFromShoutingSnakeCase } from "../../../../helpers"
import { colors } from "../../../../theme"
import { FilterChip } from "../Common/FitlerChip"
import { SortChip } from "../Common/SortChip"
import { FilterSortOptions } from "./Assets721"

interface SortDrawerProps {
	open: boolean
	setOpen: Dispatch<React.SetStateAction<boolean>>
	setFilterSortOptions: Dispatch<React.SetStateAction<FilterSortOptions>>
	pillSizeSmall?: boolean
	showOffWorldFilter?: boolean
}

export const SortDrawer = ({ open, setOpen, setFilterSortOptions, pillSizeSmall = false, showOffWorldFilter = true }: SortDrawerProps) => {
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	// Filter/sort
	const [showOffWorldOnly, setShowOffWorldOnly] = useState<boolean>()
	const [alphabetical, setAlphabetical] = useState<boolean>()
	const [sort, setSort] = useState<{ column: string; direction: string }>({ column: "name", direction: "asc" })
	const [acquisitionDir, setAcquisitionDir] = useState<boolean>()
	const [rarities, setRarities] = useState<Set<string>>(new Set())

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

	const applyFilterSort = useCallback(() => {
		setFilterSortOptions({
			sort,
			showOffWorldOnly,
			rarities,
		})
		setOpen(false)
	}, [rarities, setFilterSortOptions, setOpen, showOffWorldOnly, sort])

	return (
		<SwipeableDrawer
			open={open}
			onClose={() => setOpen(false)}
			onOpen={() => setOpen(true)}
			anchor="bottom"
			swipeAreaWidth={56}
			ModalProps={{ keepMounted: true }}
		>
			<Box sx={{ p: "2rem" }}>
				<Stack spacing="1rem">
					{showOffWorldFilter ? (
						<Box>
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
					) : (
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
										flexDirection: isWiderThan1000px && !pillSizeSmall ? "row" : "column",
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
					)}
				</Stack>

				<FancyButton
					size="small"
					sx={{ alignSelf: "flex-start", mt: "2rem", px: "2rem", color: colors.neonPink }}
					onClick={() => applyFilterSort()}
				>
					APPLY
				</FancyButton>
			</Box>
		</SwipeableDrawer>
	)
}
