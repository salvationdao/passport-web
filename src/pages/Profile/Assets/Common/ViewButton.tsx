import { Box, BoxProps } from "@mui/material"
import { colors } from "../../../../theme"

export const ViewButton = (props: BoxProps) => (
	<Box
		{...props}
		className="view-button"
		sx={{
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			height: "2.6rem",
			width: "2.6rem",
			backgroundColor: "#00000099",
			border: `3px solid ${colors.purple}99`,
			color: "inherit",
			font: "inherit",
			transform: "rotate(45deg)",
			transition: "transform .2s ease-out, border-radius .2s ease-out, background-color .2s ease-out",
			"& > *": {
				transition: "transform .2s ease-out",
				transform: "rotate(-45deg)",
			},
			...props.sx,
		}}
	/>
)
