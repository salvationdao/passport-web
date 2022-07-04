import { Box, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { useState } from "react"
import { Redirect } from "react-router-dom"
import { XSYNLogo } from "../../assets"
import { Loading } from "../../components/loading"
import { useAuth } from "../../containers/auth"
import { colors } from "../../theme"

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
	padding: "1rem",
	gap: "1rem",
	alignItems: "center",
	background: "rgba(0, 0, 0, 0.7)",
	position: "relative",
})

const wallpapers = ["/img/rm.png", "/img/bc.png", "/img/zai.png"]

export const SupremacyAuth: React.FC<{ title?: string }> = ({ children, title }) => {
	const [wp] = useState<string>(wallpapers[Math.floor(Math.random() * wallpapers.length)])
	const { userID, loginCookieExternal } = useAuth()
	const isFromExternal = window.location.pathname === "/external/login"
	if (userID) {
		// if it is not from external, redirect user to profile page
		if (!isFromExternal) return <Redirect to={"/profile"} />

		// get source
		let source = ""
		if (window.location.search.includes("hangar")) source = "hangar"
		else if (window.location.search.includes("website")) source = "website"
		// else sign user
		loginCookieExternal(source)
		return <Loading />
	}
	return (
		<LoginBox wp={wp}>
			<Box
				sx={{
					padding: "50px 50px 20px 50px",
					flex: 1,
					display: "flex",
					"@media (max-width:600px)": {
						p: "2em 1em",
					},
				}}
			>
				<ContentBox>
					<Typography component="h1">{title ? title : "Connect"}</Typography>
					<Box component="img" sx={{ width: "50px" }} src={"/img/sups_logo.svg"} alt={"Login to Supremacy"} />
					{children}
				</ContentBox>
			</Box>
			<a href="https://xsyn.io" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
				<Typography sx={{ color: colors.white, textDecoration: "none" }}>Powered by</Typography>
				<Box
					component={XSYNLogo}
					sx={{
						height: "50px",
						margin: "1rem",
					}}
				/>
			</a>
		</LoginBox>
	)
}
