import { Box, Button, Paper, styled, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import SupremacyLogo from "../../../assets/images/supremacy-logo.svg"
import { AssetCard } from "../../../components/assetCard"
import { Navbar } from "../../../components/home/navbar"
import { Loading } from "../../../components/loading"
import { AuthContainer } from "../../../containers"
import { useQuery } from "../../../hooks/useSend"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { Asset, Collection, User } from "../../../types/types"

export const CollectionsPage: React.FC = () => {
	const history = useHistory()
	const { user } = AuthContainer.useContainer()
	const [collections, setCollections] = useState<Collection[]>([])
	const { loading, error, payload, query } = useQuery<{ records: Collection[]; total: number }>(HubKey.CollectionList, false)

	// Effect: get user's collection's
	useEffect(() => {
		if (!user || !user.id) return
		query({
			userID: user?.id || "",
			filter: {
				linkOperator: "and",
				items: [
					// filter by user id
					{
						columnField: "user_id",
						operatorValue: "=",
						value: user?.id || "",
					},
				],
			},
		})
	}, [user, query])

	// Effect: set user's collection's
	useEffect(() => {
		if (!payload || loading || error) return
		setCollections(payload.records)
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
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<Navbar />

			{/* Header */}
			<Paper
				sx={{
					width: "100%",
					maxWidth: "1000px",
					margin: "0 auto",
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
					<HeaderStat label={"NFTs Owned"} value={"45"} />

					<Typography
						variant="h1"
						sx={{
							textTransform: "uppercase",
						}}
					>
						Badges
					</Typography>
					<HeaderStat label={"Traded"} value={"45"} />
				</Box>
			</Paper>

			<Paper
				sx={{
					width: "100%",
					maxWidth: "1768px",
					margin: "0 auto",
					borderRadius: "0",
					backgroundColor: "transparent",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				{collections.map((c, i) => {
					return <CollectionAssets key={i} collection={c} user={user} />
				})}
			</Paper>
		</Box>
	)
}

const CollectionAssets: React.FC<{ collection: Collection; user: User }> = ({ collection, user }) => {
	const history = useHistory()
	const { loading, error, payload, query } = useQuery<{ records: Asset[]; total: number }>(HubKey.AssetList, false)
	const [assets, setAssets] = useState<Asset[]>([])

	// Effect: get user's collection's assets, limit to 4
	useEffect(() => {
		if (!user.id) return
		query({
			userID: user.id,
			filter: {
				linkOperator: "and",
				pageSize: 4,
				items: [
					// filter by collection id
					{
						columnField: "collection_id",
						operatorValue: "=",
						value: collection.id,
					},
					// filter by user id
					{
						columnField: "user_id",
						operatorValue: "=",
						value: user.id,
					},
				],
			},
		})
	}, [user.id, query, collection.id])

	// Effect: set user's collection's assets
	useEffect(() => {
		if (error || loading || !payload) return
		setAssets(payload.records)
	}, [payload, error, loading])

	return (
		<Box sx={{ marginBottom: "30px", marginLeft: "15px", marginRight: "15px" }}>
			<Box sx={{ display: "flex" }}>
				<Box
					component="img"
					src={SupremacyLogo}
					alt="Collection Logo"
					sx={{
						width: 229,
						height: 25,
						marginBottom: "5px",
					}}
				/>

				<ViewCollectionButton onClick={() => history.push(`/${user.username}/collections/${collection.name}`)}>
					<Typography
						variant="h4"
						sx={{
							textAlign: "center",
							textTransform: "uppercase",
						}}
					>
						View Entire Collection
					</Typography>
				</ViewCollectionButton>
			</Box>

			<AssetsSection>
				{assets.map((a) => {
					return <AssetCard key={a.tokenID} asset={a} />
				})}
			</AssetsSection>
		</Box>
	)
}

const ViewCollectionButton = styled((props: { onClick: () => void }) => <Button {...props} />)(({ theme }) => ({
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

const AssetsSection = styled((props) => <Box {...props} />)(({ theme }) => ({
	display: "flex",
	overflowX: "auto",
	marginBottom: "10px",
	backgroundColor: theme.palette.background.paper,
}))
