import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	keyframes,
	Paper,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
	Zoom,
} from "@mui/material"
import { useEffect, useState } from "react"
import { GradientSafeIconImagePath, SupTokenIcon } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import LootboxVideo from "../../components/lootboxVideo"
import { PleaseEnlist } from "../../components/pleaseEnlist"
import { useAuth } from "../../containers/auth"
import { useSidebarState } from "../../containers/sidebar"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Rarity } from "../../types/enums"
import { PurchasedItem, PurchasedItemResponse } from "../../types/purchased_item"
import { rarityTextStyles } from "../profile/profile"

export const LootBoxPage = () => {
	const { subscribe } = useWebsocket()
	const [loading, setLoading] = useState(false)
	const [asset, setAsset] = useState<PurchasedItem | null>(null)
	const { state, send } = useWebsocket()
	const { user } = useAuth()
	const [dialogOpen, setDialogOpen] = useState(false)
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const theme = useTheme()
	const [open, setOpen] = useState(false)
	const { setSidebarOpen } = useSidebarState()
	const [imgURL, setImg] = useState("")
	const [videoURL, setVideoURL] = useState("")
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (user && user.faction) {
			switch (user.faction.label) {
				case "Red Mountain Offworld Mining Corporation":
					setImg("https://afiles.ninja-cdn.com/passport/rm_crate.png")
					setVideoURL(
						"https://player.vimeo.com/progressive_redirect/playback/681923579/rendition/1080p?loc=external&signature=7e9fff2e4ea09ee28997c53f80f28dd581269d8af04195885821f65e5f533f10",
					)
					break
				case "Boston Cybernetics":
					setImg("https://afiles.ninja-cdn.com/passport/boston_crate.png")
					setVideoURL(
						"https://player.vimeo.com/progressive_redirect/playback/681930319/rendition/1080p?loc=external&signature=11bf8ce5eb133e5e53b12d05894f991157672b2aa9661455230c948f7b823e89",
					)
					break
				case "Zaibatsu Heavy Industries":
					setImg("https://afiles.ninja-cdn.com/passport/zaibatsu_crate.png")
					setVideoURL(
						"https://player.vimeo.com/progressive_redirect/playback/681917273/rendition/1080p?loc=external&signature=e0c40d7d63d7019bcf9b7b789107bf1eb716479e5e3cd4e9d9e5a9c4c38ede2d",
					)
					break
				default:
					setImg(GradientSafeIconImagePath)
					break
			}
		}
	}, [user])

	const purchase = async () => {
		if (state !== SocketState.OPEN || !user) return

		setLoading(true)
		try {
			const resp = await send(HubKey.StoreLootBox, {
				faction_id: user.faction_id,
			})

			return subscribe<PurchasedItemResponse>(
				HubKey.AssetUpdated,
				(payload) => {
					if (!payload) {
						setError("Something went wrong while purchasing the item. Please contact support if this problem persists.")
						return
					}
					setError(undefined)
					setAsset(payload.purchased_item)
					setSidebarOpen(false)
					setOpen(true)
				},
				{ asset_hash: resp },
			)
		} catch (e) {
			if (typeof e === "string") {
				setError(e)
			} else if (e instanceof Error) {
				setError(e.message || "Something went wrong while purchasing the item. Please contact support if this problem persists.")
			}
		} finally {
			setLoading(false)
		}
	}

	if (user && !user.faction) {
		return <PleaseEnlist />
	}

	return (
		<>
			<LootboxVideo setOpen={setOpen} srcURL={videoURL} open={open} setDialogOpen={setDialogOpen} />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					minHeight: "100vh",
					overflowX: "hidden",
					visibility: open ? "hidden" : "unset",
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

						<Zoom in={true}>
							<Box
								component="img"
								src={imgURL}
								alt="Mystery Crate Icon"
								sx={{
									width: "300px",
									height: "300px",
									animation: loading ? `${slowJiggle} 0.2s infinite` : `${jiggle} 0.82s cubic-bezier(.36,.07,.19,.97) both`,
								}}
							/>
						</Zoom>

						<Stack gap="1em" alignItems="center">
							{error && (
								<Typography textAlign="center" sx={{ color: colors.errorRed }}>
									{error}
								</Typography>
							)}
							<FancyButton sx={{ width: "fit-content" }} onClick={purchase} loading={loading}>
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
						</Stack>
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
									{asset && asset.data.mech.label}
								</Box>
								<Box component="span">!</Box>
							</Typography>
							<Box
								component="img"
								src={asset?.data.mech.image_url}
								alt="Asset Image"
								sx={{
									width: "100%",
									maxWidth: isWiderThan1000px ? "350px" : "250px",
									margin: "1rem 0",
								}}
							/>
							{asset ? (
								<Typography
									variant="h4"
									sx={{
										fontFamily: fonts.bizmoblack,
										fontStyle: "italic",
										letterSpacing: "2px",
										textTransform: "uppercase",
										...rarityTextStyles[asset.data.mech.tier as Rarity],
									}}
								>
									{asset.data.mech.tier}
								</Typography>
							) : null}
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
		</>
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
