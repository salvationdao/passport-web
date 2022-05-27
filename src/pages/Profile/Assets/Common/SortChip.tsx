import { ChipProps, Chip } from "@mui/material"
import { colors } from "../../../../theme"

interface SortChipProps extends Omit<ChipProps, "color" | "onDelete"> {
	color?: string
	active: boolean
}

export const SortChip = ({ color = colors.white, active, ...props }: SortChipProps) => (
	<Chip
		variant="outlined"
		sx={{
			color: active ? colors.darkerNavyBlue : color,
			borderColor: color,
			backgroundColor: active ? color : "transparent",
			"&:hover": {
				color: colors.darkerNavyBlue,
				backgroundColor: color,
			},
			"&:focus": {
				boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
			},
		}}
		{...props}
	/>
)
