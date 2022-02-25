import { Alert, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { useWeb3, MetaMaskState } from "../containers/web3"
import { BigNumber, ethers } from "ethers"
import { FancyButton } from "./fancyButton"
import { API_ENDPOINT_HOSTNAME, ETHEREUM_CHAIN_ID } from "../config"
import { ConnectWallet } from "./connectWallet"

interface MintModalProps {
	open: boolean
	onClose: () => void
	assetExternalTokenID: number
	mintContract: string
	mintingSignature?: string | undefined
	signatureExpiry?: string | undefined
	collectionSlug: string
}

interface GetSignatureResponse {
	messageSignature: string
	expiry: number
}

export const MintModal = ({ open, onClose, assetExternalTokenID, collectionSlug, mintContract, mintingSignature, signatureExpiry }: MintModalProps) => {
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
		async (mintingContract: string, assetExternalTokenID: number, collectionSlug: string, mintingSignature?: string, signatureExpiry?: string) => {
			try {
				if (!mintingContract || mintingContract === "") {
					setErrorMinting("Missing collection contract information.")
					return
				}
				if (!collectionSlug || collectionSlug === "") {
					setErrorMinting("Missing collection slug.")
					return
				}
				if (!assetExternalTokenID) {
					setErrorMinting("Item token id.")
					return
				}
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
				// TODO: get the expiry/handle it
				if (signatureExpiry) {
					const sigExInt = parseInt(signatureExpiry)
					const expiryDate = new Date(sigExInt * 1000)

					if (mintingSignature && mintingSignature !== "" && expiryDate > new Date()) {
						await mintContract.signedMint(BigNumber.from(assetExternalTokenID), mintingSignature, sigExInt)
						setErrorMinting(undefined)
						return
					}
				}

				const nonce = await mintContract.nonces(account)
				const resp = await fetch(
					`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/mint-nft/${account}/${nonce}/${collectionSlug}/${assetExternalTokenID}`,
				)
				const respJson: GetSignatureResponse = await resp.json()
				const tx = await mintContract.signedMint(assetExternalTokenID, respJson.messageSignature, respJson.expiry)
				await tx.wait()
				setErrorMinting(undefined)
				onClose()
			} catch (e) {
				console.log(e)
				setErrorMinting(e === "string" ? e : "Issue minting, please try again or contact support.")
			} finally {
				setLoadingMint(false)
			}
		},
		[provider, account, currentChainId, onClose],
	)

	return (
		<Dialog open={open} onClose={onClose} maxWidth={"xl"}>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Transition Asset Off World
			</DialogTitle>

			<DialogContent sx={{ paddingTop: "1.5rem !important", minWidth: "400px" }}>
				<Box sx={{ display: "flex", flexDirection: "column" }}>
					{metaMaskState !== MetaMaskState.Active && <ConnectWallet />}

					{metaMaskState === MetaMaskState.Active && (
						<>
							{currentChainId?.toString() !== ETHEREUM_CHAIN_ID && (
								<FancyButton onClick={async () => await changeChainToETH()}>Switch Network</FancyButton>
							)}
							{currentChainId?.toString() === ETHEREUM_CHAIN_ID && (
								<>
									<Typography variant={"h5"} color={"error"}>
										GABS WARNING:
									</Typography>
									<Typography>Once you start the transition of your asset to off world it will cease to be usable until either; </Typography>
									<Typography>* The fee is paid and the process is completed where we will revoke access until re-staked </Typography>
									<Typography>* The fee to cancel the transition is complete</Typography>
								</>
							)}
						</>
					)}
				</Box>
			</DialogContent>
			{metaMaskState === MetaMaskState.Active && currentChainId?.toString() === ETHEREUM_CHAIN_ID && (
				<DialogActions sx={{ display: "flex", width: "100%", justifyContent: "space-between", flexDirection: "row-reverse" }}>
					{!loadingMint && (
						<FancyButton onClick={() => mintAttempt(mintContract, assetExternalTokenID, collectionSlug, mintingSignature, signatureExpiry)}>
							{mintingSignature !== "" ? "Continue transition" : "Confirm and start transition"}
						</FancyButton>
					)}
					{loadingMint && <CircularProgress color={"primary"} />}
					{errorMinting && <Alert severity={"error"}>{errorMinting}</Alert>}
				</DialogActions>
			)}
		</Dialog>
	)
}
