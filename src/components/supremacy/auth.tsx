import { Box, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { useState } from "react"
import { Redirect } from "react-router-dom"
import { useAuth } from "../../containers/auth"

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
	backgroundImage: `url(https://afiles.ninja-cdn.com/passport/background_images/${wp})`,
	backgroundSize: "cover",
	backgroundPosition: "center center",
	display: "flex",
	justifyContent: "flex-end",
	overflowY: "auto",
	overflowX: "hidden",
	h1: {
		textTransform: "uppercase",
		fontSize: "2rem",
		fontWeight: 800,
	},
	img: {
		maxWidth: "100%",
	},
	"@media (max-width:600px)": {
		justifyContent: "center",
		alignItems: "center",
	},
}))

const ContentBox = styled(Box)({
	alignSelf: "flex-end",
	display: "flex",
	height: "100%",
	maxWidth: "40rem",
	minWidth: "fit-content",
	width: "32vw",
	boxSizing: "border-box",
	flexDirection: "column",
	justifyContent: "center",
	padding: "2em",
	gap: "1rem",
	alignItems: "center",
	background: "rgba(0, 0, 0, 0.8)",
	position: "relative",
	zIndex: 2,
	"@media (max-width:600px)": {
		height: "auto",
		alignSelf: "center",
		width: "90%",
		minHeight: "50rem",
	},
	"@media (max-width:400px)": {
		width: "100vw",
		maxWidth: "unset",
		minHeight: "100%",
	},
})

const wallpapers = ["rm.jpeg", "bc.png", "zai.png"]

export const SupremacyAuth: React.FC<{ title?: string }> = ({ children, title }) => {
	const [wp] = useState<string>(wallpapers[Math.floor(Math.random() * wallpapers.length)])
	const { userID } = useAuth()

	if (userID) {
		return <Redirect to={"/profile"} />
	}

	return (
		<LoginBox wp={wp}>
			<ContentBox>
				{title && <Typography component="h1">{title}</Typography>}
				{children}
			</ContentBox>
		</LoginBox>
	)
}

export const SpamEmailWarning = () => {
	return (
		<Typography
			sx={{
				maxWidth: "30rem",
				mb: "1rem",
				textAlign: "left",
				"@media (max-width:600px)": {
					textAlign: "center",
				},
			}}
		>
			{`If you do not receive an email in a few minutes, please check your email's "junk mail" or "spam" folder.`}
		</Typography>
	)
}
