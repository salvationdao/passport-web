import { Box, CircularProgress, Typography } from "@mui/material"

interface LoadingProps {
	text?: string | undefined
}

export const Loading: React.FC<LoadingProps> = ({ text }) => {
	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100%",
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
				<Typography variant="h6" sx={{ marginTop: "10px", textAlign: "center" }}>
					{text || "Loading..."}
				</Typography>
			</Box>
		</Box>
	)
}
