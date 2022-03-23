import { styled, InputBase } from "@mui/material"
import { colors } from "../theme"

export const PageSizeSelectionInput = styled(InputBase)(({ theme }) => ({
	padding: 2,
	borderRadius: ".5rem",
	transition: theme.transitions.create(["background-color"]),
	"&:hover": {
		backgroundColor: "rgba(255, 255, 255, .2)",
	},
	"& .MuiInputBase-input": {
		display: "flex",
		alignItems: "end",
		borderRadius: ".5rem",
		padding: 0,
		fontSize: ".9em",
		color: colors.darkGrey,
		"&:focus": {
			borderRadius: 4,
			borderColor: "#80bdff",
			boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)",
		},
	},
}))
