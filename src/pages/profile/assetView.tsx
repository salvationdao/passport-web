import OpenseaLogo from "../../assets/images/opensea_logomark_white.svg"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import CloseIcon from "@mui/icons-material/Close"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import {
	Alert,
	Box,
	Button,
	ButtonProps,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Link,
	Paper,
	styled,
	Typography,
	useMediaQuery,
} from "@mui/material"
import isFuture from "date-fns/isFuture"
import { ethers } from "ethers"
import { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useHistory } from "react-router-dom"
import { SupTokenIcon } from "../../assets"
import { FancyButton } from "../../components/fancyButton"
import { InputField } from "../../components/form/inputField"
import { Loading } from "../../components/loading"
import { useSnackbar } from "../../containers/snackbar"
import { useWebsocket } from "../../containers/socket"
import { MetaMaskState, useWeb3 } from "../../containers/web3"
import { getStringFromShoutingSnakeCase } from "../../helpers"
import { supFormatter } from "../../helpers/items"
import { metamaskErrorHandling } from "../../helpers/web3"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Rarity } from "../../types/enums"
import { OnChainStatus, PurchasedItem, PurchasedItemAttributes, PurchasedItemResponse } from "../../types/purchased_item"
import { Attribute, Collection, User } from "../../types/types"
import { PercentageDisplay } from "./percentageDisplay"
import { rarityTextStyles } from "./profile"
import { formatDistanceToNow, formatDuration } from "date-fns"
import { API_ENDPOINT_HOSTNAME, ETHEREUM_CHAIN_ID } from "../../config"
import { ConnectWallet } from "../../components/connectWallet"
import { useInterval } from "react-use"

interface AssetViewProps {
	user: User
	purchasedItem: PurchasedItem
	collection: Collection
	numberAttributes: Attribute[]
	locked: boolean
	error: string | null
	ownerUsername: string
	disableRename: boolean
	showMint: boolean
	showStake: boolean
	showUnstake: boolean
	openseaURL: string
	showOpenseaURL: boolean
	onWorld: boolean
}
interface AssetViewContainerProps {
	user: User
	assetHash: string
}

export const AssetViewContainer = ({ user, assetHash }: AssetViewContainerProps) => {
	const { state, subscribe, send } = useWebsocket()
	const [purchasedItem, setPurchasedItem] = useState<PurchasedItem | null>(null)
	const [collectionSlug, setCollectionSlug] = useState<string | null>(null)
	const [collection, setCollection] = useState<Collection | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [numberAttributes, setNumberAttributes] = useState<Attribute[]>([])
	const [ownerUsername, setOwnerUsername] = useState<string | null>(null)
	useEffect(() => {
		if (!collectionSlug) return
		subscribe<Collection>(
			HubKey.CollectionUpdated,
			(payload) => {
				setCollection(payload)
			},
			{ slug: collectionSlug },
		)
	}, [collectionSlug])

	useEffect(() => {
		setLoading(true)
		try {
			return subscribe<PurchasedItemResponse>(
				HubKey.AssetUpdated,
				(payload) => {
					if (!payload) return
					let numberAttributes = new Array<Attribute>()
					let regularAttributes = new Array<Attribute>()

					const attributes = PurchasedItemAttributes(payload.purchased_item)
					attributes.forEach((a) => {
						if (a.display_type === "number") {
							numberAttributes.push(a)
						}
					})
					setNumberAttributes(numberAttributes)
					setPurchasedItem(payload.purchased_item)
					setOwnerUsername(payload.owner_username)
					setLoading(false)
					setCollectionSlug(payload.collection_slug)
				},
				{ asset_hash: assetHash },
			)
		} catch (e) {
			setError(typeof e === "string" ? e : "Something went wrong while fetching the item's data. Please try again later.")
		}
	}, [state, assetHash, subscribe])

	if (loading || !purchasedItem || !ownerUsername || !collection) {
		return (
			<Paper
				sx={{
					flexGrow: 1,
				}}
			>
				<Loading text={"Loading asset information..."} />.
			</Paper>
		)
	}
	const openseaURL =
		collection.mint_contract === "0xEEfaF47acaa803176F1711c1cE783e790E4E750D"
			? `https://testnets.opensea.io/assets/goerli/${collection.mint_contract}/${purchasedItem.external_token_id}`
			: `https://opensea.io/assets/${collection.mint_contract}/${purchasedItem.external_token_id}`
	const locked = isFuture(purchasedItem.unlocked_at)
	const disableRename = purchasedItem.on_chain_status === OnChainStatus.STAKABLE
	const showMint = purchasedItem.on_chain_status === OnChainStatus.MINTABLE
	const showStake = purchasedItem.on_chain_status === OnChainStatus.STAKABLE
	const showUnstake = purchasedItem.on_chain_status === OnChainStatus.UNSTAKABLE
	const showOpenseaURL = purchasedItem.on_chain_status !== OnChainStatus.MINTABLE
	const onWorld = purchasedItem.on_chain_status !== OnChainStatus.STAKABLE
	return (
		<AssetView
			locked={locked}
			onWorld={onWorld}
			openseaURL={openseaURL}
			showOpenseaURL={showOpenseaURL}
			disableRename={disableRename}
			showMint={showMint}
			showStake={showStake}
			showUnstake={showUnstake}
			user={user}
			ownerUsername={ownerUsername}
			purchasedItem={purchasedItem}
			collection={collection}
			error={error}
			numberAttributes={numberAttributes}
		/>
	)
}

