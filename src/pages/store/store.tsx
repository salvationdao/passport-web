import { Box, Stack, Typography } from "@mui/material"
import { SupremacyLogoImagePath } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { BATTLE_ARENA_LINK } from "../../config"
import { colors, fonts } from "../../theme"

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

			<Stack sx={{ flex: 1, position: "relative" }}>
				<Stack
					spacing=".8rem"
					sx={{
						position: "absolute",
						left: "50%",
						top: "calc(50% - 7rem)",
						transform: "translate(-50%, -50%)",
						px: "3rem",
						py: "2rem",
						backgroundColor: colors.darkNavyBlue,
						boxShadow: 3,
					}}
				>
					<Typography variant="h3" sx={{ textAlign: "center" }}>
						XSYN STORE IS CLOSED
					</Typography>
					<Typography variant="h6" sx={{ textAlign: "center" }}>
						Go to Supremacy Marketplace to purchase assets
					</Typography>
					<FancyButton borderColor={colors.neonPink} onClick={() => window.open(`${BATTLE_ARENA_LINK}/marketplace`, "_blank")?.focus()}>
						<Typography sx={{ color: colors.neonPink, fontFamily: fonts.bizmoextra_bold }}>SUPREMACY MARKETPLACE</Typography>
					</FancyButton>
				</Stack>
			</Stack>
		</Stack>
	)
}
