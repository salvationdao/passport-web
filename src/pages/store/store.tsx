import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import {
	Box,
	Collapse,
	Link,
	MenuItem,
	Pagination,
	Paper,
	Select,
	styled,
	SwipeableDrawer,
	Tab,
	TabProps,
	Tabs,
	tabsClasses,
	Typography,
	useMediaQuery,
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { SupremacyLogoImagePath } from "../../assets"
import OpenseaLogo from "../../assets/images/opensea_logomark_white.svg"
import { FancyButton, FancyButtonProps } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { PleaseEnlist } from "../../components/pleaseEnlist"
import { SearchBar } from "../../components/searchBar"
import { PageSizeSelectionInput } from "../../components/pageSizeSelectionInput"
import { useAuth } from "../../containers/auth"
import { useQuery } from "../../hooks/useSend"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Collection } from "../../types/types"
import { FilterChip, SortChip } from "../profile/profile"
import { LootBoxCard } from "./lootBoxCard"
import { StoreItemCard } from "./storeItemCard"
import useCommands from "../../containers/useCommands"

export const StorePage: React.FC = () => {
	const { collection_slug } = useParams<{ collection_slug: string }>()
	const history = useHistory()
	const { state, send } = useCommands()
	const { user } = useAuth()

	const [storeItemIDs, setStoreItemIDs] = useState<string[]>([])
	const [collection, setCollection] = useState<Collection>()
	const { loading: queryLoading, error, payload, query } = useQuery<{ total: number; store_item_ids: string[] }>(HubKey.StoreList, false)
	const [tabLoading, setTabLoading] = useState(true)

	// search and filter
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(20)
	const [total, setTotal] = useState(0)
	const [search, setSearch] = useState("")
	const [sort, setSort] = useState<{ sortBy: string; sortDir: string }>()
	const [assetType, setAssetType] = useState<string>()
	const [rarities, setRarities] = useState<Set<string>>(new Set())
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const [openFilterDrawer, setOpenFilterDrawer] = React.useState(false)
	const [userLoad, setUserLoad] = useState(true)

	const toggleAssetType = (assetType: string) => {
		setAssetType(assetType)
		setTabLoading(true)
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

	useEffect(() => {
		if (state !== WebSocket.OPEN || !collection_slug) return
		send<Collection>(HubKey.CollectionUpdated, {
			slug: collection_slug,
		}).then((collection) => {
			setCollection(collection)
		})
	}, [collection_slug, state])

	useEffect(() => {
		if (user) {
			if (!user.faction) {
				setUserLoad(false)
				return
			}
		}

		setUserLoad(false)
	}, [userLoad, user])

	useEffect(() => {
		const filtersItems: any[] = []

		if (collection && collection.id) {
			filtersItems.push({
				// filter by collection id
				columnField: "collection_id",
				operatorValue: "=",
				value: collection.id,
			})
		}

		filtersItems.push({
			columnField: "faction_id",
			operatorValue: !user?.faction_id ? "isnull" : "=",
			value: user?.faction_id,
		})

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
				trait: "tier",
				value: v,
				operatorValue: "contains",
			}),
		)

		query({
			search,
			page: currentPage - 1,
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
		}).then(() => {
			setTabLoading(false)
		})
	}, [user, query, collection, state, assetType, rarities, currentPage, pageSize, search, sort])

	useEffect(() => {
		if (!payload || queryLoading || error) return
		setStoreItemIDs(payload.store_item_ids)
		setTotal(payload.total)
	}, [payload, queryLoading, error])

	if (user && !user.faction) {
		return <PleaseEnlist />
	}

	const loading = tabLoading || queryLoading

	const showLootBox = collection?.name === "Supremacy Genesis" && (!assetType || assetType === "All") && currentPage === 1

	const renderFilters = () => (
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
					<FilterChip active={rarities.has("Colossal")} label="Colossal" color={colors.rarity.COLOSSAL} onClick={() => toggleRarity("Colossal")} />
					<FilterChip
						active={rarities.has("Legendary")}
						label="Legendary"
						color={colors.rarity.LEGENDARY}
						onClick={() => toggleRarity("Legendary")}
					/>
					<FilterChip
						active={rarities.has("Elite Legendary")}
						label="Elite Legendary"
						color={colors.rarity.ELITE_LEGENDARY}
						onClick={() => toggleRarity("Elite Legendary")}
					/>
					<FilterChip
						active={rarities.has("Ultra Rare")}
						label="Ultra Rare"
						color={colors.rarity.ULTRA_RARE}
						onClick={() => toggleRarity("Ultra Rare")}
					/>
					<FilterChip active={rarities.has("Exotic")} label="Exotic" color={colors.rarity.EXOTIC} onClick={() => toggleRarity("Exotic")} />
					<FilterChip active={rarities.has("Guardian")} label="Guardian" color={colors.rarity.GUARDIAN} onClick={() => toggleRarity("Guardian")} />
					<FilterChip active={rarities.has("Mythic")} label="Mythic" color={colors.rarity.MYTHIC} onClick={() => toggleRarity("Mythic")} />
					<FilterChip active={rarities.has("Deus ex")} label="Deus ex" color={colors.rarity.DEUS_EX} onClick={() => toggleRarity("Deus ex")} />
					<FilterChip active={rarities.has("Titan")} label="Titan" color={colors.rarity.TITAN} onClick={() => toggleRarity("Titan")} />
				</Box>
			</Box>
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
					overflowX: "hidden",
				}}
			>
				<Navbar
					sx={{
						marginBottom: "2rem",
					}}
				/>
				<Box
					sx={{
						display: "flex",
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
							marginBottom: "1rem",
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
						<FancyButton onClick={() => setOpenFilterDrawer((prev) => !prev)} size="small" endIcon={<FilterAltIcon />}>
							Filters / Sort
						</FancyButton>
					</Box>

					<Box
						sx={{
							flex: 1,
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							width: "100%",
						}}
					>
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								width: "100%",
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
								variant={isWiderThan1000px ? "standard" : "scrollable"}
								scrollButtons="auto"
								allowScrollButtonsMobile
								sx={{
									[`& .${tabsClasses.scrollButtons}`]: {
										"&.Mui-disabled": { opacity: 0.3 },
									},
								}}
							>
								<StyledTab value="All" label="All" />
								<StyledTab value="Land" label="Land" />
								<StyledTab value="Pilot" label="Pilot" />
								<StyledTab value="Utility" label="Utility" />
								<StyledTab value="War Machine" label="War Machine" />
								<StyledTab value="Weapon" label="Weapons" />
							</Tabs>
						</Box>

						<Box
							sx={{
								flex: 1,
								display: "flex",
								// flexDirection: "column",
								minWidth: 0,
							}}
						>
							{isWiderThan1000px && (
								<Collapse in={openFilterDrawer} orientation={"horizontal"}>
									<Box
										sx={{
											alignSelf: "start",
											width: "340px",
										}}
									>
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
								</Collapse>
							)}
							{!loading && (storeItemIDs.length || showLootBox) ? (
								<Paper
									sx={{
										flex: 1,
										padding: "2rem",
									}}
								>
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
											gridAutoRows: "min-content",
											gap: "1rem",
										}}
									>
										{showLootBox && <LootBoxCard />}
										{collection &&
											storeItemIDs.map((a) => {
												return <StoreItemCard collection={collection} key={a} storeItemID={a} />
											})}
									</Box>
								</Paper>
							) : (
								<Paper
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
										{loading ? "Loading store items..." : error ? "An error occurred while loading store items." : "No results found."}
									</Typography>
								</Paper>
							)}
						</Box>

						<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
							<Select
								value={pageSize}
								onChange={(e) => {
									setPageSize(typeof e.target.value === "number" ? e.target.value : parseInt(e.target.value))
									setCurrentPage(1)
								}}
								input={<PageSizeSelectionInput />}
							>
								<MenuItem value={5}>Showing 5 results per page</MenuItem>
								<MenuItem value={10}>Showing 10 results per page</MenuItem>
								<MenuItem value={20}>Showing 20 results per page</MenuItem>
								<MenuItem value={50}>Showing 50 results per page</MenuItem>
								<MenuItem value={100}>Showing 100 results per page</MenuItem>
							</Select>
							<Pagination
								page={currentPage}
								count={Math.ceil(total / pageSize)}
								color="primary"
								onChange={(_, newPageNumber) => setCurrentPage(newPageNumber)}
							/>
						</Box>

						{collection && <BlackMarketCTA mint_contract={collection.mint_contract} />}
					</Box>
				</Box>
			</Box>
		</>
	)
}

const BlackMarketCTA = ({ mint_contract }: { mint_contract: string }) => {
	const openseaURL =
		mint_contract === "0xEEfaF47acaa803176F1711c1cE783e790E4E750D"
			? `https://testnets.opensea.io/collection/supremacy-genesis-v4`
			: `https://opensea.io/collection/supremacy-genesis`
	return (
		<Box
			sx={{
				flexDirection: "column",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				marginTop: "2rem",
			}}
		>
			<Typography
				sx={{
					marginBottom: ".5rem",
				}}
			>
				Looking for other factions?
			</Typography>
			<Link
				underline="none"
				color={colors.white}
				component={StyledFancyButton}
				sx={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 2rem", height: "4rem" }}
				href={openseaURL}
				target="_blank"
				rel="noopener noreferrer"
			>
				Check out the black market.
				<img src={OpenseaLogo} style={{ maxHeight: "100%" }} alt="Open Sea logo" />
			</Link>
		</Box>
	)
}

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

const StyledFancyButton = styled(({ navigate, ...props }: FancyButtonProps & { navigate?: any }) => (
	<FancyButton {...props} fancy borderColor={colors.skyBlue} />
))({})
