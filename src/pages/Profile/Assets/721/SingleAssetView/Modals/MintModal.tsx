import CloseIcon from "@mui/icons-material/Close"
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material"
import { ethers } from "ethers"
import { useCallback, useState } from "react"
import { ConnectWallet } from "../../../../../../components/connectWallet"
import { FancyButton } from "../../../../../../components/fancyButton"
import { SwitchNetworkButton } from "../../../../../../components/switchNetwortButton"
import { API_ENDPOINT_HOSTNAME, ETHEREUM_CHAIN_ID } from "../../../../../../config"
import { MetaMaskState, useWeb3 } from "../../../../../../containers/web3"
import { metamaskErrorHandling } from "../../../../../../helpers/web3"
import { colors } from "../../../../../../theme"

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

	const mintAttempt = useCallback(
		async (mintingContract: string, assetExternalTokenID: number, collectionSlug: string) => {
			if (!currentChainId) return
			try {
				if (currentChainId.toString() !== ETHEREUM_CHAIN_ID) {
					setErrorMinting("Connected to wrong chain.")
					return
				}
				if (!provider) return
				setLoadingMint(true)
				// get nonce from mint contract
				// sen nonce, amount and user wallet addr to server
				// server validates they have enough sups
				// server generates a sig and returns it
				// submit that sig to mint contract mintSups func
				// listen on backend for update

				// A Human-Readable ABI; for interacting with the contract,
				// we must include any fragment we wish to use
				const abi = [
					"function nonces(address) view returns (uint256)",
					"function signedMint(uint256 tokenID, bytes signature, uint256 expiry)",
				]
				const signer = provider.getSigner()
				const mintContract = new ethers.Contract(mintingContract, abi, signer)
				const nonce = await mintContract.nonces(account)
				const mint_endpoint = `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/nfts/owner_address/${account}/nonce/${nonce}/collection_slug/${collectionSlug}/token_id/${assetExternalTokenID}`
				const resp = await fetch(mint_endpoint)
				if (resp.status !== 200) {
					const err = await resp.json()
					throw (err as any).message
				}
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
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Transition Asset Off World
				<IconButton
					onClick={() => {
						setErrorMinting(undefined)
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
			</DialogTitle>

			{metaMaskState === MetaMaskState.Active && currentChainId?.toString() === ETHEREUM_CHAIN_ID && (
				<DialogContent
					sx={{
						paddingY: 0,
					}}
				>
					<Typography marginBottom=".5rem" variant={"h5"} color={"error"}>
						GABS WARNING:
					</Typography>
					<Typography marginBottom=".5rem">
						Once you start the transition your asset off world it will be locked for the next five minutes to prepare for transport.
					</Typography>
				</DialogContent>
			)}

			<DialogActions
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "stretch",
					padding: "16px 24px",
				}}
			>
				{metaMaskState !== MetaMaskState.Active ? (
					<ConnectWallet />
				) : currentChainId && currentChainId.toString() === ETHEREUM_CHAIN_ID ? (
					<FancyButton
						loading={loadingMint}
						onClick={() => {
							setErrorMinting(undefined)
							mintAttempt(mintContract, assetExternalTokenID, collectionSlug)
						}}
					>
						Confirm and start transition
					</FancyButton>
				) : (
					<SwitchNetworkButton open={open} changeChain={changeChain} currentChainId={currentChainId} setError={setErrorMinting} />
				)}
				{errorMinting && <Typography sx={{ marginTop: "1rem", color: colors.supremacy.red }}>{errorMinting}</Typography>}
			</DialogActions>
		</Dialog>
	)
}
