import SearchIcon from "@mui/icons-material/Search"
import { Box, Typography } from "@mui/material"
import { useHistory } from "react-router-dom"
import { GradientSafeIconImagePath, SupTokenIcon } from "../../assets"
import { colors, fonts } from "../../theme"
import { ViewButton } from "../collections/collectionItemCard"

export const LootBoxCard: React.VoidFunctionComponent = () => {
	const history = useHistory()

	return (
		<Box
			component="button"
			onClick={() => history.push(`/mystery`)}
			sx={{
				position: "relative",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				padding: "1rem",
				paddingBottom: "2rem",
				paddingRight: "2rem",
				textAlign: "center",
				font: "inherit",
				color: "inherit",
				border: "none",
				outline: "none",
				backgroundColor: "transparent",
				cursor: "pointer",
				"&:hover .ViewButton, &:focus .ViewButton": {
					borderRadius: "50%",
					backgroundColor: colors.purple,
					transform: "scale(1.6)",
					"& > *": {
						transform: "rotate(0deg)",
					},
				},
			}}
		>
			<Typography
				variant="h5"
				component="p"
				sx={{
					marginBottom: ".3rem",
					fontFamily: fonts.bizmoblack,
					fontStyle: "italic",
					letterSpacing: "2px",
					textTransform: "uppercase",
				}}
			>
				Mystery Crate
			</Typography>

			{/* image */}
			<Box
				sx={{
					position: "relative",
				}}
			>
				<Box
					component="img"
					src={GradientSafeIconImagePath}
					alt="Mech image"
					sx={{
						width: "100%",
						maxWidth: "180px",
						marginBottom: ".3rem",
					}}
				/>
			</Box>
			<Typography
				variant="body1"
				sx={{
					textTransform: "uppercase",
				}}
			>
				Special
			</Typography>
			<Typography
				variant="subtitle1"
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					letterSpacing: "1px",
				}}
			>
				<Box
					component={SupTokenIcon}
					sx={{
						height: "1rem",
						marginRight: ".2rem",
					}}
				/>
				2500
			</Typography>
			<ViewButton
				sx={{
					position: "absolute",
					right: "1rem",
					bottom: "1rem",
				}}
			>
				<SearchIcon />
			</ViewButton>
		</Box>
	)
}
