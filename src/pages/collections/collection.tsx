import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import FilterAltIcon from "@mui/icons-material/FilterAlt"
import { Box, Link, Paper, styled, Tab, TabProps, Tabs, tabsClasses, Typography, useMediaQuery } from "@mui/material"
import SwipeableDrawer from "@mui/material/SwipeableDrawer"
import React, { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { SupremacyLogoImagePath } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { PleaseEnlist, WhiteListCheck } from "../../components/pleaseEnlist"
import { SearchBar } from "../../components/searchBar"
import { Sort } from "../../components/sort"
import { ENABLE_WHITELIST_CHECK } from "../../config"
import { useAuth } from "../../containers/auth"
import { SocketState, useWebsocket } from "../../containers/socket"
import { useQuery } from "../../hooks/useSend"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { CollectionItemCard } from "./collectionItemCard"

export const CollectionPage: React.VoidFunctionComponent = () => {
	const [userLoad, setUserLoad] = useState(true)
	const [assetHashes, setAssetHashes] = useState<string[]>([])
	const [canAccessStore, setCanAccessStore] = useState<{ isAllowed: boolean; message: string }>()
	const [openFilterDrawer, setOpenFilterDrawer] = React.useState(false)

	// search and filter
	const [search, setSearch] = useState("")
	const [assetType, setAssetType] = useState<string>()

	const { username } = useParams<{ username: string }>()
	const history = useHistory()
	const { state, subscribe } = useWebsocket()
	const { user } = useAuth()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
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
	const [userLoad, setUserLoad] = useState(true)

	const { displayMessage } = useSnackbar()

	const toggleAssetType = (assetType: string) => {
		setAssetType(assetType)
	}

	useEffect(() => {
		if (state !== SocketState.OPEN || !user || !user.publicAddress || userLoad) return
		return subscribe<{ isAllowed: boolean; message: string }>(
			HubKey.CheckUserCanAccessStore,
			(payload) => {
				if (userLoad) return
				setCanAccessStore(payload)
			},
			{
				walletAddress: user.publicAddress,
			},
		)
	}, [user, subscribe, state, userLoad])

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

	if (!userLoad && canAccessStore && !canAccessStore.isAllowed && ENABLE_WHITELIST_CHECK) {
		return <WhiteListCheck />
	}

	if (user && !user.faction) {
		return <PleaseEnlist />
	}

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
					<Sort assetType={assetType} search={search} setAssetHashes={setAssetHashes} />
				</SwipeableDrawer>
			)}
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
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
								Filters / Sort
							</FancyButton>
						)}
					</Box>

					<Box
						sx={{
							flex: 1,
							display: "flex",
							width: "100%",
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
									<Sort assetType={assetType} search={search} setAssetHashes={setAssetHashes} />
								</Paper>
							</Box>
						)}
						<Box
							sx={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
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
								sx={{
									maxWidth: "calc(100vw - 6rem)",
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
							{assetHashes.length > 0 ? (
								<Paper
									sx={{
										flex: 1,
										display: "grid",
										gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
										gridAutoRows: "min-content",
										gap: "1rem",
										height: "100%",
										padding: "2rem",
									}}
								>
									{assetHashes.map((a, index) => {
										return <CollectionItemCard key={`${a}-${index}`} assetHash={a} username={username} />
									})}
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
										{loading ? "Loading assets..." : error ? "An error occurred while loading assets." : "No results found."}
									</Typography>
								</Paper>
							)}
						</Box>
					</Box>
				</Box>
			</Box>
		</>
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
