import { Box, Typography } from "@mui/material"
import { SupremacyLogoImagePath } from "../../assets"
import { Navbar } from "../../components/home/navbar"
import { colors } from "../../theme"

export const StorePage: React.FC = () => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				overflowX: "hidden",
			}}
		>
			<Navbar
				sx={{
					marginBottom: "2rem",
				}}
			/>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					marginBottom: "2rem",
					padding: "0 2rem",
				}}
			>
				<Box
					component="img"
					src={SupremacyLogoImagePath}
					alt="Collection Logo"
					sx={{
						width: "100%",
						maxWidth: "300px",
						padding: ".5rem",
					}}
				/>
				<Typography
					variant="h1"
					sx={{
						textTransform: "uppercase",
						fontSize: "1.6rem",
						color: colors.neonPink,
					}}
				>
					Store
				</Typography>
			</Box>
		</Box>
	)
}