export const AssetView = ({
	user,
	locked,
	purchasedItem,
	collection,
	numberAttributes,
	error,
	ownerUsername,
	disableRename,
	showMint,
	showStake,
	showUnstake,
	onWorld,
	openseaURL,
	showOpenseaURL,
}: AssetViewProps) => {
	const [remainingTime, setRemainingTime] = useState<string | null>(null)
	useInterval(() => {
		setRemainingTime(formatDistanceToNow(purchasedItem.unlocked_at))
	}, 1000)

	const history = useHistory()
	const [openLocked, setOpenLocked] = useState(isFuture(purchasedItem.unlocked_at))
	const { provider } = useWeb3()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const [mintWindowOpen, setMintWindowOpen] = useState(false)
	const [renameWindowOpen, setRenameWindowOpen] = useState(false)
	const [stakeModelOpen, setStakeModelOpen] = useState<boolean>(false)
	const [unstakeModelOpen, setUnstakeModelOpen] = useState<boolean>(false)

	if (error) {
		return (
			<Paper
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexGrow: 1,
				}}
			>
				{error}
			</Paper>
		)
	}

	const Buttons = () => {
		return (
			<>
				{showStake && (
					<FancyButton disabled={locked} size="small" onClick={() => setStakeModelOpen(true)}>
						Transition On-world {locked && "(Locked)"}
					</FancyButton>
				)}
				{showUnstake && (
					<FancyButton disabled={locked} size="small" onClick={() => setUnstakeModelOpen(true)}>
						Transition Off-world {locked && "(Locked)"}
					</FancyButton>
				)}
				{showMint && (
					<FancyButton disabled={locked} size="small" onClick={() => setMintWindowOpen(true)}>
						Transition Off-world {locked && "(Locked)"}
					</FancyButton>
				)}
				<FancyButton disabled={disableRename || locked} size="small" borderColor={colors.darkGrey} onClick={() => setRenameWindowOpen(true)}>
					Rename Asset {disableRename && "(On-world only)"} {locked && "(Locked)"}
				</FancyButton>
			</>
		)
	}

	return (
		<>
			{remainingTime && (
				<LockedModal
					remainingTime={remainingTime}
					unlocked_at={purchasedItem.unlocked_at}
					open={openLocked}
					setClose={() => {
						setOpenLocked(false)
					}}
				/>
			)}
			{collection && collection.mint_contract !== "" && (
				<MintModal
					open={mintWindowOpen}
					onClose={() => setMintWindowOpen(false)}
					mintContract={collection.mint_contract}
					assetExternalTokenID={purchasedItem.external_token_id}
					collectionSlug={collection.slug}
				/>
			)}
			<UpdateNameModal open={renameWindowOpen} onClose={() => setRenameWindowOpen(false)} asset={purchasedItem} userID={user.id} />
			<Paper
				sx={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					padding: "2rem",
				}}
			>
				<Link
					variant="h5"
					underline="hover"
					sx={{
						alignSelf: "start",
						display: "flex",
						alignItems: "center",
						marginBottom: "1rem",
						textTransform: "uppercase",
					}}
					color={colors.white}
					component={"button"}
					onClick={() => history.goBack()}
				>
					<ChevronLeftIcon />
					Go Back
				</Link>
				{!isWiderThan1000px && (
					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							gap: ".5rem",
							marginBottom: "1rem",
						}}
					>
						{Buttons()}
					</Box>
				)}
				<Box
					sx={{
						"& > *:not(:last-child)": {
							marginBottom: "1rem",
						},
					}}
				>
					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							gap: "1rem",
							justifyContent: "center",
						}}
					>
						<Box
							sx={{
								position: "relative",
								width: "100%",
								maxWidth: "350px",
							}}
						>
							<Box
								component="img"
								src={purchasedItem.data.mech.image_url}
								alt="Asset Image"
								sx={{
									width: "100%",
								}}
							/>
							<Box
								component="img"
								src={purchasedItem.data.mech.avatar_url}
								alt="Asset avatar"
								sx={{
									position: "absolute",
									bottom: "1rem",
									right: "1rem",
									height: "60px",
									width: "60px",
									objectFit: "contain",
									border: `1px solid ${colors.darkGrey}`,
									backgroundColor: colors.darkGrey,
								}}
							/>
						</Box>
						<Box
							sx={{
								flex: 1,
								flexBasis: "400px",
							}}
						>
							<Typography
								variant="h4"
								component="p"
								sx={{
									textTransform: "uppercase",
								}}
							>
								{purchasedItem.data.mech.name}
							</Typography>
							<Typography
								variant="body1"
								component="p"
								sx={{
									textTransform: "uppercase",
								}}
							>
								{purchasedItem.data.mech.label}
							</Typography>
							<Typography
								variant="h4"
								component="p"
								sx={{
									fontFamily: fonts.bizmoblack,
									fontStyle: "italic",
									letterSpacing: "2px",
									textTransform: "uppercase",
									...rarityTextStyles[purchasedItem.tier as Rarity],
								}}
							>
								{getStringFromShoutingSnakeCase(purchasedItem.tier)}
							</Typography>
							<Box
								sx={{
									display: "flex",
									alignItems: "baseline",
									gap: ".5rem",
								}}
							>
								<Typography variant="subtitle2" color={colors.darkGrey}>
									Owned By:
								</Typography>
								<Typography variant="subtitle1" color={colors.skyBlue}>
									{ownerUsername}
								</Typography>
							</Box>
							<Box
								sx={{
									display: "flex",
									alignItems: "baseline",
									gap: ".5rem",
								}}
							>
								<Typography variant="subtitle2" color={colors.darkGrey}>
									Current location:
								</Typography>
								<Typography variant="subtitle1" color={onWorld ? colors.skyBlue : colors.lightGrey}>
									{onWorld ? "On-world" : "Off-world"}
								</Typography>
							</Box>
							<Divider
								sx={{
									margin: ".5rem 0",
								}}
							/>

							{isWiderThan1000px && (
								<Box
									sx={{
										display: "flex",
										flexWrap: "wrap",
										gap: ".5rem",
									}}
								>
									{Buttons()}
								</Box>
							)}
						</Box>
					</Box>
					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							gap: "1rem",
							justifyContent: "center",
						}}
					>
						<Box
							sx={{
								flex: 1,
								flexBasis: "400px",
							}}
						>
							<Typography
								variant="subtitle1"
								color={colors.neonPink}
								sx={{
									textTransform: "uppercase",
									marginBottom: ".5rem",
								}}
							>
								Properties
							</Typography>
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
									gap: "1rem",
								}}
							>
								{numberAttributes &&
									numberAttributes.map((attr, i) => {
										return (
											<PercentageDisplay
												key={`${attr.trait_type}-${attr.value}-${i}`}
												displayValue={`${attr.value}`}
												label={attr.trait_type}
											/>
										)
									})}
							</Box>
						</Box>
						<Box
							sx={{
								flex: 1,
								flexBasis: "400px",
								"& > *:not(:last-child)": {
									marginBottom: "1rem",
								},
							}}
						>
							<Box>
								<Typography
									variant="subtitle1"
									color={colors.neonPink}
									sx={{
										textTransform: "uppercase",
									}}
								>
									Info
								</Typography>
								<Divider
									sx={{
										margin: ".5rem 0",
									}}
								/>
								<Typography variant="body1">Part of the {collection.name} collection.</Typography>
							</Box>
							<Box>
								<Typography
									variant="subtitle1"
									color={colors.neonPink}
									sx={{
										textTransform: "uppercase",
									}}
								>
									Details
								</Typography>
								<Divider
									sx={{
										margin: ".5rem 0",
									}}
								/>
								<Box
									sx={{
										display: "flex",
										flexDirection: "column",
										alignItems: "start",
									}}
								>
									{showOpenseaURL && (
										<Button component={"a"} href={openseaURL} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon />}>
											View on OpenSea
										</Button>
									)}

									<StyledDisabledButton>
										View Battle History Stats
										<Box component="span" sx={{ marginLeft: ".5rem", color: colors.darkGrey }}>
											(Coming soon)
										</Box>
									</StyledDisabledButton>
									<StyledDisabledButton>
										View Transaction History
										<Box component="span" sx={{ marginLeft: ".5rem", color: colors.darkGrey }}>
											(Coming soon)
										</Box>
									</StyledDisabledButton>
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>
				{provider && purchasedItem && (
					<StakeModel collection={collection} open={stakeModelOpen} asset={purchasedItem} onClose={() => setStakeModelOpen(false)} />
				)}
				{provider && purchasedItem && (
					<UnstakeModel collection={collection} open={unstakeModelOpen} asset={purchasedItem} onClose={() => setUnstakeModelOpen(false)} />
				)}
			</Paper>
		</>
	)
}

