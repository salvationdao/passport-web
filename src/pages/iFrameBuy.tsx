import { Box } from "@mui/material"
import React from "react"
import { BuyTokens } from "../components/buyTokens"
import { GradientCircleThing } from "../components/home/gradientCircleThing"

export const IFrameBuyPage: React.FC = () => {
	return (
		<>
			<Box sx={{ position: "relative", minHeight: "100vh" }}>
				<GradientCircleThing
					hideInner
					sx={{
						zIndex: -1,
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						display: {
							xs: "none",
							md: "block",
						},
					}}
				/>

				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						width: "100%",
						maxWidth: "600px",
					}}
				>
					<BuyTokens />
				</Box>
			</Box>
		</>
	)
}
