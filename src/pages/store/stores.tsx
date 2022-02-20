import { Box, Link, Paper, Skeleton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link as RouterLink } from "react-router-dom"
import { SupremacyLogoImagePath } from "../../assets"
import { Navbar } from "../../components/home/navbar"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Collection, Faction } from "../../types/types"
import { StoreItemCard } from "./storeItemCard"

// Displays all stores available to the user
export const StoresPage = () => {
	const { user } = useAuth()
	const { send, state } = useWebsocket()
	const { displayMessage } = useSnackbar()
	const [collections, setCollections] = useState<Collection[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (state !== SocketState.OPEN || !send) return
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

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
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
					collections.map((c) => {
						return <StoreCollection key={c.id} collection={c} faction={user ? user.faction : undefined} />
					})
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
	const { send, state } = useWebsocket()
	const [storeItemIDs, setStoreItemIDs] = useState<string[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (state !== SocketState.OPEN || !send || !faction) return
		;(async () => {
			setLoading(true)
			try {
				const resp = await send<{ total: number; storeItemIDs: string[] }>(HubKey.StoreList, {
					pageSize: 6,
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
				setStoreItemIDs(resp.storeItemIDs)
			} catch (e) {
				setError(typeof e === "string" ? e : "An error occurred while loading items for this store.")
			} finally {
				setLoading(false)
			}
		})()
	}, [send, state, collection, faction])

	const renderCollection = () => {
		return (
			<Paper
				sx={{
					overflowX: "auto",
					display: "flex",
					padding: "2rem",
					maskImage: "linear-gradient(to right, rgba(0, 0, 0, 1) 90%, transparent 100%)",
					"& > *": {
						minWidth: "240px",
						maxWidth: "240px",
						"&:not(:last-child)": {
							marginRight: "1rem",
						},
					},
				}}
			>
				{storeItemIDs.slice(0, 5).map((a) => {
					return <StoreItemCard key={a} storeItemID={a} />
				})}
			</Paper>
		)
	}

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
				<Box
					component="img"
					src={SupremacyLogoImagePath}
					alt="Supremacy Logo"
					sx={{
						height: "1.6rem",
						marginRight: ".5rem",
					}}
				/>
				<Link
					variant="h5"
					underline="hover"
					sx={{
						marginTop: "1rem",
						textTransform: "uppercase",
						whiteSpace: "nowrap",
					}}
					color={colors.white}
					component={RouterLink}
					to={`/stores/${collection.name}`}
				>
					View Store
				</Link>
			</Box>
			{storeItemIDs.length ? (
				renderCollection()
			) : (
				<Paper
					sx={{
						marginBottom: "2rem",
						padding: "2rem",
					}}
				>
					<Typography variant="subtitle2" color={colors.darkGrey}>
						{loading ? "Loading store items..." : error ? error : `There are currently no items from ${collection.name} for sale.`}
					</Typography>
				</Paper>
			)}
		</>
	)
}