const StyledDisabledButton = styled(({ navigate, ...props }: ButtonProps & { navigate?: any }) => <Button {...props} variant="text" disabled />)({
	justifyContent: "start",
	color: `${colors.darkerGrey} !important`,
})

const UpdateNameModal = (props: { open: boolean; onClose: () => void; asset: PurchasedItem; userID: string }) => {
	const { open, onClose, asset, userID } = props
	const { send } = useWebsocket()
	const { displayMessage } = useSnackbar()
	const { control, handleSubmit, setValue } = useForm<{ name: string }>()
	const [loading, setLoading] = useState(false)

	const onSubmit = handleSubmit(async ({ name }) => {
		setLoading(true)
		try {
			await send<PurchasedItem>(HubKey.AssetUpdateName, {
				asset_hash: asset.hash,
				user_id: userID,
				name,
			})

			displayMessage("Asset successfully updated", "success")
			onClose()
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setLoading(false)
		}
	})

	// set default name
	useEffect(() => {
		setValue("name", asset.data.mech.name)
	}, [setValue])

	return (
		<Dialog onClose={() => onClose()} open={open}>
			<DialogTitle>Update Asset Name</DialogTitle>
			<DialogContent>
				<form onSubmit={onSubmit}>
					<InputField
						name="name"
						label="Name"
						type="name"
						control={control}
						rules={{
							required: "Name is required.",
						}}
						placeholder="Name"
						style={{ width: "300px" }}
						autoFocus
						disabled={loading}
						inputProps={{ maxLength: 10 }}
					/>
					<DialogActions>
						<>
							<Button variant="contained" type="submit" color="primary" disabled={loading}>
								Save
							</Button>
							<Button
								variant="contained"
								type="button"
								color="error"
								disabled={loading}
								onClick={() => {
									onClose()
								}}
							>
								Cancel
							</Button>
						</>
					</DialogActions>
				</form>
			</DialogContent>
		</Dialog>
	)
}

