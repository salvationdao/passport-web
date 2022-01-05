import { styled } from "@mui/material/styles"

// Used to spread 2 or more components by using flex and space-between. eg. Use to place 2 buttons at opposing ends of a container
export const Spread = styled("div")({
	display: "flex",
	justifyContent: "space-between",
	alignItems: "center",
})
