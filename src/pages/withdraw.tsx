import { Box } from "@mui/material"
import { GradientCircleThing } from "../components/home/gradientCircleThing"
import { Navbar } from "../components/home/navbar"
import { WithdrawSups } from "../components/withdrawSups"
export const WithdrawPage: React.FC = () => {
	return (
		<>
			<Box component="div" sx={{ position: "relative", minHeight: "100vh" }}>
				<Navbar />
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
					component="div"
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
					<WithdrawSups />
				</Box>
			</Box>
		</>
	)
}
