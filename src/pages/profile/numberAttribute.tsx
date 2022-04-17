import { Box, keyframes, styled, Typography } from "@mui/material"
import { colors } from "../../theme"
import { Attribute } from "../../types/types"
import { useCallback, useEffect, useState } from "react"
import { AssetStatPercentageResponse } from "../../types/purchased_item"

interface PercentageDisplayProps {
	type: string
	model?: string
	attribute: Attribute
	global: boolean
}

const radius = 45
const circumference = Math.PI * 2 * radius

export const NumberAttribute = ({ type, model, attribute, global }: PercentageDisplayProps) => {
	// const [percentile, setPercentile] = useState<number>(0)
	const [percentage, setPercentage] = useState<number>(0)
	// const [total, setTotal] = useState<number>(0)

	const getStat = useCallback(
		async (attribute: Attribute) => {
			if (!attribute.host_url) return
			try {
				const resp = await fetch(
					`${attribute.host_url}/api/stat/${type}?stat=${attribute.identifier}&value=${attribute.value}&model=${global ? "" : model || ""}`,
				)
				if (resp.status !== 200) {
					return
				}
				const stats: AssetStatPercentageResponse = await resp.json()
				// setPercentile(stats.percentile)
				setPercentage(stats.percentage)
				// setTotal(stats.total)
			} catch (e) {
				console.log(e)
			} finally {
			}
		},
		[type, model, global],
	)

	useEffect(() => {
		getStat(attribute)
	}, [attribute, getStat])

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
						r={radius}
						cx="50"
						cy="50"
						sx={{
							fill: colors.darkerNavyBlue,
							stroke: colors.neonBlue,
							strokeDasharray: `${(circumference * percentage) / 100} ${circumference}`,
							strokeWidth: 10,
							transition: "stroke-dasharray .2s ease-out",
							animation: `${generateStrokeKeyframes(percentage)} 1.5s ease-out`,
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
					{attribute.value}
				</Typography>
			</Box>
			<Typography variant="caption" textAlign="center">
				{attribute.label}
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
