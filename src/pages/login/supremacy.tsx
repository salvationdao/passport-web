import * as React from "react"
import { Typography, Box, Alert } from "@mui/material"
import { styled } from "@mui/system"
import { MetaMaskIcon, WalletConnectIcon, XSYNLogo } from "../../assets"
import { useState, SyntheticEvent } from "react"
import Tab from "@mui/material/Tab"
import TabContext from "@mui/lab/TabContext"
import TabList from "@mui/lab/TabList"
import TabPanel from "@mui/lab/TabPanel"
import { FancyButton } from "../../components/fancyButton"
import { MetaMaskLogin } from "../../components/loginMetaMask"
import EmailLogin from "./email"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import LoginForm from "./form"

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

const TabContent = styled(Box)({
	display: "flex",
	flexDirection: "column",
	textAlign: "center",
	flex: 1,
})

const wallpapers = ["/img/rm.png", "/img/bc.png", "/img/zai.png"]

const SupremacyLogin = () => {
	const [wp, _] = useState<string>(wallpapers[Math.floor(Math.random() * wallpapers.length)])

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
