import CloseIcon from "@mui/icons-material/Close"
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material"
import { ethers } from "ethers"
import { useCallback, useState } from "react"
import { FancyButton } from "../../../../../../components/fancyButton"
import { SwitchNetworkButton } from "../../../../../../components/switchNetwortButton"
import { ETHEREUM_CHAIN_ID } from "../../../../../../config"
import { useWeb3 } from "../../../../../../containers/web3"
import { metamaskErrorHandling } from "../../../../../../helpers/web3"
import { UserAsset } from "../../../../../../types/purchased_item"
import { Collection } from "../../../../../../types/types"
import { lock_endpoint } from "../SingleAsset721View"

interface UnstakeModalProps {
	collection: Collection
	open: boolean
	onClose: () => void
	asset: UserAsset
}

export const UnstakeModal = ({ open, onClose, asset, collection }: UnstakeModalProps) => {
	const { account, provider, currentChainId, changeChain } = useWeb3()
	const [error, setError] = useState<string>()
	const [unstakingLoading, setUnstakingLoading] = useState<boolean>(false)
	const [unstakingSuccess, setUnstakingSuccess] = useState<boolean>(false)

	// TODO: fix unstaking vinnie - 25/02/22
	const unstake = useCallback(async () => {
		if (!account || !provider) return
		try {
			setUnstakingLoading(true)
			const abi = ["function unstake(address,uint256)"]
			const signer = provider.getSigner()
			const nftstakeContract = new ethers.Contract(collection.stake_contract, abi, signer)
			const tx = await nftstakeContract.unstake(collection.mint_contract, asset.token_id)
			await fetch(lock_endpoint(account, collection.slug, asset.token_id), { method: "POST" })
			await tx.wait()
			setUnstakingSuccess(true)
		} catch (e: any) {
			const err = metamaskErrorHandling(e)
			err ? setError(err) : setError("Something went wrong, please try again")
		} finally {
			setUnstakingLoading(false)
		}
	}, [provider, asset, account, collection])

	return (
		<Dialog
			onClose={() => {
				if (unstakingLoading) return
				onClose()
			}}
			open={open}
		>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color="primary"
			>
				Transition Asset Off-World
				{!unstakingLoading && (
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
				)}
			</DialogTitle>
			<DialogContent
				sx={{
					paddingY: 0,
				}}
			>
				<Typography variant="h5" color="error" marginBottom=".5rem">
					GABS WARNING:
				</Typography>
				<Typography>Once off world, you will be required to pay gas to transition back on-world.</Typography>
			</DialogContent>
			<DialogActions
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "stretch",
					padding: "16px 24px",
				}}
			>
				{currentChainId && currentChainId.toString() === ETHEREUM_CHAIN_ID ? (
					<FancyButton
						loading={unstakingLoading}
						disabled={unstakingSuccess || unstakingLoading}
						onClick={() => {
							setError(undefined)
							unstake()
						}}
					>
						{unstakingSuccess ? "Successfully Transitioned" : "Begin Transition Off-world"}
					</FancyButton>
				) : (
					<SwitchNetworkButton open={open} changeChain={changeChain} currentChainId={currentChainId} setError={setError} />
				)}
			</DialogActions>
			{!!error && <Alert severity="error">{error}</Alert>}
		</Dialog>
	)
}
