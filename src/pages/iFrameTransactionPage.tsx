import { Box, Typography } from "@mui/material"
import React, { useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"
import { BuyTokens } from "../components/buy/buyTokens"
import { GradientCircleThing } from "../components/home/gradientCircleThing"
import { Loading } from "../components/loading"
import { useAuth } from "../containers/auth"
import { useWeb3 } from "../containers/web3"

export const IFrameTransactionPage: React.FC = () => {
	const { amount, claim_id } = useParams<{ claim_id: string; amount: string }>()

	const { user, loading } = useAuth()
	const history = useHistory()

	// //placeholder for private routes
	// useEffect(() => {
	// 	if (user) return
	//
	// 	const userTimeout = setTimeout(() => {
	// 		history.push("/login?redirectURL=https://passport.xsyndev.io/transact/supremacy-world/10/asdas")
	// 	}, 2000)
	// 	return () => clearTimeout(userTimeout)
	// }, [user, history])

	if (!user) {
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
	}
	return !loading && user ? (
		<>
			<Box sx={{ position: "relative", minHeight: "100%" }}>
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
					<Typography>Transaction page</Typography>
				</Box>
			</Box>
		</>
	) : (
		<Loading text="Loading. Please wait..." />
	)
}
