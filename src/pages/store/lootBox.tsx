import { Box, keyframes, Paper, Typography, Zoom } from "@mui/material"
import { useState } from "react"
import { useHistory } from "react-router-dom"
import { GradientSafeIconImagePath, SupTokenIcon } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { fonts } from "../../theme"

export const LootBoxPage = () => {
	const [loading, setLoading] = useState(false)
	const { displayMessage } = useSnackbar()
	const { state, send } = useWebsocket()
	const { user } = useAuth()
	const history = useHistory()

	const purchase = async () => {
		if (state !== SocketState.OPEN || !user) return

		setLoading(true)
		try {
			const resp = await send(HubKey.StoreLootBox, {
				factionID: user.factionID,
			})

			history.push(`/asset/${resp}`)
			displayMessage("Successfully purchased 1 Mystery Crate", "success")
		} catch (e) {
			displayMessage(
				typeof e === "string" ? e : "Something went wrong while purchasing the item. Please contact support if this problem persists.",
				"error",
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100vh",
				overflowX: "hidden",
			}}
		>
			<Navbar
				sx={{
					marginBottom: "2rem",
				}}
			/>
			<Box
				sx={{
					flex: 1,
					display: "flex",
					alignItems: "center",
					padding: "0 3rem",
				}}
			>
				<Paper
					sx={{
						position: "relative",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "space-between",
						width: "100%",
						maxWidth: "max(400px, 50vh)",
						minHeight: "max(400px, 50vh)",
						margin: "0 auto",
						padding: "2rem",
					}}
				>
					<Typography
						variant="h1"
						sx={{
							zIndex: 1,
							fontFamily: fonts.bizmoblack,
							fontStyle: "italic",
							letterSpacing: "2px",
							textTransform: "uppercase",
							textAlign: "center",
						}}
					>
						Mystery Crate
					</Typography>
					<Box
						sx={{
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(-50%, -50%)",
						}}
					>
						<Zoom in={true}>
							<Box
								component="img"
								src={GradientSafeIconImagePath}
								alt="Mystery Crate Icon"
								sx={{
									width: "200px",
									height: "200px",
									animation: loading ? `${slowJiggle} 0.2s infinite` : `${jiggle} 0.82s cubic-bezier(.36,.07,.19,.97) both`,
								}}
							/>
						</Zoom>
					</Box>
					<FancyButton onClick={() => purchase()} loading={loading}>
						Purchase for
						<Box
							component={SupTokenIcon}
							sx={{
								zIndex: 1,
								marginLeft: ".2rem",
								height: "1rem",
							}}
						/>
						2500
					</FancyButton>
				</Paper>
			</Box>
		</Box>
	)
}

const jiggle = keyframes`
10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
  `

const slowJiggle = keyframes`
10% {
    transform: translate3d(-4px, 0, 0);
  }

  90% {
    transform: translate3d(4px, 0, 0);
  }
`
