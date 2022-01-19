import { Box, BoxProps, Button, Paper, styled, Typography } from "@mui/material"
import BottomLeftMatrix from "../assets/images/games/axie infinity.png"
import SupremacyLogo from "../assets/images/supremacy-logo.svg"
import { Navbar } from "../components/home/navbar"

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
					maxWidth: "1100px",
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
		<Box sx={{ marginBottom: "30px" }}>
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
				<BadgeCard name="Candice mk ii" price="9999" type="War Machine" rarity="LEGENDARY" />
				<BadgeCard name="Maverick" price="999" type="War Machine" rarity="EPIC" />
				<BadgeCard name="Big Boi" price="778" type="War Machine" rarity="EPIC" />
				<BadgeCard name="Django" price="3000" type="War Machine" rarity="LEGENDARY" />
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

interface BadgeCardProps extends BoxProps {
	name: string
	price: string
	rarity: string
	type: string
}

const BadgeCard: React.FC<BadgeCardProps> = ({ name, price, rarity, type }) => {
	return (
		<Box
			sx={{
				position: "relative",
				display: "flex",
				marginLeft: "65px",
				marginTop: "50px",
				marginBottom: "50px",
				flexDirection: "column",
				alignItems: "center",
				padding: "2rem",
				border: `4px solid grey`,
				cursor: "pointer",
				width: "357px",
				height: "513px",
			}}
		>
			{/* name of badge */}
			<Typography
				variant="h3"
				sx={{
					marginBottom: "1rem",
					textAlign: "center",
					textTransform: "uppercase",
				}}
			>
				{name}
			</Typography>

			{/* image */}
			<Box
				component="img"
				src={BottomLeftMatrix}
				alt="Background matrix image"
				sx={{
					width: 300,
					height: 300,
				}}
			/>
			<Box
				sx={{
					display: "flex",
					justifyContent: "space-between",
					width: "100%",
					backgroundColor: "black",
					padding: "10px",
				}}
			>
				<Typography
					variant="h4"
					sx={{
						width: "100%",
						overflow: "hidden",
						whiteSpace: "nowrap",
						textOverflow: "ellipsis",
					}}
				>
					{type}
				</Typography>
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

			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
					paddingRight: "10px",
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						width: "100px",
						padding: "10px",
					}}
				>
					<Box
						component="img"
						src={BottomLeftMatrix}
						alt="Background matrix image"
						sx={{
							width: 30,
							height: 30,
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

				<Box
					sx={{
						width: 30,
						height: 30,
					}}
				>
					<Typography
						variant="subtitle1"
						sx={{
							width: "100%",
							whiteSpace: "nowrap",
							textOverflow: "ellipsis",
						}}
					>
						{rarity}
					</Typography>
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
