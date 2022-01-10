import { Box, CircularProgress, Typography } from "@mui/material"

interface LoadingProps {
	text?: string
}

export const Loading: React.FC<LoadingProps> = ({ text }) => {
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
					{text || "Loading..."}
				</Typography>
			</Box>
		</Box>
	)
}
