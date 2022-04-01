import { Box } from "@mui/material"
import React, { useEffect } from "react"
import { useHistory } from "react-router-dom"
import { BuyTokens } from "../components/buy/buyTokens"
import { GradientCircleThing } from "../components/home/gradientCircleThing"
import { Loading } from "../components/loading"
import { useAuth } from "../containers/auth"
import { useWeb3 } from "../containers/web3"

export const IFrameBuyPage: React.FC = () => {
	const { currentChainId } = useWeb3()
	const { user, loading } = useAuth()
	const history = useHistory()

	//placeholder for private routes
	useEffect(() => {
		if (user) return

		const userTimeout = setTimeout(() => {
			history.push("/login")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (!user) {
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
	}
	return !loading && currentChainId && user ? (
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
					<BuyTokens />
				</Box>
			</Box>
		</>
	) : (
		<Loading text="Loading. Please wait..." />
	)
}
