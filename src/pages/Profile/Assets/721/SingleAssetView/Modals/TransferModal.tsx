import CloseIcon from "@mui/icons-material/Close"
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material"
import { useCallback, useState } from "react"
import { FancyButton } from "../../../../../../components/fancyButton"
import { usePassportCommandsUser } from "../../../../../../hooks/usePassport"
import HubKey from "../../../../../../keys"
import { colors } from "../../../../../../theme"
import { UserAsset } from "../../../../../../types/purchased_item"

interface ServiceTransferModelProps {
	open: boolean
	onClose: () => void
	onSuccess: () => void
	userAsset: UserAsset
}

export const TransferModal = ({ open, onClose, onSuccess, userAsset }: ServiceTransferModelProps) => {
	const { send } = usePassportCommandsUser("/commander")
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>()
	const [feeType, setFeeType] = useState<"XSYN" | "SUPS" | undefined>("SUPS")

	const close = () => {
		setError(undefined)
		setFeeType(undefined)
		setLoading(false)
		onClose()
	}

	const transferToSupremacy = useCallback(async () => {
		try {
			setError(undefined)
			setLoading(true)
			await send(HubKey.AssetTransferToSupremacy, {
				asset_hash: userAsset.hash,
			})

			onSuccess()
		} catch (e) {
			console.error(e)
			setError(typeof e === "string" ? e : "Something went wrong while fetching the item's data. Please try again later.")
		} finally {
			setLoading(false)
		}
	}, [onSuccess, send, userAsset.hash])

	const transferFromSupremacy = useCallback(async () => {
		try {
			setError(undefined)
			setLoading(true)
			await send(HubKey.AssetTransferFromSupremacy, {
				asset_hash: userAsset.hash,
			})

			onSuccess()
		} catch (e) {
			console.error(e)
			setError(typeof e === "string" ? e : "Something went wrong while fetching the item's data. Please try again later.")
		} finally {
			setLoading(false)
		}
	}, [onSuccess, send, userAsset.hash])

	return (
		<Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Transition Asset To {userAsset.locked_to_service_name ? "XSYN" : "Supremacy"}
				<IconButton
					onClick={close}
					sx={{
						position: "absolute",
						top: "1rem",
						right: "1rem",
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent sx={{ py: 0 }}>
				<Typography marginBottom=".5rem" variant={"h5"} color={"error"}>
					WARNING:
				</Typography>

				<Typography marginBottom=".5rem">
					After transitioning, your asset it will be locked to that service. To use it within another service you will be required to
					transition it to that service.
				</Typography>
			</DialogContent>

			<DialogActions
				sx={{
					padding: "1rem",
					display: "flex",
					justifyContent: "space-evenly",
					flexDirection: "column",
					gap: "1rem",
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "end",
						flexDirection: "row",
						width: "100%",
						gap: "1rem",
					}}
				>
						<FancyButton
							tooltip={"XSYN currently unavailable"}
							borderColor={feeType === "XSYN" ? undefined : "#6b6b6b"}
							loading={loading}
						>
							Pay with XSYN (coming soon)
						</FancyButton>

					<FancyButton
						id="pay_with_sups"
						borderColor={feeType === "SUPS" ? undefined : "#6b6b6b"}
						loading={loading}
						sx={{
							span: {
								color: colors.neonBlue,
							},
						}}
						onClick={() =>
							setFeeType((prev) => {
								if (prev === "SUPS") return undefined
								return "SUPS"
							})
						}
					>
						Pay with SUPS
					</FancyButton>
				</Box>
					<FancyButton
						tooltip={feeType ? "" : "Select a payment method"}
						fullWidth
						borderColor={!!feeType ? undefined : "#6b6b6b"}
						loading={loading}
						sx={{
							span: {
								color: colors.neonBlue,
							},
						}}
						onClick={async () => {
							if (!feeType) return
							if (userAsset.locked_to_service_name) {
								await transferFromSupremacy()
								return
							}
							await transferToSupremacy()
						}}
					>
						Confirm transfer{" "}
						{feeType === "SUPS" ? (
							<>
								&nbsp;<span>5</span>&nbsp; sups gas
							</>
						) : (
							<></>
						)}
					</FancyButton>

				{error && <Typography sx={{ mt: "1rem", color: colors.supremacy.red }}>{error}</Typography>}
			</DialogActions>
		</Dialog>
	)
}
