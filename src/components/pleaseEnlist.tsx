import { Box, Paper, Typography } from "@mui/material"
import { GradientSafeIconImagePath } from "../assets"
import { Navbar } from "../components/home/navbar"

export const PleaseEnlist = () => {
	return (
		<Box
			sx={{
				minHeight: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Navbar
				sx={{
					marginBottom: "2rem",
				}}
			/>
			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					width: "100%",
					maxWidth: "1700px",
					margin: "0 auto",
					marginBottom: "3rem",
					padding: "0 3rem",
				}}
			>
				<Paper
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						padding: "2rem",
						textAlign: "center",
					}}
				>
					<Box
						component="img"
						src={GradientSafeIconImagePath}
						alt="Image of a Safe"
						sx={{
							height: "12rem",
							marginBottom: "1.5rem",
						}}
					/>
					<Typography
						variant="h2"
						sx={{
							textTransform: "uppercase",
							marginBottom: "1rem",
						}}
					>
						Citizen Not Enlisted
					</Typography>
					<Typography variant="body1">Enlist in a faction (using the sidebar) before entering.</Typography>
				</Paper>
			</Box>
		</Box>
	)
}
export const WhiteListCheck = () => {
	return (
		<Box
			sx={{
				minHeight: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Navbar
				sx={{
					marginBottom: "2rem",
				}}
			/>
			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					width: "100%",
					maxWidth: "1700px",
					margin: "0 auto",
					marginBottom: "3rem",
					padding: "0 3rem",
				}}
			>
				<Paper
					sx={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						padding: "2rem",
						textAlign: "center",
					}}
				>
					<Box
						component="img"
						src={GradientSafeIconImagePath}
						alt="Image of a Safe"
						sx={{
							height: "12rem",
							marginBottom: "1.5rem",
						}}
					/>

					<Typography
						variant="h2"
						sx={{
							textTransform: "uppercase",
							marginBottom: "1rem",
						}}
					>
						You must be Whitelisted to access the store
					</Typography>
				</Paper>
			</Box>
		</Box>
	)
}
