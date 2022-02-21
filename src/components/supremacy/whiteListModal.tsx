import { Box, Modal, Stack, Typography, useMediaQuery } from "@mui/material"
import React, { useState, useEffect } from "react"
import { useContainer } from "unstated-next"
import { AppState, SnackState } from "../../containers/supremacy/app"
import { useWeb3 } from "../../containers/web3"
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
			<Box
				sx={{
					backgroundImage: props.publicSale ? "transparent" : "url(/images/gabs.webp)",
					backgroundPosition: matches ? "50% 42%" : "0 -4em",
					backgroundSize: "cover",
					backgroundRepeat: "no-repeat",
					height: matches ? "4rem" : props.publicSale ? "fit-content" : "10rem",
				}}
			>
				{!props.publicSale && (
					<Box
						sx={{
							p: "1em",
							backgroundColor: "rgba(0,0,0,0.7)",
							width: "100%",
							display: "flex",
							justifyContent: "center",
							height: matches ? "4rem" : "auto",
						}}
					>
						<Typography
							sx={{
								fontFamily: "Nostromo Regular Black",
								textAlign: "center",
								fontSize: "1rem",
							}}
						>
							Game Launch | Token Sale
						</Typography>
					</Box>
				)}
			</Box>
			{props.publicSale && <Box component="img" src="/images/gabs.webp" alt="gabs image" />}
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
