import CloseIcon from "@mui/icons-material/Close"
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material"
import { useCallback, useState } from "react"
import { FancyButton } from "../../../../../../components/fancyButton"
import { usePassportCommandsUser } from "../../../../../../hooks/usePassport"
import HubKey from "../../../../../../keys"
import { colors } from "../../../../../../theme"
import { User1155AssetView } from "../../../../../../types/purchased_item"

interface ServiceTransfer1155ModelProps {
	open: boolean
	onClose: () => void
	onSuccess: () => void
	userAsset: User1155AssetView
	collectionSlug: string
}

export const Transfer1155Modal = ({ open, onClose, onSuccess, userAsset, collectionSlug }: ServiceTransfer1155ModelProps) => {
	const { send } = usePassportCommandsUser("/commander")
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>()
	const [formError, setFormError] = useState<string>()
	const [feeType, setFeeType] = useState<"XSYN" | "SUPS" | undefined>("SUPS")
	const [amount, setAmount] = useState<number>(1)

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
			await send(HubKey.Asset1155TransferToSupremacy, {
				token_id: userAsset.external_token_id,
				amount: amount,
				collection_slug: collectionSlug,
			})
			onSuccess()
		} catch (e) {
			console.error(e)
			setError(typeof e === "string" ? e : "Something went wrong while fetching the item's data. Please try again later.")
		} finally {
			setLoading(false)
		}
	}, [amount, collectionSlug, onSuccess, send, userAsset.external_token_id])

	const transferFromSupremacy = useCallback(async () => {
		try {
			setError(undefined)
			setLoading(true)
			await send(HubKey.Asset1155TransferFromSupremacy, {
				token_id: userAsset.external_token_id,
				amount: amount,
				collection_slug: collectionSlug,
			})

			onSuccess()
		} catch (e) {
			console.error(e)
			setError(typeof e === "string" ? e : "Something went wrong while fetching the item's data. Please try again later.")
		} finally {
			setLoading(false)
		}
	}, [amount, collectionSlug, onSuccess, send, userAsset.external_token_id])

	return (
		<Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Transition Asset To {userAsset.service_name_locked_in ? "XSYN" : "Supremacy"}
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

			<DialogActions>
				<Stack
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: "1rem",
						flex: 1,
					}}
				>
					<Stack direction="row" alignItems="center" justifyContent="space-between" spacing="1rem" sx={{ px: "1rem" }}>
						<Stack>
							<Typography>Product:</Typography>
							<Typography variant="subtitle1">{userAsset.label}</Typography>
						</Stack>
						<Stack>
							<Typography>Amount:</Typography>
							<TextField
								id="outlined-basic"
								variant="outlined"
								required
								focused
								error={!!formError}
								helperText={formError}
								type="number"
								value={amount}
								InputProps={{
									endAdornment: <InputAdornment position="end"> / {userAsset.count}</InputAdornment>,
								}}
								onChange={(e) => {
									const newAmount = parseInt(e.target.value)
									if (newAmount < 0) return
									if (newAmount > userAsset.count || newAmount <= 0) {
										setFormError("Amount exceeds total or below 0")
									} else {
										setFormError(undefined)
									}
									setAmount(newAmount)
								}}
							/>
						</Stack>
					</Stack>

					<Stack direction="row" justifyContent="center" alignItems="center" spacing="1rem" sx={{ pt: "1rem" }}>
							<FancyButton
								tooltip={"XSYN currently unavailable"}
								borderColor={feeType === "XSYN" ? undefined : "#6b6b6b"}
								loading={loading}
								sx={{ flex: 1 }}
							>
								Pay with XSYN (Coming soon)
							</FancyButton>
						<FancyButton
							borderColor={feeType === "SUPS" ? undefined : "#6b6b6b"}
							loading={loading}
							sx={{
								flex: 1,
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
					</Stack>

\						<FancyButton
							tooltip={feeType ? "" : "Select a payment method"}
							disabled={!!error && !!formError}
							borderColor={!!feeType && !error && !formError ? undefined : "#6b6b6b"}
							loading={loading}
							sx={{
								py: "1rem",
								span: {
									color: colors.neonBlue,
								},
							}}
							onClick={async () => {
								if (!feeType && !error && !formError) return
								if (userAsset.service_name_locked_in) {
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
				</Stack>
			</DialogActions>
		</Dialog>
	)
}
