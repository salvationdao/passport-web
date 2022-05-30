import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { Box, Button, ButtonProps, Dialog, Divider, Link, Stack, styled, Typography, useMediaQuery } from "@mui/material"
import { formatDistanceToNow } from "date-fns"
import isFuture from "date-fns/isFuture"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useHistory } from "react-router-dom"
import { useInterval } from "react-use"
import { FancyButton } from "../../../../../components/fancyButton"
import { Loading } from "../../../../../components/loading"
import { API_ENDPOINT_HOSTNAME } from "../../../../../config"
import { useWeb3 } from "../../../../../containers/web3"
import { getStringFromShoutingSnakeCase } from "../../../../../helpers"
import HubKey from "../../../../../keys"
import { colors, fonts } from "../../../../../theme"
import { Rarity } from "../../../../../types/enums"
import { OnChainStatus, UserAsset } from "../../../../../types/purchased_item"
import { Collection, User } from "../../../../../types/types"
import { usePassportCommandsUser } from "../../../../../hooks/usePassport"
import { rarityTextStyles } from "../../../../../helpers/items"
import { StakeModal } from "./Modals/StakeModal"
import { UnstakeModal } from "./Modals/UnstakeModal"
import { LockedModal } from "./Modals/LockedModal"
import { MintModal } from "./Modals/MintModal"
import { TransferModal } from "./Modals/TransferModal"
import { Attributes } from "./Attributes"

export const lock_endpoint = (account: string, collection_slug: string, token_id: number) => {
	return `${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/nfts/owner_address/${account}/collection_slug/${collection_slug}/token_id/${token_id}`
}

export interface UserAssetResponse {
	user_asset: UserAsset
	owner: User // only `faction_id` and `username` is populated
	collection: Collection
}

interface SingleAsset721ViewProps {
	assetHash: string
	edit: boolean
}

export const SingleAsset721View = ({ assetHash, edit }: SingleAsset721ViewProps) => {
	const { send } = usePassportCommandsUser("/commander")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [userAsset, setUserAsset] = useState<UserAsset>()
	const [owner, setOwner] = useState<User>()
	const [collection, setCollection] = useState<Collection>()

	const loadAsset = useCallback(() => {
		;(async () => {
			try {
				setLoading(true)
				const resp = await send<UserAssetResponse>(HubKey.AssetGet721, {
					asset_hash: assetHash,
				})

				if (!resp) return
				setUserAsset(resp.user_asset)
				setOwner(resp.owner)
				setCollection(resp.collection)
			} catch (e) {
				console.error(e)
				setError(typeof e === "string" ? e : "Something went wrong while fetching the item's data. Please try again later.")
			} finally {
				setLoading(false)
			}
		})()
	}, [assetHash, send])

	useEffect(() => {
		loadAsset()
	}, [loadAsset])

	if (loading || !userAsset || !owner || !collection) {
		return (
			<Stack sx={{ flexGrow: 1, p: "2rem", height: "100%" }}>
				<Loading text={"Loading asset information..."} />
			</Stack>
		)
	}

	const openseaURL =
		collection.mint_contract === "0xEEfaF47acaa803176F1711c1cE783e790E4E750D"
			? `https://testnets.opensea.io/assets/goerli/${collection.mint_contract}/${userAsset.token_id}`
			: `https://opensea.io/assets/${collection.mint_contract}/${userAsset.token_id}`
	const locked = isFuture(userAsset.unlocked_at)
	const showMint = userAsset.on_chain_status === OnChainStatus.MINTABLE
	const showStake = userAsset.on_chain_status === OnChainStatus.STAKABLE
	const showUnstake = userAsset.on_chain_status === OnChainStatus.UNSTAKABLE
	const showOpenseaURL = userAsset.on_chain_status !== OnChainStatus.MINTABLE
	const onWorld = userAsset.on_chain_status !== OnChainStatus.STAKABLE

	return (
		<AssetView
			locked={locked}
			onWorld={onWorld}
			openseaURL={openseaURL}
			showOpenseaURL={showOpenseaURL}
			showMint={showMint}
			showStake={showStake}
			showUnstake={showUnstake}
			owner={owner}
			userAsset={userAsset}
			collection={collection}
			error={error}
			edit={edit}
			loadAsset={loadAsset}
		/>
	)
}

