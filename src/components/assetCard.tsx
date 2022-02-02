import { Box, BoxProps, styled, Typography } from "@mui/material"
import { useHistory } from "react-router-dom"
import { colors } from "../theme"
import { FancyButton } from "../components/fancyButton"
import EthLogo from "../assets/images/crypto/binance-coin-bnb-logo.svg" // TODO switch to Ethereum logo
import EpicIcon from "../assets/images/icons/badges/Epic.png"
import PlaceholderMech from "../assets/images/placeholder_mech.png"
import PlaceholderLogo from "../assets/images/Zaibatsu_Logo.svg"

import { Asset } from "../types/types"

interface AssetCardProps extends BoxProps {
	asset: Asset
}

// enum Currency {
// 	Ethereum,
// }

// enum Rarity {
// 	Epic,
// 	Legendary,
// 	Common,
// 	Anomaly,
// }

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
	const history = useHistory()
	const { name, attributes, tokenID } = asset

	let currencyLogo = EthLogo
	// if (currency === Currency.Ethereum) {
	// 	currencyLogo = EthLogo
	// }

	let rarityIcon = EpicIcon
	// if (rarity === Rarity.Epic) {
	// 	rarityIcon = EpicIcon
	// }
	// if (rarity === Rarity.Common) {
	// 	rarityIcon = CommonIcon
	// }
	// if (rarity === Rarity.Legendary) {
	// 	rarityIcon = LegendaryIcon
	// }
	// if (rarity === Rarity.Anomaly) {
	// 	rarityIcon = AnomalyIcon
	// }

	const getAssetType = (): string => {
		let output = ""

		// get asset type from attributes array
		const arr = attributes.filter((a) => a.trait_type === "Asset Type")
		if (arr && arr.length > 0) {
			output = `${arr[0].value}`
		}
		return output
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
				variant="h4"
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
					<Typography variant="h5">{getAssetType()}</Typography>
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

			{/* Currency logo + Price + rarity*/}
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
							{".69"}
						</Typography>
					</Box>
				</Box>

				<Box>
					<Box component="img" src={rarityIcon} alt="Rarity Icon" />
				</Box>
			</Box>
			<ViewPropertiesButton onClick={() => history.push("/collections/assets/" + tokenID)}>
				<Typography
					variant="h4"
					sx={{
						textTransform: "uppercase",
						width: "100%",
						maxWidth: "180px",
						whiteSpace: "nowrap",
						textAlign: "center",
					}}
				>
					View Properties
				</Typography>
			</ViewPropertiesButton>
		</Box>
	)
}

const ViewPropertiesButton = styled((props: { onClick: () => void }) => <FancyButton fancy borderColor={colors.skyBlue} {...props} />)(({ theme }) => ({
	border: `2px solid ${theme.palette.secondary.main}`,
	width: "100%",
}))
