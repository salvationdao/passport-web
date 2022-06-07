import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography } from "@mui/material"
import { useCallback, useState } from "react"
import { useWeb3 } from "../../../../containers/web3"
import { API_ENDPOINT_HOSTNAME } from "../../../../config"
import { colors } from "../../../../theme"
import { FancyButton } from "../../../../components/fancyButton"
import { User1155AssetView } from "../../../../types/purchased_item"
import CloseIcon from "@mui/icons-material/Close"
import { metamaskErrorHandling } from "../../../../helpers/web3"

interface WithdrawAssetModalProps {
	open: boolean
	tokenID: string
	asset: User1155AssetView
	mintContract: string
	onClose: () => void
}

export const Withdraw1155AssetModal = ({ open, asset, tokenID, mintContract, onClose }: WithdrawAssetModalProps) => {
	const [loading, setLoading] = useState<boolean>(false)
	const { signedMint1155, get1155Nonce, account } = useWeb3()
	const [withdrawError, setWithdrawError] = useState<string>()

	const startWithdraw = useCallback(async () => {
		try {
			setLoading(true)
			const nonce = await get1155Nonce(mintContract)
			const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/1155/${account}/${tokenID}/${nonce.toString()}/1`)
			const signature = (await resp.clone().json()) as string
			const tx = await signedMint1155(mintContract, signature, parseInt(tokenID))

			if (!resp) return
			await tx.wait()
			onClose()
		} catch (e) {
			const error = metamaskErrorHandling(e)
			error ? setWithdrawError(error) : setWithdrawError("Issue depositing, please try again.")
		} finally {
			setLoading(false)
		}
	}, [get1155Nonce, mintContract, account, tokenID, signedMint1155, onClose])

	return (
		<Dialog open={open} maxWidth={"xl"} onClose={onClose}>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Withdraw Asset
				<IconButton
					onClick={onClose}
					sx={{
						position: "absolute",
						top: "1rem",
						right: "1rem",
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent sx={{ paddingTop: "1.5rem !important", minWidth: "400px" }}>
				Confirm withdraw of asset:
				<Typography sx={{ color: `${colors.neonPink}` }}>{asset.label}</Typography>
			</DialogContent>

			<DialogActions sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "column", gap: "1rem", p: "1rem" }}>
				<Tooltip title={"Amount locked to 1 for achievements"}>
					<Stack sx={{ width: "100%" }}>
						<Typography>Amount:</Typography>
						<TextField
							id="outlined-basic"
							variant="outlined"
							type="number"
							defaultValue={"1"}
							disabled
							InputProps={{
								endAdornment: <InputAdornment position="end"> / {asset.count}</InputAdornment>,
							}}
							fullWidth
						/>
					</Stack>
				</Tooltip>
				<FancyButton loading={loading} onClick={startWithdraw} fullWidth>
					Withdraw Asset
				</FancyButton>
				{withdrawError && <Typography sx={{ color: `${colors.errorRed}` }}>{withdrawError}</Typography>}
			</DialogActions>
		</Dialog>
	)
}
