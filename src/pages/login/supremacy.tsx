import * as React from "react"
import { useState } from "react"
import { Box, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { XSYNLogo } from "../../assets"
import LoginForm from "./form"
import { useAuth } from "../../containers/auth"
import { Redirect } from "react-router-dom"
import { Loading } from "../../components/loading"

interface LoginBoxProps {
	wp: string
}

const LoginBox = styled(Box, {
	shouldForwardProp: (prop) => prop !== "wp",
})<LoginBoxProps>(({ wp }) => ({
	height: "100%",
	width: "100%",
	border: "1px solid rgba(255,255,255,0.5)",
	textAlign: "center",
	backgroundImage: `url(${wp})`,
	backgroundSize: "cover",
	backgroundPosition: "center center",
	display: "flex",
	overflowY: "auto",
	overflowX: "hidden",
	flexDirection: "column",
	h1: {
		textTransform: "uppercase",
		fontSize: "2rem",
		fontWeight: 800,
	},
	img: {
		maxWidth: "100%",
	},
}))

const ContentBox = styled(Box)({
	flex: 1,
	display: "flex",
	height: "100%",
	width: "100%",
	boxSizing: "border-box",
	flexDirection: "column",
	alignItems: "center",
	background: "rgba(0, 0, 0, 0.7)",
})

const wallpapers = ["/img/rm.png", "/img/bc.png", "/img/zai.png"]

const SupremacyLogin = () => {
	const [wp] = useState<string>(wallpapers[Math.floor(Math.random() * wallpapers.length)])
	const { userID, loginCookieExternal } = useAuth()
	const isFromExternal = window.location.pathname === "/external/login"
	if (userID) {
		// if it is not from external, redirect user to profile page
		if (!isFromExternal) return <Redirect to={"/profile"} />

		// else sign user
		loginCookieExternal()
		return <Loading />
	}
	return (
		<LoginBox wp={wp}>
			<Box sx={{ padding: "50px 50px 20px 50px", flex: 1, display: "flex" }}>
				<ContentBox>
					<Box sx={{ p: 2 }}>
						<Typography component="h1">Login</Typography>
					</Box>
					<Box sx={{ p: 2 }}>
						<Box component="img" sx={{ width: "50px" }} src={"/img/sups_logo.svg"} alt={"Login to Supremacy"} />
					</Box>
					<LoginForm />
				</ContentBox>
			</Box>
			<Box>
				<Typography component="p">Powered by</Typography>
				<Box
					component={XSYNLogo}
					sx={{
						height: "50px",
						margin: "1rem",
					}}
				/>
			</Box>
		</LoginBox>
	)
}
export default SupremacyLogin
