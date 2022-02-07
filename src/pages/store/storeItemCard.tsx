import { Box, styled, Typography } from "@mui/material"
import { useHistory } from "react-router-dom"
import SupLogo from "../../assets/images/sup-token.svg"
import PlaceholderMech from "../../assets/images/placeholder_mech.png"
import PlaceholderLogo from "../../assets/images/Zaibatsu_Logo.svg"
import { useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { StoreItem } from "../../types/types"
import { useEffect, useState } from "react"
import { FancyButton } from "../../components/fancyButton"
import { colors } from "../../theme"
import { getItemAttributeValue, supFormatter } from "../../helpers/items"

export const StoreItemCard = ({ storeItemID }: { storeItemID: string }) => {
	const { subscribe } = useWebsocket()
	const [item, setItem] = useState<StoreItem>()
	const { push } = useHistory()

	useEffect(() => {
		if (!subscribe) return
		return subscribe<StoreItem>(
			HubKey.StoreItemSubscribe,
			(payload) => {
				setItem(payload)
			},
			{ storeItemID: storeItemID },
		)
	}, [subscribe, storeItemID])

	if (!item) {
		return <>Loading</>
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
				{item?.name}
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
					<Typography variant="h5">{getItemAttributeValue(item.attributes, "Name")}</Typography>
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
						src={SupLogo}
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
							{supFormatter(item.supCost)}
						</Typography>
					</Box>
				</Box>

				<Typography variant="h5">{getItemAttributeValue(item.attributes, "Rarity")}</Typography>
			</Box>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
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
					Stock
				</Typography>
				<Typography
					variant="h4"
					sx={{
						width: "100%",
						whiteSpace: "nowrap",
						textOverflow: "ellipsis",
					}}
				>
					{item.amountSold} / {item.amountAvailable}
				</Typography>
			</Box>
			<ViewItemButton onClick={() => push("/store/" + item?.ID)}>
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
					View Item
				</Typography>
			</ViewItemButton>
		</Box>
	)
}

const ViewItemButton = styled((props: { onClick: () => void }) => <FancyButton fancy borderColor={colors.skyBlue} {...props} />)(({ theme }) => ({
	border: `2px solid ${theme.palette.secondary.main}`,
	width: "100%",
}))
