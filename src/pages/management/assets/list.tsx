import { Box, Link, Paper, styled, Tab, TabProps, Tabs, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { AssetCard } from "../../../components/assetCard"
import { Navbar } from "../../../components/home/navbar"
import { Loading } from "../../../components/loading"
import { SearchBar } from "../../../components/searchBar"
import { AuthContainer } from "../../../containers/auth"
import { SocketState, useWebsocket } from "../../../containers/socket"
import { useQuery } from "../../../hooks/useSend"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { Asset, Collection } from "../../../types/types"

export const AssetsList = () => {
	const history = useHistory()
	const { subscribe, state } = useWebsocket()
	const { user } = AuthContainer.useContainer()
	const { collection_name } = useParams<{ collection_name: string }>()
	const [assets, setAssets] = useState<Asset[]>([])
	const [collection, setCollection] = useState<Collection>()
	const { loading, error, payload, query } = useQuery<{ records: Asset[]; total: number }>(HubKey.AssetList, false)

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

	// Effect: get user's assets, apply filters
	useEffect(() => {
		if (!user || !user.id || state !== SocketState.OPEN) return

		const filtersItems: any[] = [
			// filter by user id
			{
				columnField: "user_id",
				operatorValue: "=",
				value: user.id,
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

		query({
			search: querySearch,
			userID: user.id,
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
		setAssets(payload.records)
	}, [payload, loading, error])

	useEffect(() => {
		if (user) return

		const userTimeout = setTimeout(() => {
			history.push("/")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (!user) {
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
	}

	return (
		<Box sx={{ marginBottom: "30px", marginLeft: "15px", marginRight: "15px" }}>
			<Navbar />
			<Paper
				sx={{
					width: "100%",
					maxWidth: "1768px",
					margin: "0 auto",
					borderRadius: 0,
					backgroundColor: "transparent",
				}}
			>
				<Box
					sx={{
						maxWidth: "630px",
						margin: "0 auto",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						flexDirection: "column",
					}}
				>
					{collection && (
						<Box
							sx={{
								width: "100%",
								marginBottom: "1.375rem",
								textAlign: "center",
								textTransform: "uppercase",
							}}
						>
							{/* TODO: change to collection logo once seeded */}
							<Typography variant="h1">{collection.name}</Typography>
						</Box>
					)}

					<Box
						sx={{
							width: "100%",
							marginBottom: "1.375rem",
						}}
					>
						<SearchBar
							value={search}
							onChange={(value: string) => {
								setSearch(value)
							}}
						/>
					</Box>

					{user && (
						<Link
							onClick={() => history.push(`/${user.username}/collections`)}
							sx={{
								cursor: "pointer",
								color: "white",
								textDecoration: "none",
								marginBottom: "1.375rem",
							}}
						>
							<Typography variant={"h5"}> {"< Back to Collections"} </Typography>
						</Link>
					)}
				</Box>

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
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						backgroundColor: colors.navyBlue,
					}}
				>
					{assets.map((a) => {
						return <AssetCard key={a.tokenID} asset={a} />
					})}
				</Box>
			</Paper>
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
