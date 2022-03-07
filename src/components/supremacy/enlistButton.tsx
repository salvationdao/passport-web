import { Box, Button } from "@mui/material"
import React, { useRef, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { colors } from "../../theme"
import { Faction } from "../../types/types"
import { EnlistDetailsPopover } from "./enlistPopover"

export interface EnlistButtonProps {
	faction: Faction
}

export const EnlistButton: React.VoidFunctionComponent<EnlistButtonProps> = ({ faction }) => {
	const popoverRef = useRef(null)
	const [popoverOpen, setPopoverOpen] = useState(false)

	const togglePopoverOpen = (value: boolean) => {
		setPopoverOpen(value)
	}

	const {
		id,
		label,
		theme: { primary },
		logo_blob_id,
	} = faction

	const logoUrl = `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${logo_blob_id}`

	const refPos = { bottom: -21 }

	return (
		<>
			<Button
				sx={{
					position: "relative",
					display: "flex",
					alignItems: "center",
					px: 1.2,
					py: 0.5,
					backgroundColor: "transparent",
					borderRadius: 0.2,
					border: `1px solid ${primary}`,
					"& .MuiTouchRipple-child": {
						backgroundColor: `${primary || colors.white} !important`,
					},
				}}
				onClick={() => togglePopoverOpen(true)}
				fullWidth
			>
				<Box sx={{ position: "absolute", left: "50%", ...refPos }} ref={popoverRef} />

				<Box component="img" src={logoUrl} alt={label} sx={{ height: 25, pointerEvents: "none" }} />
				<Box
					sx={{
						ml: 1.2,
						fill: primary || colors.white,
						"& svg": { height: 10 },
					}}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14.291 14.297">
						<path
							id="Path_107552"
							data-name="Path 107552"
							d="M-5796.6,19889.293a.757.757,0,0,1-.753-.754v-4.887h-4.889a.751.751,0,0,1-.752-.758v-1.5a.747.747,0,0,1,.752-.75h4.889v-4.891a.758.758,0,0,1,.753-.758h1.506a.755.755,0,0,1,.75.758v4.891h4.892a.746.746,0,0,1,.75.75v1.5a.751.751,0,0,1-.75.758h-4.892v4.887a.754.754,0,0,1-.75.754Z"
							transform="translate(5802.999 -19874.996)"
						/>
					</svg>
				</Box>
			</Button>

			{popoverOpen && (
				<EnlistDetailsPopover
					popoverRef={popoverRef}
					popoverOpen={popoverOpen}
					togglePopoverOpen={togglePopoverOpen}
					factionID={id}
					factionData={faction}
				/>
			)}
		</>
	)
}
