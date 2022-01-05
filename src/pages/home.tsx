import { useHistory } from "react-router-dom"
import { Logo } from "../components/logo"
import { Login } from "../components/login"
import { VersionText } from "../components/version"
import { Button, Paper } from "@mui/material"
import { Box } from "@mui/material"
import { LoginOAuth } from "../components/loginOAuth"
import { LoginMetaMask } from "../components/loginMetaMask"

export const Home = () => {
	const history = useHistory()

	return (
		<Box
			sx={{
				minHeight: "100vh",
				width: "100%",
				backgroundColor: "primary.main",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
			}}
		>
			<Logo />
			<Paper
				sx={{
					padding: "1.5rem",
					width: "70%",
					maxWidth: "600px",
					boxShadow: 2,
				}}
			>
				<Login />
			</Paper>
			<LoginOAuth />
			<LoginMetaMask />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					width: "50%",
					maxWidth: "450px",
					paddingTop: "2rem",
				}}
			>
				<Box sx={{ color: "white" }}>Or</Box>
				<Button onClick={() => history.push("/onboarding")} variant="contained" sx={{ marginTop: "1rem" }}>
					Sign up
				</Button>
			</Box>

			<VersionText />
		</Box>
	)
}
