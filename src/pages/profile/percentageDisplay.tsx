import { Box, Typography } from "@mui/material"
import { colors } from "../../theme"

interface PercentageDisplayProps {
	displayValue: string
	percentage?: number
	label: string
}

export const PercentageDisplay: React.VoidFunctionComponent<PercentageDisplayProps> = ({ displayValue, percentage, label }) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<Box
				sx={{
					position: "relative",
					width: "100%",
					maxWidth: "100px",
					minHeight: "100px",
					marginBottom: "1rem",
				}}
			>
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						borderRadius: "50%",
						backgroundColor: colors.darkerNavyBlue,
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						borderRadius: "50%",
						background: `conic-gradient(${percentage ? colors.neonPink : colors.skyBlue} calc(${percentage || 100}*1%),${colors.darkNavyBlue} 0)`,
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						transform: "scale(.8)",
						borderRadius: "50%",
						backgroundColor: percentage ? colors.darkNeonPink : colors.darkSkyBlue,
					}}
				/>
				<Typography
					variant="h5"
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
				>
					{displayValue}
				</Typography>
			</Box>
			<Typography variant="caption" textAlign="center">
				{label}
			</Typography>
		</Box>
	)
}
