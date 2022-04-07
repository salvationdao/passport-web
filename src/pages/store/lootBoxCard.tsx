import SearchIcon from "@mui/icons-material/Search"
import { Box, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { GradientSafeIconImagePath, SupTokenIcon } from "../../assets"
import SoldOut from "../../assets/images/SoldOutTrimmed.png"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import HubKey from "../../keys"
import { fonts } from "../../theme"
import { ViewButton } from "../collections/collectionItemCard"

export const LootBoxCard: React.VoidFunctionComponent = () => {
	const [imgURL, setImg] = useState("")
	const [mcAmount, setMCAmount] = useState(-1)
	const { displayMessage } = useSnackbar()
	const { user } = useAuth()
	const history = useHistory()
	const { send, state } = useWebsocket()

	useEffect(() => {
		if (user && user.faction) {
			switch (user.faction.label) {
				case "Red Mountain Offworld Mining Corporation":
					setImg("https://afiles.ninja-cdn.com/passport/rm_crate.png")
					break
				case "Boston Cybernetics":
					setImg("https://afiles.ninja-cdn.com/passport/boston_crate.png")
					break
				case "Zaibatsu Heavy Industries":
					setImg("https://afiles.ninja-cdn.com/passport/zaibatsu_crate.png")
					break
				default:
					setImg(GradientSafeIconImagePath)
					break
			}
		}
	}, [user])

	useEffect(() => {
		if (state !== SocketState.OPEN || !user) return
		;(async () => {
			try {
				const resp = await send<number>(HubKey.StoreLootBoxAmount, {
					faction_id: user.faction_id,
				})

				setMCAmount(resp)
			} catch (e) {
				displayMessage(typeof e === "string" ? e : "Could not get amount of mystery crates left, try again or contact support.", "error")
			}
		})()
	}, [user, send, state, displayMessage])

	return (
		<Box
			component="button"
			disabled={mcAmount === 0}
			onClick={() => history.push(`/mystery`)}
			sx={{
				position: "relative",
				padding: "1rem",
				textAlign: "center",
				font: "inherit",
				color: "inherit",
				border: "none",
				outline: "none",
				backgroundColor: "transparent",
			}}
		>
			<Box
				sx={{
					display: mcAmount === 0 ? "flex" : "none",
					padding: ".3rem",
					justifyContent: "center",
					zIndex: "1",
					position: "absolute",
					width: "100%",
					transform: "rotate(-15deg) translate(0,-50%)",
					textTransform: "uppercase",
					borderRadius: "2px",
					top: "45%",
				}}
			>
				<Box component="img" src={SoldOut} sx={{ height: "4.5rem" }} />
			</Box>
			<Box
				sx={{
					cursor: mcAmount === 0 ? "default" : "pointer",
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-around",
				}}
			>
				<Typography
					variant="h5"
					component="p"
					sx={{
						marginBottom: ".3rem",
						fontFamily: fonts.bizmoblack,
						fontStyle: "italic",
						letterSpacing: "2px",
						textTransform: "uppercase",
					}}
				>
					Mystery Crate
				</Typography>

				{/* image */}
				<Box
					sx={{
						position: "relative",
					}}
				>
					<Box
						component="img"
						src={imgURL}
						alt="Mech image"
						sx={{
							width: "100%",
							maxWidth: "180px",
							marginBottom: ".3rem",
						}}
					/>
				</Box>
				<Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
					<Typography
						variant="body1"
						sx={{
							textTransform: "uppercase",
						}}
					>
						Special
					</Typography>
					<Typography
						variant="subtitle1"
						sx={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							letterSpacing: "1px",
						}}
					>
						<Box
							component={SupTokenIcon}
							sx={{
								height: "1rem",
								marginRight: ".2rem",
							}}
						/>
						2500
					</Typography>
				</Box>
				<ViewButton
					sx={{
						position: "absolute",
						right: "1rem",
						bottom: "1rem",
					}}
				>
					<SearchIcon />
				</ViewButton>
			</Box>
		</Box>
	)
}