interface StakeModelProps {
	collection: Collection
	open: boolean
	onClose: () => void
	asset: PurchasedItem
}

const UnstakeModel = ({ open, onClose, asset, collection }: StakeModelProps) => {
	const { account, provider } = useWeb3()
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
			const tx = await nftstakeContract.unstake(collection.mint_contract, asset.external_token_id)
			await fetch(lock_endpoint(account, collection.slug, asset.external_token_id), { method: "POST" })
			await tx.wait()
			setUnstakingSuccess(true)
		} catch (e: any) {
			const err = metamaskErrorHandling(e)
			err ? setError(err) : setError("Something went wrong, please try again")
		} finally {
			setUnstakingLoading(false)
		}
	}, [provider, asset])

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
			</DialogActions>
			{!!error && <Alert severity="error">{error}</Alert>}
		</Dialog>
	)
}

const lock_endpoint = (account: string, collection_slug: string, token_id: number) => {
	return `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/nfts/owner_address/${account}/collection_slug/${collection_slug}/token_id/${token_id}`
}

const LockedModal = ({ remainingTime, open, unlocked_at, setClose }: { open: boolean; unlocked_at: Date; setClose: () => void; remainingTime: string }) => {
	return (
		<Dialog
			open={open}
			onClose={() => {
				setClose()
			}}
		>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color="primary"
			>
				Asset Preparing for Transport
			</DialogTitle>
			<DialogContent>
				<Typography variant="h5" color="error" marginBottom=".5rem">
					GABS WARNING:
				</Typography>
				<Typography>After beginning the transport process for your NFT, the asset is locked for five minutes.</Typography>
				<Typography variant={"subtitle1"}>Remaining: {remainingTime}</Typography>
			</DialogContent>
		</Dialog>
	)
}

