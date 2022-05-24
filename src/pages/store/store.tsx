import { Box, Stack, Typography } from "@mui/material"
import { SupremacyLogoImagePath } from "../../assets"
import { Navbar } from "../../components/home/navbar"
import { colors } from "../../theme"

export const StorePage: React.FC = () => {
	return (
		<Stack spacing="2rem" sx={{ height: "100%", overflowX: "hidden" }}>
			<Navbar />
			<Stack alignItems="center" sx={{ mb: "2rem", p: "0 2rem" }}>
				<Box
					component="img"
					src={SupremacyLogoImagePath}
					alt="Collection Logo"
					sx={{
						width: "100%",
						maxWidth: "300px",
						p: ".5rem",
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
			</Stack>

			<Stack alignItems="center" justifyContent="center" sx={{ flex: 1 }}>
				<Stack sx={{ backgroundColor: "red" }}>
					<Typography>aaaaa</Typography>
				</Stack>
			</Stack>
		</Stack>
	)
}
