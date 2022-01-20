import { Box, BoxProps, Button, Paper, styled, Typography } from "@mui/material"
import BottomLeftMatrix from "../assets/images/games/axie infinity.png"
import SupremacyLogo from "../assets/images/supremacy-logo.svg"
import EthLogo from "../assets/images/crypto/binance-coin-bnb-logo.svg" // fix this
import { Navbar } from "../components/home/navbar"

// rarity icons
import EpicIcon from "../assets/images/icons/badges/Epic.png" // fix this
import LegendaryIcon from "../assets/images/icons/badges/Legendary.png" // fix this
import CommonIcon from "../assets/images/icons/badges/Common.png" // fix this
import AnomalyIcon from "../assets/images/icons/badges/Anomaly.png" // fix this

export const BadgesPage: React.FC = () => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
			}}
		>
			<Navbar />
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
				{/* HEADER */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
					}}
				>
					<Typography
						variant="h3"
						sx={{
							marginBottom: "1rem",
							textAlign: "center",
							textTransform: "uppercase",
						}}
					>
						Nfts Owned
					</Typography>

					<Typography
						variant="h3"
						sx={{
							marginBottom: "1rem",
							textAlign: "center",
							textTransform: "uppercase",
						}}
					>
						Traded
					</Typography>

					<Typography
						variant="h1"
						sx={{
							marginBottom: "1rem",
							textAlign: "center",
							textTransform: "uppercase",
						}}
					>
						Badges
					</Typography>

					<Typography
						variant="h3"
						sx={{
							marginBottom: "1rem",
							textAlign: "center",
							textTransform: "uppercase",
						}}
					>
						Nfts Owned
					</Typography>

					<Typography
						variant="h3"
						sx={{
							marginBottom: "1rem",
							textAlign: "center",
							textTransform: "uppercase",
						}}
					>
						Traded
					</Typography>
				</Box>
				{/* END HEADER */}
			</Paper>

			<Paper
				sx={{
					width: "100%",
					maxWidth: "1768px",
					margin: "0 auto",
					borderRadius: 0,
					backgroundColor: "transparent",
				}}
			>
				<CollectionGroup />
				<CollectionGroup />
				<CollectionGroup />
			</Paper>
		</Box>
	)
}

const CollectionGroup: React.FC = () => {
	return (
		<Box sx={{ marginBottom: "30px", marginLeft: "15px", marginRight: "15px" }}>
			<Box sx={{ display: "flex" }}>
				<Box
					component="img"
					src={SupremacyLogo}
					alt="Background matrix image"
					sx={{
						width: 229,
						height: 25,
						marginBottom: "5px",
					}}
				/>

				<Button>
					<Typography
						variant="h4"
						sx={{
							marginBottom: "1rem",
							textAlign: "center",
							textTransform: "uppercase",
						}}
					>
						View Entire Collection
					</Typography>
				</Button>
			</Box>

			<BadgesSection>
				{/* Place holder cards */}
				<BadgeCard name="Candice mk ii" price="9999" type="War Machine" rarity={Rarity.Legendary} currency={Currency.Ethereum} />
				<BadgeCard name="Maverick" price="999" type="War Machine" rarity={Rarity.Epic} currency={Currency.Ethereum} />
				<BadgeCard name="Big Boi" price="778" type="War Machine" rarity={Rarity.Epic} currency={Currency.Ethereum} />
				<BadgeCard name="Django" price="3000" type="War Machine" rarity={Rarity.Legendary} currency={Currency.Ethereum} />
			</BadgesSection>
		</Box>
	)
}
const ViewPropertiesButton = styled((props) => <Button {...props} />)(({ theme }) => ({
	border: `2px solid ${theme.palette.secondary.main}`,
	width: "100%",
}))

const BadgesSection = styled((props) => <Box {...props} />)(({ theme }) => ({
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
interface BadgeCardProps extends BoxProps {
	name: string
	price: string
	rarity: Rarity
	type: string
	currency: Currency
}

const BadgeCard: React.FC<BadgeCardProps> = ({ name, price, rarity, type, currency }) => {
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
				border: `4px solid grey`,
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
					src={BottomLeftMatrix}
					alt="Background matrix image"
					sx={{
						width: 230,
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
						src={BottomLeftMatrix}
						alt="Background matrix image"
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
							variant="h4"
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
					variant="subtitle1"
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
