import { Box, Typography } from "@mui/material"
import SVG from "react-inlinesvg"
import { Link } from "react-router-dom"

import LogoImage from "../assets/images/NinjaSoftwareLogo.svg"
import LogoTitle from "../assets/images/NinjaSoftwareTitle.svg"
/**
 * Displays a Logo on the Page
 */
export const Logo = ({ subtitle }: { subtitle?: string }) => {
	return (
		<Box
			component={Link}
			to={"/"}
			sx={{
				display: "flex",
				alignItems: "center",
				width: "50%",
				minWidth: "250px",
				maxWidth: "500px",
				position: "relative",
			}}
			style={{ textDecoration: "none" }}
		>
			<Box component={SVG} src={LogoImage} sx={{ width: "30%", marginRight: "1rem" }} />
			<Box component={SVG} src={LogoTitle} sx={{ width: "70%", color: "white", marginRight: "16px" }} />
			{!!subtitle && (
				<Typography
					variant="subtitle1"
					sx={{
						color: "white",
						fontWeight: 600,
						position: "absolute",
						right: "20px",
						marginTop: "60px",
					}}
				>
					{subtitle}
				</Typography>
			)}
		</Box>
	)
}
