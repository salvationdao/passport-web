import { Box, Link, Stack, styled, Typography } from "@mui/material"
import { SupremacyLogoImagePath } from "../../assets"
import { FancyButton, FancyButtonProps } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import OpenseaLogo from "../../assets/images/opensea_logomark_white.svg"
import { BATTLE_ARENA_LINK } from "../../config"
import { colors, fonts } from "../../theme"

export const StorePage = () => {
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
					<FancyButton
						borderColor={colors.neonPink}
						sx={{ py: ".7rem" }}
						onClick={() => window.open(`${BATTLE_ARENA_LINK}/marketplace`, "_blank")?.focus()}
					>
						<Typography sx={{ color: colors.neonPink, fontFamily: fonts.bizmoextra_bold }}>SUPREMACY MARKETPLACE</Typography>
					</FancyButton>
					<Link
						underline="none"
						color={colors.white}
						component={StyledFancyButton}
						sx={{ display: "flex", alignItems: "center", gap: "0.5rem", p: "0.5rem 1rem", pt: ".8rem" }}
						href={"https://opensea.io/collection/supremacy-genesis"}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Typography sx={{ fontFamily: fonts.bizmoextra_bold }}>GO TO BLACK MARKET</Typography>
						<img src={OpenseaLogo} style={{ height: "1.7rem", paddingBottom: ".3rem" }} alt="Open Sea logo" />
					</Link>
				</Stack>
			</Stack>
		</Stack>
	)
}

const StyledFancyButton = styled(({ navigate, ...props }: FancyButtonProps & { navigate?: any }) => (
	<FancyButton {...props} fancy borderColor={colors.skyBlue} />
))({})
