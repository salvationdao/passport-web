import { Box, LinearProgress, Stack, Typography, useTheme, Link } from "@mui/material"
import React from "react"
import { colors } from "../../theme"
import { FancyButton } from "../fancyButton"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import InfoIcon from "@mui/icons-material/Info"
import { BSC_SCAN_SITE } from "../../config"
import { transferStateType } from "../../types/types"

interface TransactionResultOverlayProps {
	currentTransferState: transferStateType
	setCurrentTransferState: React.Dispatch<React.SetStateAction<transferStateType>>
	currentTransferHash: string
	confirmationMessage: string
	error: any
	loading: boolean
}

export const TransactionResultOverlay = ({
	currentTransferState,
	confirmationMessage,
	currentTransferHash,
	setCurrentTransferState,
	error,
	loading,
}: TransactionResultOverlayProps) => {
	const theme = useTheme()

	return (
		<Box
			sx={
				currentTransferState !== "none"
					? {
							position: "absolute",
							zIndex: 5,
							padding: "1rem",
							height: "100%",
							width: "100%",
							backgroundColor: colors.darkerNavyBackground,
							display: "flex",
							justifyContent: "center",
					  }
					: { display: "none" }
			}
		>
			{/* TRANSACTION STATE: WAITING */}
			<Stack
				sx={
					currentTransferState === "waiting"
						? {
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								minWidth: "300px",
								width: "50%",
								maxWidth: "800px",
						  }
						: { display: "none" }
				}
			>
				<Box sx={{ width: "100%", marginBottom: "3rem" }}>
					<LinearProgress color="secondary" />
				</Box>

				<Typography variant="h3" sx={{ textTransform: "uppercase", marginBottom: "1rem", textAlign: "center" }}>
					Waiting on Confirmation
				</Typography>
				<Typography variant="body1" sx={{ textAlign: "center", marginBottom: "1rem" }}>
					{confirmationMessage}
				</Typography>
				<Typography variant="subtitle1" sx={{ textAlign: "center" }}>
					Please confirm this transaction in your wallet.
				</Typography>
				<Box sx={{ width: "100%", marginTop: "3rem" }}>
					<LinearProgress color="secondary" />
				</Box>
			</Stack>

			{/* TRANSACTION STATE: ERROR */}
			<Box
				sx={
					currentTransferState === "error"
						? {
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
						  }
						: { display: "none" }
				}
			>
				<ErrorIcon sx={{ fontSize: "50px", color: theme.palette.secondary.main }} />
				<Typography variant="h3" sx={{ margin: "2rem 0 ", textTransform: "uppercase" }}>
					Error: Transaction Failed
				</Typography>

				<Typography variant="body1">{error}</Typography>
				<Box sx={{ margin: "2rem 0", display: "flex", width: "70%", justifyContent: "space-around" }}>
					<FancyButton borderColor={colors.skyBlue} sx={{ minWidth: "7rem" }} onClick={() => setCurrentTransferState("none")}>
						Close
					</FancyButton>
				</Box>
			</Box>

			{/* TRANSACTION STATE: CONFIRM / SUCCESS */}
			<Box
				sx={
					currentTransferState === "confirm"
						? {
								display: "flex",
								justifyContent: "center",
								flexDirection: "column",
								alignItems: "center",
								textAlign: "center",
						  }
						: { display: "none" }
				}
			>
				<CheckCircleIcon sx={{ fontSize: "50px", color: theme.palette.secondary.main }} />
				<Typography variant="h3" sx={{ margin: "2rem 0 0 0", textTransform: "uppercase" }}>
					Success
				</Typography>
				<Typography variant="h4" sx={{ margin: "1rem 0" }}>
					Transaction has been submitted.
				</Typography>
				<Typography variant="body1">
					<Link href={`https://${BSC_SCAN_SITE}/tx/${currentTransferHash}`} target="_blank">
						View on Explorer
					</Link>
				</Typography>
				<FancyButton
					borderColor={colors.skyBlue}
					loading={loading}
					disabled={loading}
					sx={{ minWidth: "50%", margin: "2rem 0 .5rem 0", minHeight: "2.5rem" }}
					onClick={() => {
						window.location.reload()
						setCurrentTransferState("none")
					}}
				>
					{loading ? " " : "Close"}
				</FancyButton>
				<Typography sx={loading ? { display: "flex", width: "100%", justifyContent: "center" } : { display: "none" }} variant="body1">
					Please wait, your transaction is pending as block confirmations are still coming through.
				</Typography>
			</Box>

			{/* TRANSACTION STATE: UNAVAILABLE */}
			<Box
				sx={
					currentTransferState === "unavailable"
						? {
								display: "flex",
								justifyContent: "center",
								flexDirection: "column",
								alignItems: "center",
								textAlign: "center",
						  }
						: { display: "none" }
				}
			>
				<InfoIcon sx={{ fontSize: "50px", color: theme.palette.secondary.main }} />
				<Typography variant="h3" sx={{ margin: "2rem 0 0 0", textTransform: "uppercase" }}>
					Currently unavailable
				</Typography>
				<Typography variant="h4" sx={{ margin: "1rem 0" }}>
					This page will be open soon, come back later.
				</Typography>
			</Box>
		</Box>
	)
}
