import { Box, Divider, Paper, Skeleton, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link as RouterLink, useHistory, useParams } from "react-router-dom"
import { SupremacyLogoImagePath } from "../../assets"
import { FancyButton, FancyButtonProps } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { SearchBar } from "../../components/searchBar"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { Collection, NFTOwner } from "../../types/types"
import { CollectionItemCard } from "./collectionItemCard"

export const CollectionsPage: React.FC = () => {
	const { username } = useParams<{ username: string }>()
	const history = useHistory()
	const { state, send } = useWebsocket()
	const { user } = useAuth()
	const { displayMessage } = useSnackbar()
	const [collections, setCollections] = useState<Collection[]>([])
	const [loading, setLoading] = useState(false)
	const [walletTokenIDs, setWalletTokenIDs] = useState<number[]>([])

	useEffect(() => {
		if (state !== SocketState.OPEN || !send) return
		;(async () => {
			setLoading(true)
			try {
				const resp = await send<{ records: Collection[]; total: number }>(HubKey.CollectionList)
				setCollections(resp.records)
			} catch (e) {
				displayMessage(typeof e === "string" ? e : "An error occurred while loading collection data.", "error")
			} finally {
				setLoading(false)
			}
		})()
	}, [send, state, user, displayMessage])

	useEffect(() => {
		if (state !== SocketState.OPEN || !send) return
		;(async () => {
			setLoading(true)
			try {
				const resp = await send<{ NFTOwners: NFTOwner[] }>(HubKey.WalletCollectionList)
				if (resp.NFTOwners) {
					const filter = resp.NFTOwners.filter((x) => {
						return x.owner_of === user?.publicAddress
					})

					if (!filter) return

					let itemIDs: number[] = []
					filter.forEach((item) => {
						fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/asset/${item.token_id}`).then((resp) => {
							if (resp.ok && resp.status !== 200) {
								const num = parseInt(item.token_id)
								itemIDs.push(num)
							}
						})
					})
					setWalletTokenIDs(itemIDs)
				}
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
					<Paper
						sx={{
							padding: "2rem",
						}}
					>
						{collections.map((c, i) => {
							return <CollectionPreview key={i} collection={c} username={username || user?.username || ""} walletTokenIDs={walletTokenIDs} />
						})}
					</Paper>
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
	walletTokenIDs: number[]
}

const renderCollection = (tokenIDs: number[], username: string) => {
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
			{tokenIDs.slice(0, 6).map((a) => {
				return <CollectionItemCard key={a} tokenID={a} username={username} />
			})}
		</Box>
	)
}

const CollectionPreview: React.VoidFunctionComponent<CollectionPreviewProps> = ({ collection, username, walletTokenIDs }) => {
	const { user } = useAuth()
	const { state, send } = useWebsocket()
	const [tokenIDs, setTokenIDs] = useState<number[]>([])
	const [search, setSearch] = useState("")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (state !== SocketState.OPEN || !send) return
		;(async () => {
			setLoading(true)
			try {
				const resp = await send<{ tokenIDs: number[]; total: number }>(HubKey.AssetList, {
					pageSize: 6,
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
	}, [send, state, collection, username, search])

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
					}}
				/>
				<Box flex={1} minHeight="1rem" />
				<SearchBar
					label="Search collection"
					placeholder="Search collection"
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
				<RouterLink component={StyledFancyButton} to={`/collections/${username || user?.username}/${collection.slug}`}>
					View Entire Collection
				</RouterLink>
			</Box>

			<Box>
				<Typography
					variant="h2"
					sx={{
						marginBottom: "1rem",
						"@media (max-width: 630px)": {
							textAlign: "center",
						},
					}}
				>
					On World Assets
				</Typography>
				{tokenIDs.length ? (
					renderCollection(tokenIDs, username)
				) : (
					<Box>
						<Typography variant="subtitle2" color={colors.darkGrey}>
							{loading ? "Loading assets..." : error ? error : `No owned assets from ${collection.name}.`}
						</Typography>
					</Box>
				)}
			</Box>

			<Divider sx={{ margin: "1rem 0" }} />
			<Box>
				<Typography
					variant="h2"
					sx={{
						marginBottom: "1rem",
						"@media (max-width: 630px)": {
							textAlign: "center",
						},
					}}
				>
					Off World Assets
				</Typography>
				{walletTokenIDs.length ? (
					renderCollection(walletTokenIDs, username)
				) : (
					<Box>
						<Typography variant="subtitle2" color={colors.darkGrey}>
							{loading ? "Loading assets..." : error ? error : `No owned assets from ${collection.name}.`}
						</Typography>
					</Box>
				)}
			</Box>

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
