import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import { Box, Link, Paper, styled, Tab, TabProps, Tabs, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { SupremacyLogoImagePath } from "../../../assets"
import { Navbar } from "../../../components/home/navbar"
import { SearchBar } from "../../../components/searchBar"
import { useAuth } from "../../../containers/auth"
import { SocketState, useWebsocket } from "../../../containers/socket"
import { useQuery } from "../../../hooks/useSend"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { Collection } from "../../../types/types"
import { CollectionItemCard } from "./collectionItemCard"

export const CollectionPage: React.VoidFunctionComponent = () => {
	const { username, collection_name } = useParams<{ username: string; collection_name: string }>()
	const history = useHistory()
	const { subscribe, state } = useWebsocket()
	const { user } = useAuth()

	const [tokenIDs, setTokenIDs] = useState<number[]>([])
	const [collection, setCollection] = useState<Collection>()
	const { loading, error, payload, query } = useQuery<{ tokenIDs: number[]; total: number }>(HubKey.AssetList, false)

	// search and filter
	const [search, setSearch] = useState("")
	const [currentTab, setCurrentTab] = useState<string>("All")

	useEffect(() => {
		if (state !== SocketState.OPEN || !collection_name) return
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

		query({
			search,
			assetType: currentTab === "All" ? "" : currentTab,
			filter: {
				linkOperator: "and",
				pageSize: 20,
				items: filtersItems,
			},
		})
	}, [user, query, collection, state, currentTab, search, username])

	// Effect: set users assets
	useEffect(() => {
		if (!payload || loading || error) return
		setTokenIDs(payload.tokenIDs)
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
				<Link
					variant="h5"
					underline="hover"
					sx={{
						alignSelf: "start",
						display: "flex",
						alignItems: "center",
						marginBottom: "1rem",
						textTransform: "uppercase",
					}}
					color={colors.white}
					component={"button"}
					onClick={() => history.goBack()}
				>
					<ChevronLeftIcon />
					Go Back
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
				{tokenIDs.length ? (
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
						{tokenIDs.map((a) => {
							return <CollectionItemCard key={a} tokenID={a} collectionName={collection_name} username={username} />
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
