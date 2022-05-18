import { Box, Fade, Popover, Stack, Typography, useMediaQuery } from "@mui/material"
import React, { useCallback, useState } from "react"
import { useSnackbar } from "../../containers/snackbar"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Faction } from "../../types/types"
import { ClipThing } from "./clipThing"
import { FancyButton } from "./fancyButton"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import useCommands from "../../containers/ws/useCommands"

interface EnlistFactionRequest {
	faction_id: string
}

interface PopoverContentProps {
	factionData: Faction
	onClose: () => void
}

const PopoverContent: React.VoidFunctionComponent<PopoverContentProps> = ({ factionData, onClose }) => {
	const [page] = useState(0)
	const { send, state } = useCommands()
	const { displayMessage } = useSnackbar()

	// Media queries
	const below780 = useMediaQuery("(max-width:780px)")

	const enlistFaction = useCallback(async () => {
		console.log(state, "state")
		if (state !== WebSocket.OPEN) return
		try {
			await send<any, EnlistFactionRequest>(HubKey.FactionEnlist, { faction_id: factionData.id })
			onClose()
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		}
	}, [send, state, factionData, onClose, displayMessage])

	const {
		label,
		theme: { primary, secondary },
		logo_blob_id,
		background_url,
		description,
	} = factionData
	const logoUrl = `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${logo_blob_id}`

	return (
		<Stack
			direction={below780 ? "column" : "row"}
			sx={{
				fontFamily: fonts.supremacy.sharetech,
			}}
		>
			{below780 ? (
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="center"
					spacing={1.8}
					sx={{
						px: 2.6,
						pt: 3,
						pb: 1.5,
						backgroundImage: `url(${background_url})`,
						backgroundRepeat: "no-repeat",
						backgroundPosition: "center",
						backgroundSize: "cover",
					}}
				>
					<Box
						component="img"
						src={logoUrl}
						alt={`${label} Logo`}
						sx={{
							minHeight: 30,
						}}
					/>
					<Typography
						variant="body2"
						sx={{
							width: 190,
							fontFamily: fonts.supremacy.nostromomedium,
						}}
					>
						{label.toUpperCase()}
					</Typography>
				</Stack>
			) : (
				<Stack
					alignItems="center"
					justifyContent="center"
					spacing={1.8}
					sx={{
						px: 2.6,
						py: 3,
						backgroundImage: `url(${background_url})`,
						backgroundRepeat: "no-repeat",
						backgroundPosition: "center",
						backgroundSize: "cover",
						width: 190,
						minHeight: 360,
					}}
				>
					<Box
						component="img"
						src={logoUrl}
						alt={`${label} Logo`}
						sx={{
							width: "100%",
							minHeight: 250,
						}}
					/>
					<Typography
						variant="body2"
						sx={{
							fontFamily: fonts.supremacy.nostromomedium,
						}}
					>
						{label.toUpperCase()}
					</Typography>
				</Stack>
			)}

			<Stack sx={{ px: 3, pt: below780 ? 1.4 : 2.8, pb: 2.8, width: below780 ? 300 : 460, overflow: "auto" }}>
				{page === 0 && (
					<Fade in={true}>
						<Typography sx={{ fontFamily: "Share Tech" }}>{description}</Typography>
					</Fade>
				)}

				<Stack
					direction="row"
					spacing={0.6}
					alignItems="center"
					justifyContent="flex-start"
					sx={{ mt: "auto", pt: 1.6, "& > .Mui-disabled": { color: `${colors.supremacy.darkerGrey} !important` } }}
				>
					<FancyButton
						clipSize="7px"
						borderColor={primary}
						backgroundColor={primary}
						clipSx={{ ml: "auto !important" }}
						sx={{ px: 3.2, py: 0.2, pt: 0.5 }}
						onClick={enlistFaction}
					>
						<Typography variant="caption" sx={{ color: secondary }}>
							Enlist
						</Typography>
					</FancyButton>
				</Stack>
			</Stack>
		</Stack>
	)
}

interface EnlistDetailsProps {
	popoverRef: React.MutableRefObject<null>
	popoverOpen: boolean
	togglePopoverOpen: (_state: boolean) => void
	factionID: string
	factionData: Faction
}

export const EnlistDetailsPopover: React.VoidFunctionComponent<EnlistDetailsProps> = ({
	popoverRef,
	popoverOpen,
	togglePopoverOpen,
	factionID,
	factionData,
}) => {
	const {
		theme: { primary },
	} = factionData

	return (
		<Popover
			open={popoverOpen}
			anchorEl={popoverRef.current}
			onClose={() => togglePopoverOpen(false)}
			anchorOrigin={{
				vertical: "bottom",
				horizontal: "center",
			}}
			transformOrigin={{
				vertical: "top",
				horizontal: "center",
			}}
			PaperProps={{ sx: { backgroundColor: "transparent", boxShadow: 0, overflow: "visible" } }}
			sx={{ zIndex: 999999 }}
		>
			<Box sx={{ filter: "drop-shadow(0 3px 3px #00000050)" }}>
				<ClipThing
					clipSize="10px"
					border={{
						isFancy: true,
						borderColor: primary,
						borderThickness: "2px",
					}}
				>
					<Stack direction="row" sx={{ backgroundColor: colors.supremacy.darkGreyBlue }}>
						{factionData ? (
							<PopoverContent factionData={factionData} onClose={() => togglePopoverOpen(false)} />
						) : (
							<Box sx={{ px: 3, py: 1.5 }}>
								<Typography variant="caption" sx={{ color: colors.supremacy.grey }}>
									Loading...
								</Typography>
							</Box>
						)}
					</Stack>
				</ClipThing>
			</Box>
		</Popover>
	)
}
