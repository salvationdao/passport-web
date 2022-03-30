import { Box, keyframes, styled, Typography } from "@mui/material"
import { colors } from "../../theme"

interface PercentageDisplayProps {
	displayValue: string
	percentage: number
	label: string
}

const radius = 22.5
const circumference = Math.PI * 2 * radius

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
				<StyledSVG
					width="100"
					height="100"
					sx={{
						transform: "rotate(-90deg)",
					}}
				>
					<StyledCircle
						r="50"
						cx="50"
						cy="50"
						sx={{
							fill: colors.lightNavyBlue,
						}}
					/>
					<StyledCircle
						r="45"
						cx="50"
						cy="50"
						sx={{
							fill: colors.darkerNavyBlue,
							stroke: colors.neonBlue,
							strokeDasharray: `${(circumference * percentage) / 100} ${circumference}`,
							strokeWidth: 10,
							transition: "stroke-dasharray .2s ease-out",
							animation: `${generateStrokeKeyframes(percentage)} 1s ease-out`,
						}}
					/>
				</StyledSVG>
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

const StyledSVG = styled("svg")({})

const StyledCircle = styled("circle")({})

const generateStrokeKeyframes = (percentage: number) => {
	return keyframes`
	0% {
	  stroke-dasharray: 0;
	}
	100% {
		stroke-dasharray: ${(circumference * percentage) / 100} ${circumference};
	}
  `
}
