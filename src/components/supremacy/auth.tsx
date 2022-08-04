import { Alert, Box, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { useEffect, useMemo, useState } from "react"
import { Redirect } from "react-router-dom"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { Loading } from "../loading"

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
	const { displayMessage } = useSnackbar()
	const { userID, loginCookieExternal } = useAuth()
	const isFromExternal = window.location.pathname === "/external/login"
	const [error, setError] = useState<string | undefined>()

	const err = useMemo(() => {
		const queryString = window.location.search
		const urlParams = new URLSearchParams(queryString)
		return urlParams.get("err") || undefined
	}, [])

	useEffect(() => {
		if (err) {
			setError(err)
		}
	}, [displayMessage, err])

	useEffect(() => {
		if (isFromExternal && userID) {
			loginCookieExternal()
		}
	}, [isFromExternal, loginCookieExternal, userID])

	if (userID) {
		// if it is not from external, redirect user to profile page
		if (!isFromExternal) return <Redirect to={"/profile"} />

		return <Loading />
	}

	return (
		<LoginBox wp={wp}>
			<ContentBox>
				{title && <Typography component="h1">{title}</Typography>}
				<Box sx={{ position: "relative", zIndex: 2 }}>{children}</Box>{" "}
				{error && <Alert severity="error">{error.charAt(0).toUpperCase() + error.slice(1)}</Alert>}
			</ContentBox>
		</LoginBox>
	)
}

export const SpamEmailWarning = () => {
	return (
		<Typography sx={{ maxWidth: "25rem", mb: "1rem" }}>
			If you do not receive an email in a few minutes, please check your email's "junk mail" or "spam" folder.
		</Typography>
	)
}
