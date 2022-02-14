import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { Box, Link, Paper, styled, Tab, TabProps, Tabs, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link as RouterLink, useParams } from "react-router-dom"
import { SupremacyLogoImagePath } from "../../assets"
import { Navbar } from "../../components/home/navbar"
import { SearchBar } from "../../components/searchBar"
import { useAuth } from "../../containers/auth"
import { SocketState, useWebsocket } from "../../containers/socket"
import { useQuery } from "../../hooks/useSend"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Collection } from "../../types/types"
import { StoreItemCard } from "./storeItemCard"

export const StorePage: React.FC = () => {
	const { collection_name } = useParams<{ collection_name: string }>()
	const { subscribe, state } = useWebsocket()
	const { user } = useAuth()

	const [storeItemIDs, setStoreItemIDs] = useState<string[]>([])
	const [collection, setCollection] = useState<Collection>()
	const { loading, error, payload, query } = useQuery<{ total: number; storeItemIDs: string[] }>(HubKey.StoreList, false)

	// search and filter
	const [search, setSearch] = useState("")
	const [querySearch, setQuerySearch] = useState("")
	const [currentTab, setCurrentTab] = useState<string>("All")

	useEffect(() => {
		const t = setTimeout(() => {
			setQuerySearch(search)
		}, 350)
		return () => clearTimeout(t)
	}, [search])

	// Effect: gets collection
	useEffect(() => {
		if (!collection_name || state !== SocketState.OPEN) return
		return subscribe<Collection>(
			HubKey.CollectionUpdated,
			(payload) => {
				if (!payload) return
				setCollection(payload)
			},
			{
				name: collection_name,
			},
		)
	}, [collection_name, subscribe, state])

	// Effect: get store items, apply filters
	useEffect(() => {
		if (state !== SocketState.OPEN) return

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
			operatorValue: "=",
			value: user?.factionID,
		})

		query({
			search: querySearch,
			assetType: currentTab === "All" ? "" : currentTab,
			filter: {
				linkOperator: "and",
				pageSize: 20,
				items: filtersItems,
			},
		})
	}, [user, query, collection, state, currentTab, querySearch])

	// Effect: set users assets
	useEffect(() => {
		if (!payload || loading || error) return
		setStoreItemIDs(payload.storeItemIDs)
	}, [payload, loading, error])

	return (
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
				<Link
					variant="h5"
					underline="hover"
					sx={{
						alignSelf: "start",
						display: "flex",
						alignItems: "center",
						marginBottom: "2rem",
						textTransform: "uppercase",
					}}
					color={colors.white}
					component={RouterLink}
					to={`/stores`}
				>
					<ChevronLeftIcon />
					Back to store list
				</Link>

				{/* Filter tabs */}
				<Tabs
					value={currentTab}
					onChange={(_, value) => {
						setCurrentTab(value)
					}}
					aria-label="Filter tabs"
					variant="fullWidth"
					TabIndicatorProps={{
						hidden: true,
					}}
				>
					<StyledTab value="All" label="All" />
					<StyledTab value="Land" label="Land" />
					<StyledTab value="Pilot" label="Pilot" />
					<StyledTab value="Utility" label="Utility" />
					<StyledTab value="War Machine" label="War Machine" />
					<StyledTab value="Weapon" label="Weapons" />
				</Tabs>
				{storeItemIDs.length ? (
					<Paper
						sx={{
							flex: 1,
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
							gap: "1rem",
							height: "100%",
							padding: "2rem",
						}}
					>
						{storeItemIDs.map((a) => {
							return <StoreItemCard key={a} collectionName={collection_name} storeItemID={a} />
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
							{loading ? "Loading store items..." : error ? "An error occurred while loading store items." : "No results found."}
						</Typography>
					</Paper>
				)}
			</Box>
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