interface AssetViewProps {
	owner: User
	userAsset: UserAsset
	collection: Collection
	locked: boolean
	error: string | null
	showMint: boolean
	showStake: boolean
	showUnstake: boolean
	openseaURL: string
	showOpenseaURL: boolean
	onWorld: boolean
	edit: boolean
	loadAsset: () => void
}

export const AssetView = ({
	locked,
	userAsset,
	collection,
	error,
	owner,
	showMint,
	showStake,
	showUnstake,
	onWorld,
	openseaURL,
	showOpenseaURL,
	edit,
	loadAsset,
}: AssetViewProps) => {
	const [remainingTime, setRemainingTime] = useState<string | null>(null)
	useInterval(() => {
		setRemainingTime(formatDistanceToNow(userAsset.unlocked_at))
	}, 1000)

	const history = useHistory()
	const [openLocked, setOpenLocked] = useState(isFuture(userAsset.unlocked_at))
	const { provider } = useWeb3()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	const [mintWindowOpen, setMintWindowOpen] = useState(false)
	const [stakeModalOpen, setStakeModalOpen] = useState<boolean>(false)
	const [unstakeModalOpen, setUnstakeModalOpen] = useState<boolean>(false)
	const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false)
	const [enlarge, setEnlarge] = useState<boolean>(false)
	const videoDiv = useRef<HTMLVideoElement | undefined>()

	useEffect(() => {
		if (!videoDiv || !videoDiv.current) return
		if (enlarge) {
			videoDiv.current.pause()
		} else {
			videoDiv.current.play()
		}
	}, [enlarge])

	const Buttons = useMemo(() => {
		if (userAsset.locked_to_service_name && !showStake) {
			return (
				<FancyButton size="small" onClick={() => setTransferModalOpen(true)}>
					Transition from {userAsset.locked_to_service_name} to XSYN
				</FancyButton>
			)
		}

		return (
			<>
				{!showStake && (
				<FancyButton disabled={locked} size="small" onClick={() => setTransferModalOpen(true)}>
					Transition from XSYN to Supremacy
				</FancyButton>)}

				{showStake && (
					<FancyButton disabled={locked} size="small" onClick={() => setStakeModalOpen(true)}>
						Transition On-world {locked && "(Locked)"}
					</FancyButton>
				)}

				{showUnstake && (
					<FancyButton disabled={locked} size="small" onClick={() => setUnstakeModalOpen(true)}>
						Transition Off-world {locked && "(Locked)"}
					</FancyButton>
				)}

				{showMint && (
					<FancyButton disabled={locked} size="small" onClick={() => setMintWindowOpen(true)}>
						Transition Off-world {locked && "(Locked)"}
					</FancyButton>
				)}
			</>
		)
	}, [locked, showMint, showStake, showUnstake, userAsset.locked_to_service_name])

	if (error) {
		return (
			<Stack alignItems="center" justifyContent="center" sx={{ flexGrow: 1, p: "2rem" }}>
				{error}
			</Stack>
		)
	}

	return (
		<>
			<Stack sx={{ flexGrow: 1, p: "2rem" }}>
				<Link
					variant="h5"
					underline="hover"
					sx={{
						alignSelf: "start",
						display: "flex",
						alignItems: "center",
						mb: "1rem",
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
					<Stack spacing=".5rem" alignItems="flex-start" sx={{ mb: "1rem" }}>
						{edit && Buttons}
					</Stack>
				)}
				<Stack spacing="1rem">
					<Box
						sx={{
							display: "flex",
							flexWrap: "wrap",
							gap: "1.6rem",
						}}
					>
						<Box
							sx={{
								position: "relative",
								width: "100%",
								maxWidth: "23rem",
							}}
						>
							<Box
								component="video"
								sx={{
									width: "100%",
									cursor: enlarge ? "zoom-out" : "zoom-in",
									transition: "all 0.2s ease-in",
									":hover": {
										boxShadow: `0px 5px 10px 5px ${colors.neonBlue}30`,
										transform: "translateY(-5px)",
									},
								}}
								loop
								muted
								autoPlay
								onClick={() => {
									setEnlarge(!enlarge)
								}}
								poster={`${userAsset.image_url}`}
								ref={videoDiv}
							>
								<source src={userAsset.animation_url} type="video/mp4" />
							</Box>

							<Box
								component="img"
								src={userAsset.avatar_url}
								alt="Asset avatar"
								sx={{
									position: "absolute",
									bottom: "1rem",
									right: "1rem",
									height: "4rem",
									width: "4rem",
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
								sx={{
									textTransform: "uppercase",
								}}
							>
								{userAsset.name}
							</Typography>
							<Typography
								variant="h4"
								sx={{
									fontFamily: fonts.bizmoblack,
									fontStyle: "italic",
									letterSpacing: "2px",
									textTransform: "uppercase",
									...rarityTextStyles[userAsset.tier as Rarity],
								}}
							>
								{getStringFromShoutingSnakeCase(userAsset.tier)}
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
									{owner.username}
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
									{userAsset.locked_to_service_name ? userAsset.locked_to_service_name : onWorld ? "XSYN On-world" : "Off-world"}
								</Typography>
							</Box>

							<Divider sx={{ mt: ".6rem", mb: "1rem" }} />

							{isWiderThan1000px && (
								<Stack spacing=".5rem" alignItems="flex-start">
									{edit && Buttons}
								</Stack>
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
						<Attributes userAsset={userAsset} />

						<Box
							sx={{
								flex: 1,
								flexBasis: "400px",
								"& > *:not(:last-child)": {
									mb: "1rem",
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
										m: ".5rem 0",
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
										m: ".5rem 0",
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
										<Button
											component={"a"}
											href={openseaURL}
											target="_blank"
											rel="noopener noreferrer"
											endIcon={<OpenInNewIcon />}
										>
											View on OpenSea
										</Button>
									)}

									<StyledDisabledButton>
										View Battle History Stats
										<Box component="span" sx={{ ml: ".5rem", color: colors.darkGrey }}>
											(Coming soon)
										</Box>
									</StyledDisabledButton>
									<StyledDisabledButton>
										View Transaction History
										<Box component="span" sx={{ ml: ".5rem", color: colors.darkGrey }}>
											(Coming soon)
										</Box>
									</StyledDisabledButton>
								</Box>
							</Box>
						</Box>
					</Box>
				</Stack>

				{enlarge && (
					<Dialog
						open={enlarge}
						PaperProps={{
							sx: {
								maxWidth: "unset",
							},
						}}
						onClose={() => {
							setEnlarge(!enlarge)
						}}
					>
						<Box
							component="video"
							sx={{
								height: "80vh",
								cursor: "zoom-out",
							}}
							loop
							muted
							autoPlay
							onClick={() => {
								setEnlarge(!enlarge)
							}}
							poster={`${userAsset.large_image_url}`}
						>
							<source src={userAsset.animation_url} type="video/mp4" />
						</Box>
					</Dialog>
				)}
			</Stack>

			{remainingTime && (
				<LockedModal
					remainingTime={remainingTime}
					unlocked_at={userAsset.unlocked_at}
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
					assetExternalTokenID={userAsset.token_id}
					collectionSlug={collection.slug}
				/>
			)}

			{provider && userAsset && (
				<StakeModal collection={collection} open={stakeModalOpen} asset={userAsset} onClose={() => setStakeModalOpen(false)} />
			)}

			{provider && userAsset && (
				<UnstakeModal collection={collection} open={unstakeModalOpen} asset={userAsset} onClose={() => setUnstakeModalOpen(false)} />
			)}

			<TransferModal open={transferModalOpen} onClose={() => setTransferModalOpen(false)} onSuccess={loadAsset} userAsset={userAsset} />
		</>
	)
}

const StyledDisabledButton = styled(({ navigate, ...props }: ButtonProps & { navigate?: any }) => <Button {...props} variant="text" disabled />)({
	justifyContent: "start",
	color: `${colors.darkerGrey} !important`,
})
