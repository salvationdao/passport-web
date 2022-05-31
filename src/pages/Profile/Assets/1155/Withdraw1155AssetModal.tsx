import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"
import { useCallback, useState } from "react"
import { useWeb3 } from "../../../../containers/web3"
import { API_ENDPOINT_HOSTNAME } from "../../../../config"
import { colors } from "../../../../theme"
import { FancyButton } from "../../../../components/fancyButton"
import { User1155Asset } from "../../../../types/purchased_item"

interface WithdrawAssetModalProps {
	open: boolean
	tokenID: string
	asset: User1155Asset
}

export const Withdraw1155AssetModal = ({ open, asset, tokenID }: WithdrawAssetModalProps) => {
	const [loading, setLoading] = useState<boolean>(false)
	const { signedMint1155, get1155Nonce, account } = useWeb3()

	const startWithdraw = useCallback(async () => {
		if (!asset.mint_contract) return
		try {
			setLoading(true)
			const nonce = await get1155Nonce(asset.mint_contract)
			const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/1155/${account}/${tokenID}/${nonce.toString()}/1`)
			console.log(resp)
			const signature = (await resp.clone().json()) as string
			console.log(signature)
			await signedMint1155(asset.mint_contract, signature, parseInt(tokenID))

			if (!resp) return
		} catch (e) {
			console.error(e)
		} finally {
			setLoading(false)
		}
	}, [account, get1155Nonce, asset, signedMint1155, tokenID])

	return (
		<Dialog open={open} maxWidth={"xl"}>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Withdraw Asset
			</DialogTitle>
			<DialogContent sx={{ paddingTop: "1.5rem !important", minWidth: "400px" }}>
				Confirm withdraw of asset:
				<Typography sx={{ color: `${colors.neonPink}` }}>{asset.label}</Typography>
			</DialogContent>

			<DialogActions sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "row-reverse" }}>
				<FancyButton loading={loading} onClick={startWithdraw}>
					Withdraw Asset
				</FancyButton>
			</DialogActions>
		</Dialog>
	)
}
