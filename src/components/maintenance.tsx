import TwitterIcon from "@mui/icons-material/Twitter"
import YouTubeIcon from "@mui/icons-material/YouTube"
import { Box, IconButton, Link, Stack, Typography } from "@mui/material"
import { LogoWEBP } from "../assets"
import { SUPREMACY_IMAGE_FOLDER } from "../config"
import { colors } from "../theme"

export const Maintenance = () => {
	return (
		<Box
			sx={{
				position: "relative",
				width: "100vw",
				height: "100vh",
				backgroundColor: "#040B10",
				backgroundImage: `url(${SUPREMACY_IMAGE_FOLDER}/redmountainbg.webp)`,
				backgroundSize: "cover",
				backgroundPosition: "bottom",
				backgroundRepeat: "no-repeat",
			}}
		>
			<Stack
				spacing={1}
				alignItems="center"
				justifyContent="center"
				sx={{
					position: "absolute",
					top: "50%",
					left: 50,
					right: 50,
					transform: "translateY(-60%)",
					zIndex: 3,
				}}
			>
				<Link
					target="_blank"
					href={"https://supremacy.game"}
					sx={{
						width: "100%",
						height: 120,
						"@media (max-width:600px)": {
							height: 100,
						},
					}}
				>
					<Box
						sx={{
							width: "100%",
							height: "100%",
							backgroundImage: `url(${LogoWEBP})`,
							backgroundSize: "contain",
							backgroundPosition: "center",
							backgroundRepeat: "no-repeat",
						}}
					/>
				</Link>

				<Box sx={{ backgroundColor: "#00000099" }}>
					<Stack
						alignItems="center"
						justifyContent="center"
						sx={{
							px: 5,
							py: 3,
							borderRadius: 1,
							backgroundColor: "#00000099",
							"@media (max-width:600px)": {
								px: 2,
							},
						}}
					>
						<Typography
							sx={{
								color: "#FFFFFF",
								textAlign: "center",
								fontFamily: "Nostromo Regular Heavy",
								fontSize: "1.9rem",
								"@media (max-width:600px)": {
									fontSize: "5vw",
								},
							}}
						>
							{"WE'LL BE BACK SOON"}
						</Typography>

						<Typography
							sx={{
								fontFamily: "Share Tech",
								mb: ".4rem",
								color: colors.neonBlue,
								textAlign: "center",
								fontSize: "1.4rem",
								"@media (max-width:600px)": {
									fontSize: "4vw",
								},
							}}
						>
							FOLLOW OUR SOCIALS FOR MORE UPDATES
						</Typography>

						<Stack
							direction="row"
							gap="2em"
							alignItems="center"
							sx={{
								"& a": {
									color: "white",
									transition: "all .2s",
									"&:hover": {
										transform: "scale(1.2)",
									},
								},
								"& svg, & img": {
									height: "3rem",
									width: "3rem",
									transition: "all .2s",
									"@media (max-width: 1440px)": {
										height: "3rem",
										width: "3rem",
									},
									"@media (max-width: 600px)": {
										height: "2.5rem",
										width: "2.5rem",
									},
								},
							}}
						>
							<IconButton size="small" target="_blank" href="https://discord.com/invite/supremacygame">
								<img src={SUPREMACY_IMAGE_FOLDER + "/icons/discord.svg"} alt="discord" />
							</IconButton>
							<IconButton size="small" target="_blank" href="https://twitter.com/SupremacyMeta">
								<TwitterIcon />
							</IconButton>
							<IconButton size="small" target="_blank" href="https://youtube.com/supremacygame">
								<YouTubeIcon />
							</IconButton>
						</Stack>
					</Stack>
				</Box>
			</Stack>
		</Box>
	)
}
