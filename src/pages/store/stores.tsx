import { Box, Divider, Paper, Skeleton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import { SupremacyLogoImagePath } from "../../assets"
import { FancyButton, FancyButtonProps } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { PleaseEnlist } from "../../components/pleaseEnlist"
import { SearchBar } from "../../components/searchBar"
import { useSnackbar } from "../../containers/snackbar"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Collection, Faction } from "../../types/types"
import { LootBoxCard } from "./lootBoxCard"
import { StoreItemCard } from "./storeItemCard"
import useCommands from "../../containers/ws/useCommands"
import useUser from "../../containers/useUser"

// Displays all stores available to the user
export const StoresPage = () => {
	const user = useUser()
	const { send, state } = useCommands()
	const { displayMessage } = useSnackbar()
	const [collections, setCollections] = useState<Collection[]>([])
	const [loading, setLoading] = useState(false)
	const [userLoad, setUserLoad] = useState(true)
	const [canEnter, setCanEnter] = useState(false)

	useEffect(() => {
		if (user) {
			if (!user.faction) {
				setUserLoad(false)
				return
			}
		}

		setCanEnter(true)
		setUserLoad(false)
	}, [userLoad, user])

	useEffect(() => {
		if (state !== WebSocket.OPEN || !send) return
		;(async () => {
			setLoading(true)
			try {
				const resp = await send<{ records: Collection[]; total: number }>(HubKey.CollectionList)
				setCollections(resp.records)
			} catch (e) {
				displayMessage(typeof e === "string" ? e : "An error occurred while loading store data.", "error", {
					autoHideDuration: null,
				})
			} finally {
				setLoading(false)
			}
		})()
	}, [send, state, displayMessage])

	if (!user || userLoad) {
		return <Loading text={"Getting shop data"} />
	}

	if (!userLoad && user && !user.faction) {
		return <PleaseEnlist />
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100%",
			}}
		>
			<Navbar
				sx={{
					marginBottom: "2rem",
				}}
			/>

			<Box
				sx={{
					width: "100%",
					maxWidth: "1700px",
					margin: "0 auto",
					marginBottom: "3rem",
					padding: "0 3rem",
				}}
			>
				{loading ? (
					<>
						<StoreCollectionSkeleton />
						<StoreCollectionSkeleton />
					</>
				) : (
					<Paper
						sx={{
							padding: "2rem",
						}}
					>
						{canEnter &&
							collections.map((c) => {
								return <StoreCollection key={c.id} collection={c} faction={user ? user.faction : undefined} />
							})}
					</Paper>
				)}
			</Box>
		</Box>
	)
}

const StoreCollectionSkeleton: React.VoidFunctionComponent = () => {
	return (
		<>
			<Box
				sx={{
					display: "flex",
					alignItems: "baseline",
					flexWrap: "wrap",
					marginBottom: "1rem",
				}}
			>
				<Skeleton
					variant="rectangular"
					width={220}
					height="1.8rem"
					sx={{
						marginRight: ".5rem",
					}}
				/>
				<Skeleton
					variant="rectangular"
					width={205}
					height="1.125rem"
					sx={{
						marginTop: "1rem",
					}}
				/>
			</Box>
			<Skeleton
				variant="rectangular"
				width="100%"
				height={500}
				sx={{
					marginBottom: "2rem",
					padding: "2rem",
				}}
			/>
		</>
	)
}

interface StoreCollectionProps {
	collection: Collection
	faction?: Faction
}

const StoreCollection: React.VoidFunctionComponent<StoreCollectionProps> = ({ collection, faction }) => {
	const { send, state } = useCommands()
	const [storeItemIDs, setStoreItemIDs] = useState<string[]>([])
	const [search, setSearch] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (state !== WebSocket.OPEN || !send || !faction) return
		;(async () => {
			setLoading(true)
			try {
				const resp = await send<{ total: number; store_item_ids: string[] }>(HubKey.StoreList, {
					pageSize: 5,
					search,
					filter: {
						linkOperator: "and",
						items: [
							// filter by collection id
							{
								columnField: "collection_id",
								operatorValue: "=",
								value: collection.id,
							},
							{
								columnField: "faction_id",
								operatorValue: "=",
								value: faction.id,
							},
						],
					},
				})
				setStoreItemIDs(resp.store_item_ids)
			} catch (e) {
				setError(typeof e === "string" ? e : "An error occurred while loading items for this store.")
			} finally {
				setLoading(false)
			}
		})()
	}, [send, state, collection, faction, search])

	const renderCollection = () => {
		return (
			<Box
				sx={{
					overflowX: "hidden",
					display: "grid",
					gridTemplateColumns: "repeat(6, 240px)",
					gap: "1rem",
					maskImage: "linear-gradient(to right, rgba(0, 0, 0, 1) 90%, transparent 100%)",
				}}
			>
				{collection.name === "Supremacy Genesis" && <LootBoxCard />}
				{storeItemIDs.slice(0, 5).map((a) => {
					return <StoreItemCard collection={collection} key={a} storeItemID={a} />
				})}
			</Box>
		)
	}

	return (
		<>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					flexWrap: "wrap",
					marginBottom: ".5rem",
					"@media (max-width: 630px)": {
						flexDirection: "column",
						alignItems: "stretch",
					},
				}}
			>
				<Box
					component="img"
					src={SupremacyLogoImagePath}
					alt="Supremacy Logo"
					sx={{
						height: "1.6rem",
						marginRight: ".5rem",
					}}
				/>
				<Box flex={1} minHeight="1rem" />
				<SearchBar
					label="Search store"
					placeholder="Search store"
					value={search}
					size="small"
					onChange={(value: string) => {
						setSearch(value)
					}}
					sx={{
						flexGrow: 1,
						minWidth: "200px",
						maxWidth: "800px",
					}}
				/>
			</Box>
			<Box
				sx={{
					display: "inline-block",
					marginBottom: "1rem",
					"@media (max-width: 630px)": {
						display: "block",
					},
				}}
			>
				<RouterLink component={StyledFancyButton} to={`/stores/${collection.slug}`}>
					View Collection
				</RouterLink>
			</Box>
			{storeItemIDs.length || collection.name === "Supremacy Genesis" ? (
				renderCollection()
			) : (
				<Box>
					<Typography variant="subtitle2" color={colors.darkGrey}>
						{loading ? "Loading store items..." : error ? error : `There are currently no items from ${collection.name} for sale.`}
					</Typography>
				</Box>
			)}
			<Divider
				sx={{
					display: "none",
					margin: "2rem 0",
					"&:not(:last-child)": {
						display: "block",
					},
				}}
			/>
		</>
	)
}

const StyledFancyButton = ({ navigate, ...props }: FancyButtonProps & { navigate?: any }) => <FancyButton {...props} size="small" fullWidth />
