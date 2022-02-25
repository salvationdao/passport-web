import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import { Box, Chip, ChipProps, Link, Paper, styled, Tab, TabProps, Tabs, Typography, useMediaQuery } from "@mui/material"
import SwipeableDrawer from "@mui/material/SwipeableDrawer"
import React, { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { SupremacyLogoImagePath } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { PleaseEnlist } from "../../components/pleaseEnlist"
import { SearchBar } from "../../components/searchBar"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import { useQuery } from "../../hooks/useSend"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Collection } from "../../types/types"
import { CollectionItemCard } from "./collectionItemCard"

export const CollectionPage: React.VoidFunctionComponent = () => {
	const { username } = useParams<{ username: string }>()
	const history = useHistory()
	const { state, send } = useWebsocket()
	const { user } = useAuth()

	const [assetHashes, setAssetHashes] = useState<string[]>([])
	const [collection, setCollection] = useState<Collection>()
	const [collections, setCollections] = useState<Collection[]>()
	const { loading, error, payload, query } = useQuery<{ assetHashes: string[]; total: number }>(HubKey.AssetList, false)
	const {
		loading: offWorldLoading,
		error: offWorldError,
		payload: offWorldPayload,
		query: offWorldQuery,
	} = useQuery<{ assetHashes: string[]; total: number }>(HubKey.WalletCollectionList, false)

	// search and filter
	const [search, setSearch] = useState("")
	const [sort, setSort] = useState<{ sortBy: string; sortDir: string }>()
	const [showOffWorldOnly, setShowOffWorld] = useState(false)
	const [assetType, setAssetType] = useState<string>()
	const [rarities, setRarities] = useState<Set<string>>(new Set())
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const [openFilterDrawer, setOpenFilterDrawer] = React.useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const { displayMessage } = useSnackbar()

	const toggleAssetType = (assetType: string) => {
		setAssetType(assetType)
	}

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

	const toggleOnOffWorld = (state: boolean) => {
		setShowOffWorld(state)
	}

	useEffect(() => {
		if (state !== SocketState.OPEN || !send) return
		;(async () => {
			setIsLoading(true)
			try {
				const resp = await send<{ records: Collection[]; total: number }>(HubKey.CollectionList)
				setCollections(resp.records)
			} catch (e) {
				displayMessage(typeof e === "string" ? e : "An error occurred while loading collection data.", "error")
			} finally {
				setIsLoading(false)
			}
		})()
	}, [send, state, user, displayMessage])

	useEffect(() => {
		if (state !== SocketState.OPEN) return

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

		const attributeFilterItems: any[] = []
		if (assetType && assetType !== "All") {
			attributeFilterItems.push({
				trait: "Asset Type",
				value: assetType,
				operatorValue: "contains",
			})
		}
		rarities.forEach((v) =>
			attributeFilterItems.push({
				trait: "Rarity",
				value: v,
				operatorValue: "contains",
			}),
		)

		if (showOffWorldOnly) {
			offWorldQuery({
				username,
				attributeFilter: {
					linkOperator: "and",
					items: attributeFilterItems,
				},
			})
		} else {
			query({
				search,
				attributeFilter: {
					linkOperator: "or",
					items: attributeFilterItems,
				},
				filter: {
					linkOperator: "and",
					items: filtersItems,
				},
				...sort,
			})
		}
	}, [user, query, collection, state, assetType, rarities, search, username, sort, showOffWorldOnly, offWorldQuery])

	useEffect(() => {
		if (!payload || loading || error) return
		setAssetHashes(payload.assetHashes)
	}, [payload, loading, error])

	useEffect(() => {
		if (!offWorldPayload || offWorldLoading || offWorldError) return

		setAssetHashes(Array.from(new Set(offWorldPayload.assetHashes)))
	}, [offWorldPayload, offWorldLoading, offWorldError])

	if (user && !user.faction) {
		return <PleaseEnlist />
	}

	const renderRarities = () => {
		const rarityArray: string[] = []

		for (const rarityType in colors.rarity) {
			rarityArray.push(rarityType)
		}

		return rarityArray.map((rarity) => {
			const rarityUppercase = rarity.charAt(0).toUpperCase() + rarity.slice(1)
			const rarityName = rarityUppercase.split(/(?=[A-Z])/).join(" ")
			const colorValue = colors.rarity[rarity as keyof typeof colors.rarity]

			return (
				<FilterChip
					key={rarity}
					active={rarities.has(rarityName)}
					label={rarityName}
					color={colorValue}
					variant="outlined"
					onClick={() => toggleRarity(rarityName)}
				/>
			)
		})
	}

	const renderFilters = () => (
		<>
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
					<FilterChip
						active={showOffWorldOnly}
						label="Off World Only"
						variant="outlined"
						onClick={() => {
							toggleOnOffWorld(true)
						}}
					/>
					<FilterChip
						active={!showOffWorldOnly}
						label="On World Only"
						variant="outlined"
						onClick={() => {
							toggleOnOffWorld(false)
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
								marginBottom: ".5rem",
							}}
						>
							Sort By
						</Typography>
						<Box
							sx={{
								display: "flex",
								flexDirection: isWiderThan1000px ? "column" : "row",
								flexWrap: isWiderThan1000px ? "initial" : "wrap",
								gap: ".5rem",
							}}
						>
							{(() => {
								const newSort = {
									sortBy: "created_at",
									sortDir: "asc",
								}
								return (
									<SortChip
										active={sort?.sortBy === newSort.sortBy && sort.sortDir === newSort.sortDir}
										label="Oldest first"
										variant="outlined"
										onClick={() => {
											setSort(newSort)
										}}
									/>
								)
							})()}
							{(() => {
								const newSort = {
									sortBy: "created_at",
									sortDir: "desc",
								}
								return (
									<SortChip
										active={sort?.sortBy === newSort.sortBy && sort.sortDir === newSort.sortDir}
										label="Newest first"
										variant="outlined"
										onClick={() => {
											setSort(newSort)
										}}
									/>
								)
							})()}
							{(() => {
								const newSort = {
									sortBy: "name",
									sortDir: "asc",
								}
								return (
									<SortChip
										active={sort?.sortBy === newSort.sortBy && sort.sortDir === newSort.sortDir}
										label="Name: Alphabetical"
										variant="outlined"
										onClick={() => {
											setSort(newSort)
										}}
									/>
								)
							})()}
							{(() => {
								const newSort = {
									sortBy: "name",
									sortDir: "desc",
								}
								return (
									<SortChip
										active={sort?.sortBy === newSort.sortBy && sort.sortDir === newSort.sortDir}
										label="Name: Alphabetical (reverse)"
										variant="outlined"
										onClick={() => {
											setSort(newSort)
										}}
									/>
								)
							})()}
						</Box>
					</Box>
					<Box>
						<Typography
							variant="subtitle1"
							sx={{
								marginBottom: ".5rem",
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
								marginBottom: ".5rem",
							}}
						>
							Collection
						</Typography>
						<Box
							sx={{
								display: "flex",
								flexDirection: isWiderThan1000px ? "column" : "row",
								flexWrap: isWiderThan1000px ? "initial" : "wrap",
								gap: ".5rem",
							}}
						>
							{collections?.map((c) => {
								return <FilterChip active={c.id === collection?.id} label={c.name} variant="outlined" onClick={() => toggleCollection(c)} />
							})}
						</Box>
					</Box>
				</>
			)}{" "}
		</>
	)

	return (
		<>
			{!isWiderThan1000px && (
				<SwipeableDrawer
					open={openFilterDrawer}
					onClose={() => setOpenFilterDrawer(false)}
					onOpen={() => setOpenFilterDrawer(true)}
					anchor="bottom"
					swipeAreaWidth={56}
					ModalProps={{ keepMounted: true }}
					PaperProps={{
						sx: {
							padding: "2rem",
							"& > *:not(:last-child)": {
								marginBottom: "1rem",
							},
						},
					}}
				>
					{renderFilters()}
				</SwipeableDrawer>
			)}
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
					overflowX: "hidden",
				}}
			>
				<Navbar />
				<Box
					sx={{
						display: "flex",
						width: "100%",
						flexDirection: "column",
						alignItems: "center",
						marginBottom: "2rem",
						padding: "0 2rem",
					}}
				>
					<Box
						component="img"
						src={SupremacyLogoImagePath}
						alt="Collection Logo"
						sx={{
							width: "100%",
							maxWidth: "300px",
							padding: ".5rem",
						}}
					/>
					<Typography
						variant="h1"
						sx={{
							textTransform: "uppercase",
							fontSize: "1.6rem",
							color: colors.neonPink,
						}}
					>
						Collection
					</Typography>
				</Box>
				<Box
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						width: "100%",
						maxWidth: "1700px",
						margin: "0 auto",
						marginBottom: "3rem",
						padding: "0 3rem",
						borderRadius: 0,
					}}
				>
					<Box
						sx={{
							alignSelf: "center",
							width: "100%",
							maxWidth: "600px",
							marginBottom: "2rem",
						}}
					>
						<SearchBar
							label="Search"
							placeholder={`Search this collection...`}
							value={search}
							onChange={(value: string) => {
								setSearch(value)
							}}
							fullWidth
						/>
					</Box>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "1rem",
						}}
					>
						<Link
							variant="h5"
							underline="hover"
							sx={{
								display: "flex",
								alignItems: "center",
								textTransform: "uppercase",
							}}
							color={colors.white}
							component={"button"}
							onClick={() => history.goBack()}
						>
							<ChevronLeftIcon />
							Go Back
						</Link>
						{!isWiderThan1000px && (
							<FancyButton onClick={() => setOpenFilterDrawer(true)} size="small" endIcon={<FilterAltIcon />}>
								Filters
							</FancyButton>
						)}
					</Box>

					<Box
						sx={{
							display: "flex",
							width: "100%",
							marginBottom: "3rem",
						}}
					>
						{isWiderThan1000px && (
							<Box
								sx={{
									alignSelf: "start",
									width: "340px",
								}}
							>
								<Tabs
									sx={{
										backgroundColor: "transparent",
									}}
								/>
								<Paper
									sx={{
										padding: "2rem",
										borderRadius: 0,
										"& > *:not(:last-child)": {
											marginBottom: "1rem",
										},
									}}
								>
									{renderFilters()}
								</Paper>
							</Box>
						)}
						<Box
							sx={{
								flexGrow: 1,
								minWidth: 0,
							}}
						>
							<Tabs
								value={assetType || "All"}
								onChange={(_, value) => {
									toggleAssetType(value)
								}}
								TabIndicatorProps={{
									hidden: true,
								}}
								aria-label="Filter tabs"
								variant="scrollable"
								scrollButtons="auto"
								allowScrollButtonsMobile
							>
								<StyledTab value="All" label="All" />
								<StyledTab value="Land" label="Land" />
								<StyledTab value="Pilot" label="Pilot" />
								<StyledTab value="Utility" label="Utility" />
								<StyledTab value="War Machine" label="War Machine" />
								<StyledTab value="Weapon" label="Weapons" />
							</Tabs>
							<Paper sx={{ padding: "2rem" }}>
								{
									<Box>
										{assetHashes.length > 0 ? (
											<Box
												sx={{
													flex: 1,
													display: "grid",
													gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
													gap: "1rem",
													height: "100%",
												}}
											>
												{assetHashes.map((a, index) => {
													return <CollectionItemCard key={`${a}-${index}`} assetHash={a} username={username} />
												})}
											</Box>
										) : (
											<Box
												sx={{
													flex: 1,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													height: "100%",
													padding: "2rem",
												}}
											>
												<Typography variant="subtitle2" color={colors.darkGrey}>
													{loading ? "Loading assets..." : error ? "An error occurred while loading assets." : "No results found."}
												</Typography>
											</Box>
										)}
									</Box>
								}
							</Paper>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}

