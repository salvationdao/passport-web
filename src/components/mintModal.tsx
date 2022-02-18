import { Alert, Box, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { useWeb3, MetaMaskState } from "../containers/web3"
import { ethers } from "ethers"
import { FancyButton } from "./fancyButton"
import { ETHEREUM_CHAIN_ID, NFT_CONTRACT_ADDRESS } from "../config"
import { ConnectWallet } from "./connectWallet"

interface MintModalProps {
	open: boolean
	onClose: () => void
	tokenID: string
	mintingSignature?: string | undefined
}

interface GetSignatureResponse {
	messageSignature: string
}

export const MintModal = ({ open, onClose, tokenID, mintingSignature }: MintModalProps) => {
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

	const mintAttempt = useCallback(async () => {
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
			const abi = ["function nonces(address) view returns (uint256)", "function signedMint(uint256 tokenID, bytes signature)"]
			const signer = provider.getSigner()
			const mintContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, signer)
			if (mintingSignature && mintingSignature !== "") {
				await mintContract.signedMint(tokenID, mintingSignature)
				setErrorMinting(undefined)
				return
			}

			const nonce = await mintContract.nonces(account)
			const resp = await fetch(`/api/mint-nft/${account}/${nonce}/${tokenID}`)
			const respJson: GetSignatureResponse = await resp.json()
			await mintContract.signedMint(tokenID, respJson.messageSignature)
			setErrorMinting(undefined)
			onClose()
		} catch (e) {
			setErrorMinting(e === "string" ? e : "Issue minting, please try again or contact support.")
		} finally {
			setLoadingMint(false)
		}
	}, [provider, account, tokenID, mintingSignature, currentChainId, onClose])

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
						<FancyButton onClick={() => mintAttempt()}>
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