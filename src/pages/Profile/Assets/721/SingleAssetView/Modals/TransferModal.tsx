import CloseIcon from "@mui/icons-material/Close"
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material"
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
		<Dialog
			open={open}
			onClose={() => {
				setError(undefined)
				onClose()
			}}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Transition Asset To {userAsset.locked_to_service_name ? "XSYN" : "Supremacy"}
				<IconButton
					onClick={() => {
						setError(undefined)
						onClose()
					}}
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

				<Typography sx={{ fontWeight: "fontWeightBold", color: colors.neonBlue }}>GAS FEE: 0.5 XSYN</Typography>
			</DialogContent>

			<DialogActions sx={{ padding: "1rem 1rem" }}>
				<Stack spacing=".5rem" sx={{ width: "100%" }}>
					<FancyButton
						disabled
						loading={loading}
						onClick={async () => {
							if (userAsset.locked_to_service_name) {
								await transferFromSupremacy()
								return
							}
							await transferToSupremacy()
						}}
					>
						Confirm transfer (<span>0.5</span>&nbsp;XSYN gas fee)
					</FancyButton>
					<FancyButton
						loading={loading}
						sx={{
							span: {
								color: colors.neonBlue,
							},
						}}
						onClick={async () => {
							if (userAsset.locked_to_service_name) {
								await transferFromSupremacy()
								return
							}
							await transferToSupremacy()
						}}
					>
						Confirm transfer (<span>5</span>&nbsp;sups gas fee)
					</FancyButton>

					{error && <Typography sx={{ mt: "1rem", color: colors.supremacy.red }}>{error}</Typography>}
				</Stack>
			</DialogActions>
		</Dialog>
	)
}
