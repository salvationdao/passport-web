import CloseIcon from "@mui/icons-material/Close"
import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material"
import { ethers } from "ethers"
import { useCallback, useState } from "react"
import { FancyButton } from "../../../../../../components/fancyButton"
import { SwitchNetworkButton } from "../../../../../../components/switchNetwortButton"
import {API_ENDPOINT_HOSTNAME, ETHEREUM_CHAIN_ID} from "../../../../../../config"
import { useWeb3 } from "../../../../../../containers/web3"
import { metamaskErrorHandling } from "../../../../../../helpers/web3"
import {OnChainStatus, UserAsset} from "../../../../../../types/purchased_item"
import { Collection } from "../../../../../../types/types"
import { lock_endpoint } from "../SingleAsset721View"

interface UnstakeModalProps {
	collection: Collection
	open: boolean
	onClose: () => void
	asset: UserAsset
}

interface GetSignatureResponse {
	messageSignature: string
	expiry: number
}


export const UnstakeModal = ({ open, onClose, asset, collection }: UnstakeModalProps) => {
	const { account, provider, currentChainId, changeChain } = useWeb3()
	const [error, setError] = useState<string>()
	const [unstakingLoading, setUnstakingLoading] = useState<boolean>(false)
	const [unstakingSuccess, setUnstakingSuccess] = useState<boolean>(false)

	const unstake = useCallback(async () => {
		if (!account || !provider) return
		try {
			setUnstakingLoading(true)
			setError(undefined)

			// handle new stakes
			if (asset.on_chain_status === OnChainStatus.UNSTAKABLE) {
				// get nonce
				const abi = [
					"function nonces(address) view returns (uint256)",
					"function signedUnstake(address collection, uint256 tokenID, bytes signature, uint256 expiry)",
				]
				const signer = provider.getSigner()
				const unstakeContract = new ethers.Contract(collection.stake_contract, abi, signer)
				const nonce = await unstakeContract.nonces(account)
				const unstake_endpoint = `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/nfts/unstake/owner_address/${account}/nonce/${nonce}/collection_slug/${collection.slug}/token_id/${asset.token_id}`
				const resp = await fetch(unstake_endpoint)
				if (resp.status !== 200) {
					const err = await resp.json()
					setError((err as any).message)
					return
				}
				const respJson = await resp.json() as GetSignatureResponse
				const tx = await unstakeContract.signedUnstake(collection.mint_contract, asset.token_id, respJson.messageSignature, respJson.expiry)
				await tx.wait()
			}

			// handle old stakes
			if (asset.on_chain_status === OnChainStatus.UNSTAKABLE_OLD) {
				const abi = ["function unstake(address,uint256)"]
				const signer = provider.getSigner()
				const nftstakeContract = new ethers.Contract(collection.staking_contract_old, abi, signer)
				await fetch(lock_endpoint(account, collection.slug, asset.token_id), { method: "POST" })
				const tx = await nftstakeContract.unstake(collection.mint_contract, asset.token_id)
				await tx.wait()
			}
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
