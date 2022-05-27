import { ChipProps, Chip } from "@mui/material"
import { colors } from "../../../../theme"

interface FilterChipProps extends Omit<ChipProps, "color" | "onDelete"> {
	color?: string
	active: boolean
}

export const FilterChip = ({ color = colors.white, active, ...props }: FilterChipProps) => (
	<Chip
		variant="outlined"
		onDelete={active ? props.onClick : undefined}
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
