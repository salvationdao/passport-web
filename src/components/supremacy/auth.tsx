import { Alert, Box, Typography } from "@mui/material"
import { styled } from "@mui/system"
import { useEffect, useMemo, useState } from "react"
import { Redirect } from "react-router-dom"
import { XSYNLogo } from "../../assets"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { colors } from "../../theme"
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
	justifyContent: "center",
	padding: "1rem",
	gap: "1rem",
	alignItems: "center",
	background: "rgba(0, 0, 0, 0.8)",
	position: "relative",
	zIndex: 2,
})

const wallpapers = ["/img/rm.png", "/img/bc.png", "/img/zai.png"]

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

	console.log(err)

	useEffect(() => {
		if (err) {
			setError(err)
		}
	}, [displayMessage, err])

	if (userID) {
		// if it is not from external, redirect user to profile page
		if (!isFromExternal) return <Redirect to={"/profile"} />

		// // else sign user
		loginCookieExternal()
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
					<Box
						component="img"
						sx={{
							width: "100%",
							height: "100%",
							position: "absolute",
							top: "1rem",
							left: "50%",
							transform: "translateX(-50%)",
							opacity: 0.08,
						}}
						src={"/img/sups_logo.svg"}
						alt={"Login to Supremacy"}
					/>
					<Box sx={{ position: "relative", zIndex: 2 }}>{children}</Box>{" "}
					{error && <Alert severity="error">{error.charAt(0).toUpperCase() + error.slice(1)}</Alert>}
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
