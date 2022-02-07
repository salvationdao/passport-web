import { Box, Button, Paper, styled, Typography } from "@mui/material"
import { useHistory } from "react-router-dom"
import SupremacyLogo from "../../assets/images/supremacy-logo.svg"
import { Loading } from "../../components/loading"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Collection, Faction } from "../../types/types"
import { StoreItemCard } from "./storeItemCard"
import { useAuth } from "../../containers/auth"
import { SocketState, useWebsocket } from "../../containers/socket"
import { useEffect, useState } from "react"
import { Navbar } from "../../components/home/navbar"

export const StorePage = () => {
	const history = useHistory()
	const { user } = useAuth()
	const { send, state } = useWebsocket()
	const [collections, setCollections] = useState<Collection[]>([])
	// TODO: handle loading and error state
	// const { loading, error, payload } = useQuery<{ records: Collection[]; total: number }>(HubKey.CollectionList, true)

	useEffect(() => {
		if (state !== SocketState.OPEN || !send) return
		;(async () => {
			try {
				const resp = await send<{ records: Collection[]; total: number }>(HubKey.CollectionList)
				setCollections(resp.records)
			} catch {
			} finally {
			}
		})()
	}, [send, state])

	//
	// // Effect: set user's store's
	// useEffect(() => {
	// 	if (!payload || loading || error) return
	// 	setCollections(payload.records)
	// }, [payload, loading, error])

	if (!user) {
		console.log("not here?")
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
	}

	// if (!user.faction || !user.faction){
	// 	return <Loading text="no faction"/>
	// }

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",

				// minHeight: "100vh",
			}}
		>
			<Navbar />

			{/* Header */}
			<Paper
				sx={{
					width: "100%",
					maxWidth: "1000px",
					margin: "1rem",
					marginBottom: "2rem",
					padding: "2rem",
					borderRadius: 0,
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					{/*<HeaderStat label={"For "} value={"45"} />*/}

					<Typography
						variant="h1"
						sx={{
							textTransform: "uppercase",
						}}
					>
						Store
					</Typography>
					{/*<HeaderStat label={"Sold"} value={"45"} />*/}
				</Box>
			</Paper>

			<Paper
				sx={{
					width: "100%",
					maxWidth: "100%",
					margin: "0 auto",
					backgroundColor: "transparent",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				{collections.map((c) => {
					return <StoreCollectionItems key={c.id} collection={c} faction={user ? user.faction : undefined} />
				})}
			</Paper>
		</Box>
	)
}

const StoreCollectionItems = ({ collection, faction }: { collection: Collection; faction: Faction | undefined }) => {
	const history = useHistory()
	// TODO: handle loading and asset state
	const { send, state } = useWebsocket()
	const [items, setItems] = useState<string[]>([])

	useEffect(() => {
		console.log(faction)
		if (state !== SocketState.OPEN || !send || !faction) return
		;(async () => {
			try {
				console.log({
					collectionID: collection.id,
					factionID: faction.id,
					page: 0,
					pageSize: 10,
				})
				const resp = await send<string[]>(HubKey.StoreList, {
					collectionID: collection.id,
					factionID: faction.id,
					page: 0,
					pageSize: 10,
				})
				setItems(resp)
			} catch {
			} finally {
			}
		})()
	}, [send, state, collection, faction])

	return (
		<Box>
			<Box sx={{ display: "flex" }}>
				<Box
					component="img"
					src={SupremacyLogo}
					alt="Store Logo"
					sx={{
						width: 229,
						height: 25,
						marginBottom: "5px",
					}}
				/>

				<ViewStoreButton onClick={() => history.push(`/store/${collection.name}`)}>
					<Typography
						variant="h4"
						sx={{
							textAlign: "center",
							textTransform: "uppercase",
						}}
					>
						View Entire Store
					</Typography>
				</ViewStoreButton>
			</Box>

			<ItemSection>
				{items.map((a) => {
					return <StoreItemCard key={a} storeItemID={a} />
				})}
			</ItemSection>
		</Box>
	)
}

const ViewStoreButton = styled((props: { onClick: () => void }) => <Button {...props} />)(({ theme }) => ({
	"&:hover": {
		color: theme.palette.primary.main,

		"&::before": {
			opacity: 0.4,
		},
		"&::after": {
			opacity: 0.2,
			transitionDelay: ".1s",
		},
	},
}))

const HeaderStat: React.FC<{ label: string; value: string }> = ({ label, value }) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				textAlign: "center",
			}}
		>
			<Typography
				color={colors.neonPink}
				variant="h2"
				sx={{
					textTransform: "uppercase",
				}}
			>
				{value}
			</Typography>
			<Typography
				sx={{
					textTransform: "uppercase",
					fontSize: "1.4rem",
				}}
			>
				{label}
			</Typography>
		</Box>
	)
}

const ItemSection = styled((props) => <Box {...props} />)(({ theme }) => ({
	display: "flex",
	overflowX: "auto",
	marginBottom: "10px",
	backgroundColor: theme.palette.background.paper,
}))
