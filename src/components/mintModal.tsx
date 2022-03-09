import { Alert, Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"
import { ethers } from "ethers"
import React, { useCallback, useEffect, useState } from "react"
import { API_ENDPOINT_HOSTNAME, ETHEREUM_CHAIN_ID } from "../config"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { metamaskErrorHandling } from "../helpers/web3"
import { ConnectWallet } from "./connectWallet"
import { FancyButton } from "./fancyButton"

interface MintModalProps {
	open: boolean
	onClose: () => void
	assetExternalTokenID: number
	mintContract: string
	collectionSlug: string
}

interface GetSignatureResponse {
	messageSignature: string
	expiry: number
}

export const MintModal = ({ open, onClose, assetExternalTokenID, collectionSlug, mintContract }: MintModalProps) => {
	const { account, provider, currentChainId, changeChain, metaMaskState } = useWeb3()
	const [loadingMint, setLoadingMint] = useState<boolean>(false)
	const [errorMinting, setErrorMinting] = useState<string>()

	// check on chain ID and if chain Id != eth chain display button to change
	const changeChainToETH = useCallback(async () => {
		if (open && currentChainId?.toString() !== ETHEREUM_CHAIN_ID) {
			await changeChain(parseInt(ETHEREUM_CHAIN_ID, 0))
		}
	}, [currentChainId, changeChain, open])

	useEffect(() => {
		changeChainToETH()
	}, [changeChainToETH])

	const mintAttempt = useCallback(
		async (mintingContract: string, assetExternalTokenID: number, collectionSlug: string) => {
			try {
				if (currentChainId?.toString() !== ETHEREUM_CHAIN_ID) {
					setErrorMinting("Connected to wrong chain.")
					return
				}
				if (!provider) return
				setLoadingMint(true)
				// get nonce from mint contract
				// send nonce, amount and user wallet addr to server
				// server validates they have enough sups
				// server generates a sig and returns it
				// submit that sig to mint contract mintSups func
				// listen on backend for update

				// A Human-Readable ABI; for interacting with the contract,
				// we must include any fragment we wish to use
				const abi = ["function nonces(address) view returns (uint256)", "function signedMint(uint256 tokenID, bytes signature, uint256 expiry)"]
				const signer = provider.getSigner()
				const mintContract = new ethers.Contract(mintingContract, abi, signer)

				const nonce = await mintContract.nonces(account)
				const resp = await fetch(
					`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/mint-nft/${account}/${nonce}/${collectionSlug}/${assetExternalTokenID}`,
				)
				const respJson: GetSignatureResponse = await resp.clone().json()
				const tx = await mintContract.signedMint(assetExternalTokenID, respJson.messageSignature, respJson.expiry)
				await tx.wait()
				setErrorMinting(undefined)
				onClose()
			} catch (e: any) {
				const err = metamaskErrorHandling(e)
				err ? setErrorMinting(err) : setErrorMinting("Issue minting, please try again or contact support.")
			} finally {
				setLoadingMint(false)
			}
		},
		[provider, account, currentChainId, onClose],
	)

	return (
		<Dialog
			open={open}
			onClose={() => {
				setErrorMinting(undefined)
				onClose()
			}}
			maxWidth={"xl"}
		>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Transition Asset Off World
			</DialogTitle>

			<DialogContent sx={{ minWidth: 0, paddingTop: "1.5rem !important" }}>
				<Box sx={{ display: "flex", flexDirection: "column" }}>
					{metaMaskState !== MetaMaskState.Active && <ConnectWallet />}

					{metaMaskState === MetaMaskState.Active && (
						<>
							{currentChainId?.toString() === ETHEREUM_CHAIN_ID ? (
								<>
									<Typography marginBottom=".5rem" variant={"h5"} color={"error"}>
										GABS WARNING:
									</Typography>
									<Typography marginBottom=".5rem">
										Once you start the transition of your asset to off world it will cease to be usable until either:
									</Typography>
									<Box component="ul" margin={0}>
										<li>The fee is paid and the process is completed where we will revoke access until re-staked </li>
										<li>The fee to cancel the transition is complete</li>
									</Box>
								</>
							) : (
								<FancyButton onClick={async () => await changeChainToETH()}>Switch Network</FancyButton>
							)}
						</>
					)}
				</Box>
			</DialogContent>
			{metaMaskState === MetaMaskState.Active && currentChainId?.toString() === ETHEREUM_CHAIN_ID && (
				<>
					<DialogActions
						sx={{
							display: "flex",
							width: "100%",
							justifyContent: "end",
							"@media (max-width: 500px)": {
								flexDirection: "column",
								alignItems: "stretch",
							},
						}}
					>
						<FancyButton
							loading={loadingMint}
							onClick={() => {
								setErrorMinting(undefined)
								mintAttempt(mintContract, assetExternalTokenID, collectionSlug)
							}}
						>
							Confirm and start transition
						</FancyButton>
					</DialogActions>
					{errorMinting && <Alert severity={"error"}>{errorMinting}</Alert>}
				</>
			)}
		</Dialog>
	)
}
