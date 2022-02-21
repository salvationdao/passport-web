import { Box, Modal, Stack, Typography, useMediaQuery } from "@mui/material"
import React, { useState, useEffect } from "react"
import { useContainer } from "unstated-next"
import { AppState, SnackState } from "../../containers/supremacy/app"
import { useWeb3 } from "../../containers/web3"
import { IMAGE_FOLDER } from "../../pages/sale/salePage"
import { colors } from "../../theme"
import { CountdownTimer } from "./countdownTimer"
import { FancyButton } from "./fancyButton"

type Props = {
	handleJoinBtn: () => Promise<void>
	open: boolean
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	isTouchDevice: boolean
	shorterScreen?: boolean
	smallerScreen?: boolean
	publicSale?: boolean
}

export const WhiteListModal = (props: Props) => {
	const { account } = useWeb3()
	const { setSnackMessage } = useContainer(SnackState)
	const mobileScreen = useMediaQuery("(max-width:600px)")
	const matches = props.shorterScreen || props.smallerScreen

	return (
		<Box
			sx={{
				width: "fit-content",
				maxWidth: "50vw",
				height: "300px",
				display: "flex",
				flexDirection: "column",

				"&:focus": {
					boxShadow: "none",
				},

				"& img": {
					m: 0,
					width: "100%",
					height: "100%",
					objectFit: "cover",
					maxHeight: "30vh",
					border: `1px groove ${colors.gold}`,
					"@media (max-width:600px)": {
						maxHeight: "15rem",
					},
				},
			}}
		>
			<Box component="img" src={`${IMAGE_FOLDER}/gabs.webp`} alt="gabs image" />
			<Box
				sx={{
					margin: "0 auto",
					p: props.publicSale ? "1em 0" : "1em 2em",
					display: "flex",
					flexDirection: "column",
					gap: "1em",
					width: "100%",
					maxWidth: props.publicSale ? "100%" : "40rem",
					"& caption": {
						color: colors.neonBlue,
						fontFamily: "Share Tech",
						fontSize: ".8rem",
					},
				}}
			>
				<Typography
					sx={{
						fontSize: "1.2rem",
						textAlign: "center",
						"@media (max-width:400px)": {
							textAlign: "center",
						},
					}}
				>
					To be whitelisted you must survive the simulation.
				</Typography>

				<FancyButton
					fullWidth
					onClick={async () => {
						if (account)
							if (mobileScreen || props.isTouchDevice) {
								setSnackMessage({
									message: "May not work on your mobile device, and is best accessed from a PC",
									severity: "warning",
								})
							}
						await props.handleJoinBtn()
					}}
					sx={{
						fontSize: props.publicSale ? "1.5rem" : "1rem",
					}}
				>
					Run simulation
				</FancyButton>
				{!props.publicSale && <CountdownTimer />}
			</Box>
		</Box>
	)
}
