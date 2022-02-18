import { Box, Link, Paper, Skeleton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link as RouterLink, useHistory, useParams } from "react-router-dom"
import { SupremacyLogoImagePath } from "../../assets"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Collection } from "../../types/types"
import { CollectionItemCard } from "./collectionItemCard"

export const CollectionsPage: React.FC = () => {
	const { username } = useParams<{ username: string }>()
	const history = useHistory()
	const { state, send } = useWebsocket()
	const { user } = useAuth()
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
				displayMessage(typeof e === "string" ? e : "An error occurred while loading collection data.", "error", {
					autoHideDuration: null,
				})
			} finally {
				setLoading(false)
			}
		})()
	}, [send, state, user, displayMessage])

	useEffect(() => {
		if (user || username) return

		const userTimeout = setTimeout(() => {
			history.push("/login")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history, username])

	if (!user && !username) {
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
	}

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
						<CollectionPreviewSkeleton />
						<CollectionPreviewSkeleton />
					</>
				) : (
					collections.map((c, i) => {
						return <CollectionPreview key={i} collection={c} username={username || user?.username || ""} />
					})
				)}
			</Box>
		</Box>
	)
}

const CollectionPreviewSkeleton: React.VoidFunctionComponent = () => {
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

interface CollectionPreviewProps {
	collection: Collection
	username: string
}

const CollectionPreview: React.VoidFunctionComponent<CollectionPreviewProps> = ({ collection, username }) => {
	const { user } = useAuth()
	const { state, send } = useWebsocket()
	const [tokenIDs, setTokenIDs] = useState<number[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (state !== SocketState.OPEN || !send) return
		;(async () => {
			setLoading(true)
			try {
				const resp = await send<{ tokenIDs: number[]; total: number }>(HubKey.AssetList, {
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
							// filter by user id
							{
								columnField: "username",
								operatorValue: "=",
								value: username,
							},
						],
					},
				})
				setTokenIDs(resp.tokenIDs)
			} catch (e) {
				setError(typeof e === "string" ? e : "An error occurred while loading items for this store.")
			} finally {
				setLoading(false)
			}
		})()
	}, [send, state, collection, username])

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
				{tokenIDs.slice(0, 6).map((a) => {
					return <CollectionItemCard key={a} tokenID={a} collectionName={collection.name} username={username} />
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
					to={`/collections/${username || user?.username}/${collection.name}`}
				>
					View Entire Collection
				</Link>
			</Box>
			{tokenIDs.length ? (
				renderCollection()
			) : (
				<Paper
					sx={{
						marginBottom: "2rem",
						padding: "2rem",
					}}
				>
					<Typography variant="subtitle2" color={colors.darkGrey}>
						{loading ? "Loading assets..." : error ? error : `No owned assets from ${collection.name}.`}
					</Typography>
				</Paper>
			)}
		</>
	)
}
