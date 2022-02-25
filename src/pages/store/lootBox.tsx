import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, keyframes, Paper, Typography, useMediaQuery, useTheme, Zoom } from "@mui/material"
import { useState } from "react"
import { GradientSafeIconImagePath, SupTokenIcon } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { fonts, colors } from "../../theme"
import { Asset } from "../../types/types"

export const LootBoxPage = () => {
	const [loading, setLoading] = useState(false)
	const [asset, setAsset] = useState<Asset | undefined>()
	const { displayMessage } = useSnackbar()
	const { state, send } = useWebsocket()
	const { user } = useAuth()
	const [dialogOpen, setDialogOpen] = useState(false)
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const theme = useTheme()

	const purchase = async () => {
		if (state !== SocketState.OPEN || !user) return

		setLoading(true)
		try {
			const resp = await send(HubKey.StoreLootBox, {
				factionID: user.factionID,
			})

			const assetResponse = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/asset/${resp}`)
			const mysteryAsset: Asset = await assetResponse.json()
			setAsset(mysteryAsset)

			setTimeout(() => {
				setDialogOpen(true)
			}, 1000)
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

			<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
				<Box sx={{ padding: "1rem", border: `3px solid ${colors.darkNavyBackground2}` }}>
					<DialogTitle>
						<Typography variant="h2" sx={{ textAlign: "center" }}>
							Mystery Crate Reveals...
						</Typography>
					</DialogTitle>
					<DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
						<Typography variant="h3" sx={{ textAlign: "center", lineHeight: "1.3" }}>
							<Box component="span" sx={{ color: theme.palette.primary.main }}>
								{asset?.name}
							</Box>
							<Box component="span">!</Box>
						</Typography>
						<Box
							component="img"
							src={asset?.image}
							alt="Asset Image"
							sx={{
								display: isWiderThan1000px ? "block" : "none",
								width: "100%",
								maxWidth: "350px",
								margin: "1rem 0",
							}}
						/>
					</DialogContent>
					<DialogActions sx={{ display: "flex", justifyContent: "center" }}>
						<Button
							size="large"
							variant="contained"
							type="button"
							color="error"
							disabled={loading}
							onClick={() => {
								setDialogOpen(false)
							}}
						>
							Close
						</Button>
					</DialogActions>
				</Box>
			</Dialog>
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
