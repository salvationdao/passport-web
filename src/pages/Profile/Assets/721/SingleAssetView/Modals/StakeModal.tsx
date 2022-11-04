import CloseIcon from "@mui/icons-material/Close"
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material"
import { ethers } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { FancyButton } from "../../../../../../components/fancyButton"
import { SwitchNetworkButton } from "../../../../../../components/switchNetwortButton"
import { ETHEREUM_CHAIN_ID } from "../../../../../../config"
import { useWeb3 } from "../../../../../../containers/web3"
import { metamaskErrorHandling } from "../../../../../../helpers/web3"
import { colors } from "../../../../../../theme"
import { UserAsset } from "../../../../../../types/purchased_item"
import { Collection } from "../../../../../../types/types"
import { lock_endpoint } from "../SingleAsset721View"

interface StakeModelProps {
	collection: Collection
	open: boolean
	onClose: () => void
	asset: UserAsset
	reloadAsset: () => void
}

export const StakeModal = ({ open, onClose, asset, collection, reloadAsset }: StakeModelProps) => {
	const { account, provider, currentChainId, changeChain } = useWeb3()
	const [error, setError] = useState<string>()
	const [approvalLoading, setApprovalLoading] = useState<boolean>(false)
	const [approvalSuccess, setApprovalSuccess] = useState<boolean>(false)

	const [stakingLoading, setStakingLoading] = useState<boolean>(false)
	const [stakingSuccess, setStakingSuccess] = useState<boolean>(false)

	useEffect(() => {
		if (!provider) return // Check already approved
		;(async () => {
			try {
				setError(undefined)
				const abi = ["function getApproved(uint256) view returns (address)"]

				const nftContract = new ethers.Contract(collection.mint_contract, abi, provider)
				const resp = await nftContract.getApproved(asset.token_id)

				if (resp) {
					setApprovalSuccess(resp === collection.stake_contract)
				}
			} catch (e) {
				const err = metamaskErrorHandling(e)
				err ? setError(err) : setError("Could not check if already approved")
			}
		})()
	}, [provider, collection, asset])

	const approve = useCallback(async () => {
		if (!provider) return
		try {
			setError(undefined)
			setApprovalLoading(true)
			const abi = ["function approve(address, uint256)"]
			const signer = provider.getSigner()
			// TODO: fix for collection contract
			const nftContract = new ethers.Contract(collection.mint_contract, abi, signer)
			const tx = await nftContract.approve(collection.stake_contract, asset.token_id)
			await tx.wait()
			setApprovalSuccess(true)
		} catch (e) {
			const err = metamaskErrorHandling(e)
			err ? setError(err) : setError("Could not check if already approved")
		} finally {
			setApprovalLoading(false)
		}
	}, [provider, asset, collection])

	const stake = useCallback(async () => {
		if (!account) return
		if (!provider) return
		try {
			setError(undefined)
			setStakingLoading(true)
			const abi = ["function stake(address,uint256)"]
			const signer = provider.getSigner()
			const nftstakeContract = new ethers.Contract(collection.stake_contract, abi, signer)
			await fetch(lock_endpoint(account, collection.slug, asset.token_id), { method: "POST" })
			const tx = await nftstakeContract.stake(collection.mint_contract, asset.token_id)
			await tx.wait()
			setStakingSuccess(true)
			reloadAsset()
		} catch (e: any) {
			const err = metamaskErrorHandling(e)
			err ? setError(err) : setError("Something went wrong, please try again")
		} finally {
			setStakingLoading(false)
		}
	}, [provider, account, asset, collection, reloadAsset])

	return (
		<Dialog
			onClose={() => {
				if (approvalLoading) return
				if (stakingLoading) return
				if (approvalSuccess) return
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
				Transition Asset On World
				{!approvalLoading && (
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
			<DialogContent sx={{ paddingY: 0 }}>
				{currentChainId && currentChainId.toString() === ETHEREUM_CHAIN_ID ? (
					<>
						<Typography variant="h5" color="error" marginBottom=".5rem">
							GABS WARNING:
						</Typography>
						<Typography>To transition your items back on world it is a 2 part process, with each part requiring fees.</Typography>
					</>
				) : (
					<>
						<Typography variant="h5" color="error" marginBottom=".5rem">
							Switch network to continue
						</Typography>
					</>
				)}
			</DialogContent>

			<DialogActions
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "stretch",
					p: "16px 24px",
				}}
				disableSpacing
			>
				{currentChainId && currentChainId.toString() === ETHEREUM_CHAIN_ID ? (
					<>
						<Typography variant="subtitle1">Step 1: Approve the transaction to transition your item.</Typography>
						<FancyButton
							sx={{
								marginBottom: "1rem",
							}}
							loading={approvalLoading}
							disabled={approvalSuccess || approvalLoading}
							onClick={approve}
						>
							{approvalSuccess ? "Successfully Approved" : "Approve"}
						</FancyButton>
						<Typography variant="subtitle1" color={!approvalSuccess ? colors.darkerGrey : colors.white}>
							Step 2: Transition your item on world.
						</Typography>
						<FancyButton loading={stakingLoading} disabled={!approvalSuccess || stakingSuccess || stakingLoading} onClick={stake}>
							{stakingSuccess ? "Successfully Transitioned" : "Transition"}
						</FancyButton>
					</>
				) : (
					<SwitchNetworkButton open={open} changeChain={changeChain} currentChainId={currentChainId} setError={setError} />
				)}
				{!!error && (
					<Typography variant={"body1"} color={colors.supremacy.red}>
						{error}
					</Typography>
				)}
			</DialogActions>
		</Dialog>
	)
}
