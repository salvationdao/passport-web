import { Box, Paper, styled, Tab, TabProps, Tabs } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import SupremacyLogo from "../../../assets/images/supremacy-logo.svg"
import { AssetCard } from "../../../components/assetCard"
import { Navbar } from "../../../components/home/navbar"
import { AuthContainer } from "../../../containers/auth"
import { SocketState, useWebsocket } from "../../../containers/socket"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { Asset, Collection } from "../../../types/types"

interface Props {
	onRowClick?: (data: any) => void
	hideCreateButton?: boolean
}

export const AssetsList = (props: Props) => {
	const history = useHistory()
	const { subscribe, state } = useWebsocket()
	const { user } = AuthContainer.useContainer()
	const [assets, setAssets] = useState<Asset[]>([])
	const [collection, setCollection] = useState<Collection>()
	const [currentTab, setCurrentTab] = useState<string>("All")

	const { collection_name } = useParams<{ collection_name: string }>()

	useEffect(() => {
		console.log("name of the collection", collection_name)

		if (!collection_name || state != SocketState.OPEN) return
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

	// Effect: get and set user's collection's assets, limit to 4
	useEffect(() => {
		if (!user || !user.id || !collection || !collection.id || state != SocketState.OPEN) return
		return subscribe<{ records: Asset[]; total: number }>(
			HubKey.AssetListUpdated,
			(payload) => {
				if (!payload) return
				setAssets(payload.records)
			},
			{
				userID: user.id,
				assetType: currentTab === "All" ? "" : currentTab,
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
						// {
						// 	columnField: "user_id",
						// 	operatorValue: "=",
						// 	value: user.id,
						// },
					],
				},
			},
		)
	}, [user, subscribe, collection, state, currentTab])

	useEffect(() => {
		if (user) return

		const userTimeout = setTimeout(() => {
			history.push("/")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

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
					<StyledTab value="Weapons" label="Weapon" />
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
	color: theme.palette.text.primary,
	backgroundColor: "transparent",
	"&.Mui-selected": {
		backgroundColor: theme.palette.background.paper,
		color: theme.palette.secondary.main,
	},
}))
