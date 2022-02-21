import { Box, Modal, Stack, Typography, useMediaQuery } from "@mui/material"
import React from "react"
import { useWeb3 } from "../../containers/web3"
import { IMAGE_FOLDER } from "../../pages/sale/salePage"
import { colors } from "../../theme"
import { ClipThing } from "./clipThing"
import { SupFancyButton } from "./supFancyButton"

type Props = {
	handleJoinBtn: () => Promise<void>
	open: boolean
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

interface UserDataStoriesApi {
	Address: string
	RedM: number
	Zaibat: number
	Boston: number
	Deaths: number
}

export const WhiteListModal = (props: Props) => {
	const { account } = useWeb3()
	const mobileScreen = useMediaQuery("(max-width:600px)")

	return (
		<Modal
			open={props.open}
			onClose={() => props.setOpen(!props.open)}
			BackdropProps={{
				style: {
					backgroundColor: "rgba(0,0,0,0.9)",
				},
			}}
			sx={{
				overflowY: "scroll",
				overflowX: "hidden",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				padding: "5rem 2rem",
				zIndex: 9999,
				opacity: props.open ? 1 : 0,
				animation: props.open ? "fade 1s" : "unset",
				"& *:focus": {
					boxShadow: "none",
				},
				"@keyframes fade": {
					"0%": {
						opacity: 0,
					},
					"100%": {
						opacity: 1,
					},
				},
			}}
		>
			<Stack gap="2em">
				<Box
					sx={{
						alignSelf: "flex-end",
						mr: "-5rem",
						position: "relative",
						width: "30px",
						height: "30px",
						cursor: "pointer",
						"@media (max-width:800px)": {
							mr: 0,
						},
					}}
					onClick={() => props.setOpen(false)}
				>
					<Box
						sx={{
							display: "block",
							position: "absolute",
							top: "12px",
							right: "5px",
							transform: "rotate(45deg)",
							"&::after": {
								content: '""',
								display: "block",
								position: "absolute",
								right: 0,
								top: 0,
								transform: "rotate(90deg)",
							},

							"&, &::after": {
								position: "absolute",
								width: "20px",
								height: "4px",
								background: colors.white,
							},
						}}
					/>
				</Box>
				<ClipThing
					border={{ isFancy: true, borderColor: colors.black }}
					innerSx={{
						background: colors.darkNavyBlue,
						width: "90vw",
						maxWidth: "35rem",

						"&:focus": {
							boxShadow: "none",
						},

						"& img": {
							boxShadow: "1px 1px 1px 1px black",
							width: "100%",
							objectFit: "cover",
							maxHeight: "20rem",
							"@media (max-width:600px)": {
								maxHeight: "15rem",
							},
						},
					}}
				>
					<Box sx={{ background: colors.black2 }}>
						<img src={IMAGE_FOLDER + "/gabs.webp"} alt="gabs ai" />
						<Box
							sx={{
								p: "2em",
								display: "flex",
								flexDirection: "column",
								gap: "2em",
								"@media (max-width:600px)": {
									gap: "1em",
									p: "1em",
								},
								"& caption": {
									color: colors.neonBlue,
									fontFamily: "Share Tech",
									fontSize: ".8rem",
								},
							}}
						>
							<Typography>Survive to join the whitelist!</Typography>
							<SupFancyButton
								onClick={async () => await props.handleJoinBtn()}
								sx={{
									fontSize: "1.5rem",
									"@media (max-width:600px)": {
										fontSize: "1rem",
									},
								}}
							>
								Run simulation
							</SupFancyButton>
						</Box>
					</Box>
				</ClipThing>
			</Stack>
		</Modal>
	)
}
