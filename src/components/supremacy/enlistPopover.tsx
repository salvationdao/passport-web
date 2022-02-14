import ArrowRightAltSharpIcon from "@mui/icons-material/ArrowRightAltSharp"
import { Box, Fade, IconButton, Popover, Stack, Typography } from "@mui/material"
import React, { useCallback, useState } from "react"
import { SupTokenIconPath } from "../../assets"
import { useSnackbar } from "../../containers/snackbar"
import { API_ENDPOINT_HOSTNAME, useWebsocket } from "../../containers/socket"
import useSubscription from "../../hooks/useSubscription"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { DetailedFaction, Faction } from "../../types/types"
import { ClipThing } from "./clipThing"
import { FancyButton } from "./fancyButton"

interface StatProps {
	title: string
	content: string | number
	prefixImageUrl?: string
}

const Stat: React.VoidFunctionComponent<StatProps> = ({ title, content, prefixImageUrl }) => {
	return (
		<Box sx={{ width: 180 }}>
			<Typography variant="body2" sx={{ color: colors.supremacy.grey }}>
				{title}
			</Typography>

			<Stack direction="row" alignItems="center" spacing={0.5}>
				{prefixImageUrl && <Box component="img" src={prefixImageUrl} alt={title} sx={{ height: 14 }} />}
				<Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
					{content}
				</Typography>
			</Stack>
		</Box>
	)
}

interface EnlistFactionRequest {
	factionID: string
}

interface PopoverContentProps {
	factionData: Faction
	factionDataMore: DetailedFaction
	onClose: () => void
}

const PopoverContent: React.VoidFunctionComponent<PopoverContentProps> = ({ factionData, factionDataMore, onClose }) => {
	const [page, setPage] = useState(0)
	const { send, state } = useWebsocket()
	const { displayMessage } = useSnackbar()

	const enlistFaction = useCallback(async () => {
		if (state !== WebSocket.OPEN) return
		onClose()
		try {
			await send<any, EnlistFactionRequest>(HubKey.FactionEnlist, { factionID: factionData.id })
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		}
	}, [send, state, factionData, onClose, displayMessage])

	const {
		label,
		theme: { primary, secondary },
		logoBlobID,
		backgroundUrl,
		description,
	} = factionData
	const logoUrl = `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${logoBlobID}`

	const { velocity, recruitNumber, winCount, lossCount, killCount, deathCount, mvp } = factionDataMore

	return (
		<Stack
			direction="row"
			sx={{
				fontFamily: fonts.supremacy.sharetech,
			}}
		>
			<Stack
				alignItems="center"
				justifyContent="center"
				spacing={1.8}
				sx={{
					px: 2.6,
					py: 3,
					backgroundImage: `url(${backgroundUrl})`,
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
						maxHeight: 250,
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

			<Stack sx={{ px: 3, py: 2.8, width: 460 }}>
				{page === 0 && (
					<Fade in={true}>
						<Typography sx={{ fontFamily: "Share Tech" }}>{description}</Typography>
					</Fade>
				)}

				{page === 1 && (
					<Fade in={true}>
						<Stack direction="row" flexWrap="wrap" sx={{ pt: 1, px: 1, "& > *": { width: "50%", pb: 1 } }}>
							<Stat
								title="SUPS Velocity"
								content={velocity.toLocaleString("en-US", {
									minimumFractionDigits: 1,
									maximumFractionDigits: 4,
								})}
								prefixImageUrl={SupTokenIconPath}
							/>
							<Stat title="Recruits" content={recruitNumber} />
							<Stat title="Wins" content={winCount} />
							<Stat title="Losses" content={lossCount} />
							<Stat title="Win Rate" content={winCount + lossCount === 0 ? "0%" : `${((winCount / (winCount + lossCount)) * 100).toFixed(0)}%`} />
							<Stat title="Kills" content={killCount} />
							<Stat title="Deaths" content={deathCount} />
							<Stat title="K/D" content={deathCount === 0 ? "0%" : `${((killCount / deathCount) * 100).toFixed(0)}%`} />
							<Stat title="MVP" content={mvp} />
						</Stack>
					</Fade>
				)}

				<Stack
					direction="row"
					spacing={0.6}
					alignItems="center"
					justifyContent="flex-start"
					sx={{ mt: "auto", pt: 1.6, "& > .Mui-disabled": { color: `${colors.supremacy.darkerGrey} !important` } }}
				>
					<IconButton sx={{ color: primary, transform: "rotate(180deg)" }} onClick={() => setPage(0)} disabled={page <= 0}>
						<ArrowRightAltSharpIcon fontSize="inherit" />
					</IconButton>
					<IconButton sx={{ color: primary }} onClick={() => setPage(1)} disabled={page >= 1}>
						<ArrowRightAltSharpIcon fontSize="inherit" />
					</IconButton>

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
	const factionDataMore = useSubscription<DetailedFaction>(HubKey.SubscribeFactionStat, { factionID }).payload
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
						{factionDataMore ? (
							<PopoverContent factionData={factionData} factionDataMore={factionDataMore} onClose={() => togglePopoverOpen(false)} />
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
