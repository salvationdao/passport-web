import { Box, BoxProps, Button, Paper, styled, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import EthLogo from "../../../assets/images/crypto/binance-coin-bnb-logo.svg" // TODO switch to Ethereum logo
import AnomalyIcon from "../../../assets/images/icons/badges/Anomaly.png"
import CommonIcon from "../../../assets/images/icons/badges/Common.png"
import EpicIcon from "../../../assets/images/icons/badges/Epic.png"
import LegendaryIcon from "../../../assets/images/icons/badges/Legendary.png"
import PlaceholderMech from "../../../assets/images/placeholder_mech.png"
import SupremacyLogo from "../../../assets/images/supremacy-logo.svg"
import PlaceholderLogo from "../../../assets/images/Zaibatsu_Logo.svg"
import { FancyButton } from "../../../components/fancyButton"
import { Navbar } from "../../../components/home/navbar"
import { Loading } from "../../../components/loading"
import { AuthContainer } from "../../../containers"
import { useWebsocket } from "../../../containers/socket"
import HubKey from "../../../keys"
import { colors } from "../../../theme"
import { Asset } from "../../../types/types"

export const CollectionsPage: React.FC = () => {
	const history = useHistory()
	const { user } = AuthContainer.useContainer()

	useEffect(() => {
		if (user) return

		const userTimeout = setTimeout(() => {
			history.push("/login")
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
					<Typography
						sx={{
							textTransform: "uppercase",
						}}
					>
						Nfts Owned
					</Typography>

					<Typography
						sx={{
							textTransform: "uppercase",
						}}
					>
						Traded
					</Typography>

					<Typography
						variant="h1"
						sx={{
							textTransform: "uppercase",
						}}
					>
						Badges
					</Typography>

					<Typography
						sx={{
							textTransform: "uppercase",
						}}
					>
						Nfts Owned
					</Typography>

					<Typography
						sx={{
							textTransform: "uppercase",
						}}
					>
						Traded
					</Typography>
				</Box>
			</Paper>

			<Paper
				sx={{
					width: "100%",
					maxWidth: "1768px",
					margin: "0 auto",
					borderRadius: 0,
					backgroundColor: "transparent",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
				}}
			>
				<CollectionAssets collection="SUPREMACY" userID={user.id} />
			</Paper>
		</Box>
	)
}

const CollectionAssets: React.FC<{ collection: string; userID: string }> = ({ collection, userID }) => {
	const history = useHistory()
	const { subscribe } = useWebsocket()
	const [assets, setAssets] = useState<Asset[]>([])

	// Effect: get and set user's collection's assets, limit to 4
	useEffect(() => {
		if (!userID) return
		return subscribe<{ records: Asset[]; total: number }>(
			HubKey.AssetListUpdated,
			(payload) => {
				if (!payload) return
				setAssets(payload.records)
			},
			{
				userID,
				filter: {
					linkOperator: "and",
					pageSize: 4,
					items: [
						{
							columnField: "collection",
							operatorValue: "=",
							value: collection,
						},
						{
							columnField: "user_id",
							operatorValue: "=",
							value: userID,
						},
					],
				},
			},
		)
	}, [userID, subscribe])

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

				<ViewCollectionButton onClick={() => history.push("/collections/" + collection)}>
					<Typography
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
					const attrObj = JSON.parse(a.attributes)
					console.log("attributes ", attrObj)

					return (
						<AssetCard
							key={a.token_id}
							name="Candice mk ii"
							price="0.9999"
							type="War Machine"
							rarity={Rarity.Legendary}
							currency={Currency.Ethereum}
						/>
					)
				})}
			</AssetsSection>
		</Box>
	)
}

const ViewPropertiesButton = styled((props) => <FancyButton fancy borderColor={colors.skyBlue} {...props} />)(({ theme }) => ({
	border: `2px solid ${theme.palette.secondary.main}`,
	width: "100%",
}))
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

const AssetsSection = styled((props) => <Box {...props} />)(({ theme }) => ({
	display: "flex",
	overflowX: "auto",
	marginBottom: "10px",
	backgroundColor: theme.palette.background.paper,
}))

enum Currency {
	Ethereum,
}

enum Rarity {
	Epic,
	Legendary,
	Common,
	Anomaly,
}
interface AssetCardProps extends BoxProps {
	name: string
	price: string
	rarity: Rarity
	type: string
	currency: Currency
}

const AssetCard: React.FC<AssetCardProps> = ({ name, price, rarity, type, currency }) => {
	let currencyLogo = EthLogo
	if (currency === Currency.Ethereum) {
		currencyLogo = EthLogo
	}

	let rarityIcon = EpicIcon
	if (rarity === Rarity.Epic) {
		rarityIcon = EpicIcon
	}
	if (rarity === Rarity.Common) {
		rarityIcon = CommonIcon
	}
	if (rarity === Rarity.Legendary) {
		rarityIcon = LegendaryIcon
	}
	if (rarity === Rarity.Anomaly) {
		rarityIcon = AnomalyIcon
	}

	return (
		<Box
			sx={{
				position: "relative",
				display: "flex",
				marginLeft: "65px",
				marginTop: "50px",
				marginBottom: "50px",
				flexDirection: "column",
				justifyContent: "space-between",
				alignItems: "center",
				padding: "2rem",
				border: `4px solid #A8A7A7`,
				cursor: "pointer",
				width: "357px",
				height: "513px",
			}}
		>
			{/* Name */}
			<Typography
				variant="h3"
				sx={{
					textAlign: "center",
					textTransform: "uppercase",
				}}
			>
				{name}
			</Typography>

			<Box
				sx={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				{/* image */}
				<Box
					component="img"
					src={PlaceholderMech}
					alt="placeholder"
					sx={{
						width: "100%",
						height: 230,
					}}
				/>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						width: "100%",
						backgroundColor: "black",
						padding: "10px",
					}}
				>
					<Typography variant="h5">{type}</Typography>
					<Box
						component="img"
						src={PlaceholderLogo}
						alt="placeholder"
						sx={{
							width: 30,
							height: 30,
						}}
					/>
				</Box>
			</Box>

			{/* Price */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Box
						component="img"
						src={currencyLogo}
						alt="Currency Logo"
						sx={{
							width: 30,
							height: 30,
							marginBottom: 1,
							marginRight: 1,
						}}
					/>
					<Box
						sx={{
							width: 30,
							height: 30,
						}}
					>
						<Typography
							variant="h5"
							sx={{
								width: "100%",
								whiteSpace: "nowrap",
								textOverflow: "ellipsis",
							}}
						>
							{price}
						</Typography>
					</Box>
				</Box>

				<Box>
					<Box component="img" src={rarityIcon} alt="Rarity Icon" />
				</Box>
			</Box>
			<ViewPropertiesButton>
				<Typography
					sx={{
						textTransform: "uppercase",
						width: "100%",
						maxWidth: "180px",
						overflow: "hidden",
						whiteSpace: "nowrap",
						textOverflow: "ellipsis",
						textAlign: "center",
					}}
				>
					View Properties
				</Typography>
			</ViewPropertiesButton>
		</Box>
	)
}