const StakeModel = ({ open, onClose, asset, collection }: StakeModelProps) => {
	const { account, provider } = useWeb3()
	const [error, setError] = useState<string>()
	const [approvalLoading, setApprovalLoading] = useState<boolean>(false)
	const [approvalSuccess, setApprovalSuccess] = useState<boolean>(false)

	const [stakingLoading, setStakingLoading] = useState<boolean>(false)
	const [stakingSuccess, setStakingSuccess] = useState<boolean>(false)

	useEffect(() => {
		if (!provider) return
		// Check already approved
		const abi = ["function getApproved(uint256) view returns (address)"]

		const nftContract = new ethers.Contract(collection.mint_contract, abi, provider)
		nftContract.getApproved(asset.external_token_id).then((resp: string) => {
			setApprovalSuccess(resp === collection.stake_contract)
		})
	}, [provider])

	const approve = useCallback(async () => {
		if (!provider) return
		try {
			setApprovalLoading(true)
			const abi = ["function approve(address, uint256)"]
			const signer = provider.getSigner()
			// TODO: fix for collection contract
			const nftContract = new ethers.Contract(collection.mint_contract, abi, signer)
			const tx = await nftContract.approve(collection.stake_contract, asset.external_token_id)
			await tx.wait()
			setApprovalSuccess(true)
		} catch (e) {
			console.log(e)
			// setError(e)
		} finally {
			setApprovalLoading(false)
		}
	}, [provider, asset])

	const stake = useCallback(async () => {
		if (!account) return
		if (!provider) return
		try {
			setStakingLoading(true)
			const abi = ["function stake(address,uint256)"]
			const signer = provider.getSigner()
			const nftstakeContract = new ethers.Contract(collection.stake_contract, abi, signer)
			const tx = await nftstakeContract.stake(collection.mint_contract, asset.external_token_id)

			await fetch(lock_endpoint(account, collection.slug, asset.external_token_id), { method: "POST" })
			await tx.wait()
			setStakingSuccess(true)
		} catch (e: any) {
			const err = metamaskErrorHandling(e)
			err ? setError(err) : setError("Something went wrong, please try again")
		} finally {
			setStakingLoading(false)
		}
	}, [provider, asset])

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
				<Typography variant="h5" color="error" marginBottom=".5rem">
					GABS WARNING:
				</Typography>
				<Typography>To transition your items back on world it is a 2 part process, with each part requiring fees.</Typography>
			</DialogContent>
			<DialogActions
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "stretch",
					padding: "16px 24px",
				}}
				disableSpacing
			>
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
				{!!error && (
					<Typography variant={"body1"} color={colors.supremacy.red}>
						{error}
					</Typography>
				)}
			</DialogActions>
		</Dialog>
	)
}

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
				const mint_endpoint = `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/nfts/owner_address/${account}/nonce/${nonce}/collection_slug/${collectionSlug}/token_id/${assetExternalTokenID}`
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
				console.error(err)
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
				) : currentChainId?.toString() === ETHEREUM_CHAIN_ID ? (
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
					<FancyButton borderColor={colors.darkGrey} onClick={async () => await changeChainToETH()}>
						Switch Network
					</FancyButton>
				)}
				{errorMinting && <Typography sx={{ marginTop: "1rem", color: colors.supremacy.red }}>{errorMinting}</Typography>}
			</DialogActions>
		</Dialog>
	)
}
