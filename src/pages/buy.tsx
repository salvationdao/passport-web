import { Box } from "@mui/material"
import React, { useEffect } from "react"
import { useHistory } from "react-router-dom"
import { BuyTokens } from "../components/buyTokens"
import { GradientCircleThing } from "../components/home/gradientCircleThing"
import { Navbar } from "../components/home/navbar"
import { Loading } from "../components/loading"
import { useAuth } from "../containers/auth"

export const BuyPage: React.FC = () => {
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

	if (loading) {
		return <Loading text="Loading. Please wait..." />
	}
	if (!user) {
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
	}

	return (
		<Box sx={{ display: "flex", position: "relative", flexDirection: "column", width: "100%", height: "100vh" }}>
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
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					flex: 1,
					// height: "100%",
				}}
			>
				<BuyTokens publicSale={false} />
			</Box>
		</Box>
	)
}
