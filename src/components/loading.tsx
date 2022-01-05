import { Typography, CircularProgress } from "@mui/material"
import { Box } from "@mui/material"

export const Loading = () => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
			}}
		>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<CircularProgress />
				<Typography variant="h6" sx={{ marginTop: "10px" }}>
					Loading...
				</Typography>
			</Box>
		</Box>
	)
}
