import { Box, Paper, Typography } from "@mui/material"
import Locker from "../assets/images/locker.png"
import { Navbar } from "../components/home/navbar"

export const PleaseEnlist = () => {
	return (
		<div>
			<Navbar
				sx={{
					marginBottom: "2rem",
				}}
			/>
			<Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", margin: "2rem" }}>
				<Paper
					sx={{
						width: "100%",
						padding: "2rem",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						height: "85vh",
						justifyContent: "center",
					}}
				>
					<Box
						component="img"
						src={Locker}
						alt="Image of a Safe"
						sx={{
							height: "12rem",
							marginBottom: "1.5rem",
						}}
					/>
					<Typography variant="h2" sx={{ textTransform: "uppercase", marginBottom: "1rem" }}>
						Citizen Not Enlisted
					</Typography>

					<Box alignSelf={"center"} justifyContent={"center"}>
						<Typography variant={"body1"}>Enlist in a faction (using the sidebar) before entering.</Typography>
					</Box>
				</Paper>
			</Box>
		</div>
	)
}
