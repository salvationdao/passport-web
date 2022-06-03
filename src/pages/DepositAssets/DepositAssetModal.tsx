import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material"
import { BigNumber } from "ethers"
import { FancyButton } from "../../components/fancyButton"
import { Asset1155Json } from "../../types/types"
import { colors } from "../../theme"
import { useWeb3 } from "../../containers/web3"
import { useCallback, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import { metamaskErrorHandling } from "../../helpers/web3"
import HubKey from "../../keys"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import { useHistory } from "react-router-dom"

interface DepositAssetModalProps {
	open: boolean
	maxAmount: BigNumber
	asset: Asset1155Json
	transferAddress: string
	tokenID: number
	mintContract: string
	setOpen: (value: ((prevState: boolean) => boolean) | boolean) => void
	collectionSlug: string
}

export const DepositAssetModal = ({
	open,
	maxAmount,
	asset,
	tokenID,
	transferAddress,
	mintContract,
	setOpen,
	collectionSlug,
}: DepositAssetModalProps) => {
	const [amount, setAmount] = useState<number>(1)
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>()
	const { safeTransferFrom1177 } = useWeb3()
	const { state, send } = usePassportCommandsUser("/commander")
	const history = useHistory()

	const startTransfer = useCallback(async () => {
		if (state !== WebSocket.OPEN) return
		try {
			setLoading(true)
			const tx = await safeTransferFrom1177(mintContract, tokenID, amount, transferAddress)
			if (!tx) return
			await tx.wait()

			await send(HubKey.Asset1155Deposit, {
				transaction_hash: tx.hash,
				amount: amount,
				token_id: tokenID,
				collection_slug: collectionSlug,
			})
			history.push("/deposit-assets/deposit-status")
		} catch (e) {
			const err = metamaskErrorHandling(e)
			setError(err)
			console.error(e)
		} finally {
			setLoading(false)
		}
	}, [amount, collectionSlug, history, mintContract, safeTransferFrom1177, send, state, tokenID, transferAddress])

	return (
		<Dialog
			open={open}
			maxWidth={"xl"}
			onClose={() => {
				setOpen(false)
			}}
		>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Deposit Asset
				<IconButton
					sx={{
						position: "absolute",
						top: "1rem",
						right: "1rem",
					}}
					onClick={() => {
						setOpen(false)
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent sx={{ paddingTop: "1.5rem !important", minWidth: "400px" }}>
				Confirm deposit of asset <Typography sx={{ color: `${colors.neonPink}` }}>{asset.name}</Typography>
			</DialogContent>

			<DialogActions sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "column", gap: "1rem", p: "1rem" }}>
				<Stack sx={{ width: "100%" }}>
					<Typography>Amount:</Typography>
					<TextField
						id="outlined-basic"
						variant="outlined"
						type="number"
						defaultValue={amount}
						InputProps={{
							endAdornment: <InputAdornment position="end"> / {maxAmount.toString()}</InputAdornment>,
						}}
						size={"small"}
						fullWidth
						error={!!error}
						helperText={error}
						onChange={(e) => {
							try {
								const newAmount = parseInt(e.target.value)
								if (BigNumber.from(newAmount).gt(maxAmount) || BigNumber.from(newAmount).lte(BigNumber.from(0))) {
									setError("Amount exceeds total or below 0")
								} else {
									setError(undefined)
								}
								setAmount(newAmount)
							} catch (e) {
								setError("Error in input")
							}
						}}
					/>
				</Stack>
				<FancyButton loading={loading} onClick={startTransfer} fullWidth>
					Deposit Asset
				</FancyButton>
			</DialogActions>
		</Dialog>
	)
}