interface SortChipProps extends Omit<ChipProps, "color" | "onDelete"> {
	color?: string
	active: boolean
}
export const SortChip = ({ color = colors.white, active, ...props }: SortChipProps) => (
	<Chip
		sx={{
			color: active ? colors.darkerNavyBlue : color,
			borderColor: color,
			backgroundColor: active ? color : "transparent",
			"&&:hover": {
				color: colors.darkerNavyBlue,
				backgroundColor: color,
			},
			"&&:focus": {
				boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
			},
		}}
		{...props}
	/>
)

interface FilterChipProps extends Omit<ChipProps, "color" | "onDelete"> {
	color?: string
	active: boolean
}
export const FilterChip = ({ color = colors.white, active, ...props }: FilterChipProps) => (
	<Chip
		sx={{
			color: active ? colors.darkerNavyBlue : color,
			borderColor: color,
			backgroundColor: active ? color : "transparent",
			"&&:hover": {
				color: colors.darkerNavyBlue,
				backgroundColor: color,
			},
			"&&:focus": {
				boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
				borderColor: color,
				color: active ? colors.darkerNavyBlue : color,
				backgroundColor: active ? color : "transparent",
			},
		}}
		{...props}
	/>
)

const StyledTab = styled((props: TabProps) => <Tab {...props} />)(({ theme }) => ({
	textTransform: "uppercase",
	fontSize: "1.125rem",
	color: theme.palette.text.primary,
	backgroundColor: "transparent",

	"&.Mui-selected": {
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.secondary.main,
	},
}))
