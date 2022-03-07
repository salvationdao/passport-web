import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import {
	Alert,
	Box,
	Button,
	ButtonProps,
	Chip,
	ChipProps,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	Link,
	Paper,
	styled,
	SwipeableDrawer,
	Typography,
	useMediaQuery,
} from "@mui/material"
import { ethers } from "ethers"
import React, { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link as RouterLink, useHistory, useParams } from "react-router-dom"
import { GradientHeartIconImagePath, SupTokenIcon } from "../../assets"
import WarMachine from "../../assets/images/WarMachine.png"
import { FancyButton, FancyButtonProps } from "../../components/fancyButton"
import { InputField } from "../../components/form/inputField"
import { Navbar, ProfileButton } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { MintModal } from "../../components/mintModal"
import { SearchBar } from "../../components/searchBar"
import { Sort } from "../../components/sort"
import { useAsset } from "../../containers/assets"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import { useWeb3 } from "../../containers/web3"
import { middleTruncate } from "../../helpers"
import { getItemAttributeValue, supFormatter } from "../../helpers/items"
import { useQuery } from "../../hooks/useSend"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { NilUUID } from "../../types/auth"
import { PurchasedItem, PurchasedItemAttributes, PurchasedItemResponse } from "../../types/purchased_item"
import { Attribute, Collection, User } from "../../types/types"
import { CollectionItemCard } from "../collections/collectionItemCard"

export const ProfilePage: React.FC = () => {
	const { username, asset_hash } = useParams<{ username: string; asset_hash: string }>()
	const history = useHistory()
	const { state, send } = useWebsocket()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	// User
	const { user: loggedInUser, loading: authLoading } = useAuth()
	const [user, setUser] = useState<User>()
	const [loadingText, setLoadingText] = useState<string>()
	const [error, setError] = useState<string>()

	useEffect(() => {
		if (authLoading) {
			setLoadingText("Loading. Please wait...")
			return
		}
		let userTimeout: NodeJS.Timeout
		;(async () => {
			if (username) {
				try {
					if (state !== SocketState.OPEN) return
					const resp = await send<User>(HubKey.UserGet, {
						username,
					})
					setUser(resp)
				} catch (e) {
					setError(typeof e === "string" ? e : "Something went wrong while fetching the user. Please try again.")
				}
			} else {
				if (loggedInUser) {
					setUser(loggedInUser)
				} else {
					setLoadingText("You need to be logged in to view this page. Redirecting to login page...")
					userTimeout = setTimeout(() => {
						history.push("/login")
					}, 2000)
				}
			}
		})()

		return () => {
			if (!userTimeout) return
			clearTimeout(userTimeout)
		}
	}, [loggedInUser, state, history, send, username, authLoading])

	if (error) {
		return <Box>{error}</Box>
	}

	if (!user) {
		return <Loading text={loadingText} />
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100%",
			}}
		>
			<Navbar
				sx={{
					marginBottom: "2rem",
				}}
			/>
			<Box
				sx={{
					flex: 1,
					display: "flex",
					width: "100%",
					maxWidth: "1700px",
					margin: "0 auto",
					marginBottom: "3rem",
					padding: "0 3rem",
					"@media (max-width: 1000px)": {
						flexDirection: "column",
					},
				}}
			>
				{isWiderThan1000px && (
					<>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								maxWidth: "340px",
								padding: "2rem 0",
								"& > *:not(:last-child)": {
									marginBottom: "1rem",
								},
								"@media (max-width: 1000px)": {
									alignSelf: "center",
									maxWidth: "600px",
								},
							}}
						>
							<ProfileButton
								size="5rem"
								disabled
								sx={{
									marginBottom: "1.5rem !important",
								}}
							/>
							<Section>
								<Typography variant="h3" component="p">
									{user.username}
								</Typography>
								{(user.firstName || user.lastName) && (
									<Typography variant="subtitle2">
										{user.firstName} {user.lastName}
									</Typography>
								)}
							</Section>
							{user.public_address && (
								<Box
									sx={{
										alignSelf: "start",
										display: "flex",
										padding: ".5rem 1rem",
										borderRadius: "2rem",
										boxShadow: `0px 0px 12px ${colors.navyBlue}`,
										backgroundColor: colors.lightNavyBlue,
										"&:not(:last-child)": {
											marginBottom: "2rem",
										},
									}}
								>
									<Typography
										variant="subtitle2"
										color={colors.skyBlue}
										sx={{
											flexGrow: 1,
											marginRight: "1rem",
										}}
									>
										{middleTruncate(user.public_address)}
									</Typography>
									<IconButton
										onClick={() => navigator.clipboard.writeText(user.public_address!)}
										sx={{
											margin: "-.5rem",
										}}
										title="Copy wallet address"
									>
										<ContentCopyIcon fontSize="small" />
									</IconButton>
								</Box>
							)}
							{/* This will be used in the future when we allow non-wallet connections */}
							{/* {loggedInUser?.username === user.username && (
								<Section>
									<Typography variant="h6" component="p">
										Connect
									</Typography>
									<Box
										sx={{
											display: "grid",
											gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))",
											gap: "1rem",
										}}
									>
										{!user.publicAddress && (
											<RouterLink
												component={StyledIconButton}
												to={`/profile/${user.username}/edit#connections`}
												title="Connect with MetaMask"
											>
												<MetaMaskIcon />
											</RouterLink>
										)}
										{!user.twitterID && (
											<RouterLink
												component={StyledIconButton}
												to={`/profile/${user.username}/edit#connections`}
												title="Connect with Twitter"
											>
												<TwitterIcon />
											</RouterLink>
										)}
										{!user.discordID && (
											<RouterLink
												component={StyledIconButton}
												to={`/profile/${user.username}/edit#connections`}
												title="Connect with Discord"
											>
												<DiscordIcon />
											</RouterLink>
										)}
										{!user.facebookID && (
											<RouterLink
												component={StyledIconButton}
												to={`/profile/${user.username}/edit#connections`}
												title="Connect with Facebook"
											>
												<FacebookIcon />
											</RouterLink>
										)}
										{!user.googleID && (
											<RouterLink
												component={StyledIconButton}
												to={`/profile/${user.username}/edit#connections`}
												title="Connect with Google"
											>
												<GoogleIcon />
											</RouterLink>
										)}
										{!user.twitchID && (
											<RouterLink
												component={StyledIconButton}
												to={`/profile/${user.username}/edit#connections`}
												title="Connect with Twitch"
											>
												<TwitchIcon />
											</RouterLink>
										)}
									</Box>
								</Section>
							)} */}
							{loggedInUser?.username === user.username && (
								<Section>
									<Typography variant="h6" component="p">
										Manage
									</Typography>
									<RouterLink component={StyledFancyButton} to={`/profile/${user.username}/edit`}>
										Edit Profile
									</RouterLink>
								</Section>
							)}
						</Box>
						<Box minHeight="2rem" minWidth="2rem" />
					</>
				)}
				{!!asset_hash ? <AssetView user={user} assetHash={asset_hash} /> : <CollectionView user={user} />}
			</Box>
		</Box>
	)
}

const Section = styled(Box)({
	"& > *:not(:last-child)": {
		marginBottom: ".5rem",
	},
})

interface CollectionViewProps {
	user: User
}

const CollectionView = ({ user }: CollectionViewProps) => {
	const { loading, error } = useQuery<{ asset_hashes: string[]; total: number }>(HubKey.AssetList, false)
	const history = useHistory()

	// Collection data
	const [search, setSearch] = useState("")
	const [assetHashes, setAssetHashes] = useState<string[]>([])
	// Filter/Sort
	const [openFilterDrawer, setOpenFilterDrawer] = useState(false)
	const [assetType] = useState<string>()

	return (
		<>
			<SwipeableDrawer
				open={openFilterDrawer}
				onClose={() => setOpenFilterDrawer(false)}
				onOpen={() => setOpenFilterDrawer(true)}
				anchor="bottom"
				swipeAreaWidth={56}
				ModalProps={{ keepMounted: true }}
				PaperProps={{
					sx: {
						padding: "2rem",
						"& > *:not(:last-child)": {
							marginBottom: "1rem",
						},
					},
				}}
			>
				<Sort pillSizeSmall={true} showOffWorldFilter={false} assetType={assetType} search={search} setAssetHashes={setAssetHashes} />
			</SwipeableDrawer>
			<Paper
				sx={{
					flexGrow: 1,
					display: "flex",
					flexDirection: "column",
					padding: "2rem",
				}}
			>
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						alignItems: "center",
						marginBottom: ".5rem",
						"@media (max-width: 630px)": {
							flexDirection: "column",
							alignItems: "stretch",
						},
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
						}}
					>
						<Box
							component="img"
							src={GradientHeartIconImagePath}
							alt="Heart icon"
							sx={{
								marginRight: ".5rem",
								height: "4rem",
							}}
						/>
						<Typography
							sx={{
								fontFamily: fonts.bizmoextra_bold,
								fontSize: "1.5rem",
								whiteSpace: "nowrap",
							}}
						>
							Owned Assets
						</Typography>
					</Box>
					<Box flex={1} minHeight="1rem" />
					<SearchBar
						label="Search collection"
						placeholder="Search collection"
						value={search}
						size="small"
						onChange={(value: string) => {
							setSearch(value)
						}}
						sx={{
							flexGrow: 1,
							minWidth: "200px",
							maxWidth: "800px",
						}}
					/>
				</Box>
				<Box
					sx={{
						display: "flex",
						justifyContent: "end",
						marginBottom: "1rem",
					}}
				>
					<FancyButton
						onClick={() => setOpenFilterDrawer(true)}
						size="small"
						sx={{
							"@media (max-width: 630px)": {
								width: "100%",
							},
						}}
					>
						Filters / Sort
					</FancyButton>
				</Box>
				{assetHashes.length > 0 ? (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
							gap: "1rem",
						}}
					>
						{assetHashes.map((a) => {
							return <CollectionItemCard key={a} assetHash={a} username={user.username} />
						})}
					</Box>
				) : (
					<Box
						sx={{
							flex: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "column",
						}}
					>
						{loading ? (
							<Typography variant="subtitle2" color={colors.darkGrey}>
								Loading assets...
							</Typography>
						) : error ? (
							<Typography variant="subtitle2" color={colors.darkGrey}>
								An error occurred while loading assets.
							</Typography>
						) : (
							<Box
								component={"div"}
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									gap: "1em",
									overflow: "wrap",
								}}
							>
								<WarMachineImage src={WarMachine} alt="supremacy war machines" />
								<Typography variant="body1" sx={{ textTransform: "uppercase", fontSize: "1.3rem", textAlign: "center" }}>
									Your Inventory Is Empty
								</Typography>
								<StyledFancyButton sx={{ padding: "0.5em 2em" }} onClick={() => history.push("/stores")}>
									Go To Store
								</StyledFancyButton>
							</Box>
						)}
					</Box>
				)}
			</Paper>
		</>
	)
}

const WarMachineImage = styled("img")({
	width: "100%",
	height: "100%",
})

interface SortChipProps extends Omit<ChipProps, "color" | "onDelete"> {
	color?: string
	active: boolean
}
export const SortChip = ({ color = colors.white, active, ...props }: SortChipProps) => (
	<Chip
		sx={{
			color: active ? colors.darkerNavyBlue : color,
			borderColor: color,
			backgroundColor: active ? color : "transparent",
			"&&:hover": {
				color: colors.darkerNavyBlue,
				backgroundColor: color,
			},
			"&&:focus": {
				boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
			},
		}}
		variant="outlined"
		{...props}
	/>
)

interface FilterChipProps extends Omit<ChipProps, "color" | "onDelete"> {
	color?: string
	active: boolean
}
export const FilterChip = ({ color = colors.white, active, ...props }: FilterChipProps) => (
	<Chip
		sx={{
			color: active ? colors.darkerNavyBlue : color,
			borderColor: color,
			backgroundColor: active ? color : "transparent",
			"&&:hover": {
				color: colors.darkerNavyBlue,
				backgroundColor: color,
			},
			"&&:focus": {
				boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
			},
		}}
		variant="outlined"
		onDelete={active ? props.onClick : undefined}
		{...props}
	/>
)

interface AssetViewProps {
	user: User
	assetHash: string
}

enum AssetState {
	OnWorld,
	OnWorldLocked,
	OnWorldFrozen,
	OffWorldNotStaked,
	OffWorldStaked,
}

const AssetView = ({ user, assetHash }: AssetViewProps) => {
	const history = useHistory()
	const { state, subscribe, send } = useWebsocket()
	const [collection, setCollection] = useState<Collection | null>(null)
	const { user: loggedInUser } = useAuth()
	const { provider } = useWeb3()
	const { displayMessage } = useSnackbar()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")
	// Asset data
	const [purchasedItem, setPurchasedItem] = useState<PurchasedItem>()
	const [, setAssetAttributes] = useState<Attribute[]>([])
	const [numberAttributes, setNumberAttributes] = useState<Attribute[]>([])
	const [, setRegularAttributes] = useState<Attribute[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	// Asset actions
	const { queuedWarMachine, queuingContractReward } = useAsset()
	const queueDetail = queuedWarMachine(assetHash)
	const [submitting, setSubmitting] = useState(false)
	const [mintWindowOpen, setMintWindowOpen] = useState(false)
	const [renameWindowOpen, setRenameWindowOpen] = useState(false)
	const [assetState, setAssetState] = useState<AssetState>(AssetState.OnWorld)
	const [ownerUsername, setOwnerUsername] = useState<string | null>(null)

	const [stakeModelOpen, setStakeModelOpen] = useState<boolean>(false)
	const [unstakeModelOpen, setUnstakeModelOpen] = useState<boolean>(false)

	const isOwner = purchasedItem ? loggedInUser?.id === purchasedItem?.owner_id : false

	const isWarMachine = (): boolean => {
		if (!purchasedItem) return false
		return purchasedItem.data.mech.asset_type === "War Machine"
	}

	const leaveQueue = async () => {
		if (!assetHash) return
		setSubmitting(true)
		try {
			await send(HubKey.AssetLeaveQue, { assetHash: assetHash })
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}

	const payInsurance = async () => {
		if (!assetHash) return
		setSubmitting(true)
		try {
			await send(HubKey.AssetInsurancePay, { assetHash: assetHash })
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}

	const getOwner = useCallback(
		async (purchasedItem: PurchasedItem | undefined, provider: ethers.providers.Web3Provider | undefined, loggedInUser: User | undefined) => {
			if (!purchasedItem || !purchasedItem?.minted_at || !provider || !loggedInUser?.public_address) return
			if (!collection) return
			try {
				const abi = ["function ownerOf(uint256) view returns (address)"]
				const signer = provider.getSigner()
				const nftContract = new ethers.Contract(collection.mint_contract, abi, signer)
				const owner = await nftContract.ownerOf(purchasedItem.external_token_id)

				if (owner === collection.stake_contract && purchasedItem.owner_id === loggedInUser.id) {
					setAssetState(AssetState.OffWorldStaked)
				} else if (
					(owner !== loggedInUser.public_address && owner !== collection.stake_contract) ||
					(owner === loggedInUser.public_address && purchasedItem.owner_id === "2fa1a63e-a4fa-4618-921f-4b4d28132069")
				) {
					setAssetState(AssetState.OffWorldNotStaked)
				} else if (owner === loggedInUser.public_address && purchasedItem.owner_id === loggedInUser.id) {
					setAssetState(AssetState.OffWorldStaked)
				}
			} catch (e) {}
		},
		[],
	)

	// check the owner every second
	useEffect(() => {
		setInterval(() => getOwner(purchasedItem, provider, loggedInUser), 1000)
	}, [getOwner, purchasedItem, provider, loggedInUser])

	useEffect(() => {
		subscribe<Collection>(HubKey.CollectionUpdated, (payload) => {
			setCollection(collection)
		})
	})
	useEffect(() => {
		if (state !== SocketState.OPEN || assetHash === "") return

		setLoading(true)
		try {
			return subscribe<PurchasedItemResponse>(
				HubKey.AssetUpdated,
				(payload) => {
					if (!payload) return
					let assetAttributes = new Array<Attribute>()
					let numberAttributes = new Array<Attribute>()
					let regularAttributes = new Array<Attribute>()

					const attributes = PurchasedItemAttributes(payload.purchased_item)
					attributes.forEach((a) => {
						if (a.asset_hash) {
							// If is an asset attribute
							assetAttributes.push(a)
						} else if (a.display_type === "number") {
							// If is a number attribute
							numberAttributes.push(a)
						} else {
							// Is a regular attribute
							regularAttributes.push(a)
						}
					})
					setAssetAttributes(assetAttributes)
					setNumberAttributes(numberAttributes)
					setRegularAttributes(regularAttributes)
					setPurchasedItem(payload.purchased_item)
					setOwnerUsername(payload.owner_username)
					setLoading(false)
				},
				{ assetHash },
			)
		} catch (e) {
			setError(typeof e === "string" ? e : "Something went wrong while fetching asset data. Please try again.")
		}
	}, [state, assetHash, subscribe])

	if (error) {
		return (
			<Paper
				sx={{
					flexGrow: 1,
				}}
			>
				{error}
			</Paper>
		)
	}

	if (loading || !purchasedItem) {
		return (
			<Paper
				sx={{
					flexGrow: 1,
				}}
			>
				Loading...
			</Paper>
		)
	}

	if (!collection || !ownerUsername) {
		return (
			<Paper
				sx={{
					flexGrow: 1,
				}}
			>
				Loading...
			</Paper>
		)
	}

	return (
		<>
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
						{assetState === AssetState.OffWorldNotStaked && collection && collection.mint_contract !== "" && (
							<FancyButton size="small" onClick={() => setStakeModelOpen(true)}>
								Transition In Asset
							</FancyButton>
						)}

						{assetState === AssetState.OffWorldStaked && collection && collection.mint_contract !== "" && (
							<FancyButton size="small" onClick={() => setUnstakeModelOpen(true)}>
								Transition out Asset
							</FancyButton>
						)}

						{isOwner && isWarMachine() && !purchasedItem.minted_at && (
							<FancyButton size="small" borderColor={colors.darkGrey} onClick={() => setRenameWindowOpen(true)}>
								Rename Asset
							</FancyButton>
						)}
						{isOwner ? (
							!purchasedItem.minted_at && isWarMachine() ? (
								<>
									{!purchasedItem.minted_at && (
										<FancyButton size="small" onClick={() => setMintWindowOpen(true)}>
											Transition Off World
										</FancyButton>
									)}
								</>
							) : (
								<>
									{!queueDetail?.war_machine_metadata.is_insured && (
										<FancyButton size="small" loading={submitting} onClick={payInsurance}>
											Pay Insurance
										</FancyButton>
									)}
									<FancyButton size="small" loading={submitting} onClick={leaveQueue} borderColor={colors.errorRed}>
										Leave
									</FancyButton>
								</>
							)
						) : null}
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
									fontFamily: fonts.bizmoblack,
									fontStyle: "italic",
									letterSpacing: "2px",
									textTransform: "uppercase",
									...rarityTextStyles[purchasedItem.tier as Rarity],
								}}
							>
								{purchasedItem.tier}
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
							<Divider
								sx={{
									margin: ".5rem 0",
								}}
							/>
							{loggedInUser?.id === purchasedItem.owner_id && (
								<Box
									sx={{
										marginBottom: ".5rem",
									}}
								>
									{queueDetail ? (
										<>
											<Typography>
												<Box
													component="span"
													fontWeight={500}
													color={colors.darkGrey}
													sx={{
														marginRight: ".5rem",
													}}
												>
													Queue Position:
												</Box>
												{queueDetail.position !== -1 ? `${queueDetail.position + 1}` : "In Game"}
											</Typography>
											<Typography
												sx={{
													display: "flex",
													alignItems: "center",
													"& svg": {
														height: ".8rem",
													},
													"& > *:not(:last-child)": {
														marginRight: ".2rem",
													},
												}}
											>
												<Box component="span" fontWeight={500} color={colors.darkGrey}>
													Contract Reward:
												</Box>
												<SupTokenIcon />
												{supFormatter(queueDetail.war_machine_metadata.contract_reward)}
											</Typography>
											{queueDetail.war_machine_metadata.is_insured ? (
												<Typography>
													<Box
														component="span"
														fontWeight={500}
														color={colors.darkGrey}
														sx={{
															marginRight: ".5rem",
														}}
													>
														Insurance Status:
													</Box>
													Insured
												</Typography>
											) : (
												<Typography>
													<Box
														component="span"
														fontWeight={500}
														color={colors.darkGrey}
														sx={{
															marginRight: ".5rem",
														}}
													>
														Insurance Status:
													</Box>
													Not Insured
												</Typography>
											)}
										</>
									) : (
										<Typography
											sx={{
												display: "flex",
												alignItems: "center",
												"& svg": {
													height: ".8rem",
												},
												"& > *:not(:last-child)": {
													marginRight: ".2rem",
												},
											}}
										>
											<Box component="span" fontWeight={500} color={colors.darkGrey}>
												Contract Reward:
											</Box>
											<SupTokenIcon />
											{supFormatter(queuingContractReward)}
										</Typography>
									)}
								</Box>
							)}
							{isWiderThan1000px && (
								<Box
									sx={{
										display: "flex",
										flexWrap: "wrap",
										gap: ".5rem",
									}}
								>
									{assetState === AssetState.OffWorldNotStaked && collection && collection.mint_contract !== "" && (
										<FancyButton size="small" onClick={() => setStakeModelOpen(true)}>
											Transition In Asset
										</FancyButton>
									)}

									{assetState === AssetState.OffWorldStaked && collection && collection.mint_contract !== "" && (
										<FancyButton size="small" onClick={() => setUnstakeModelOpen(true)}>
											Transition out Asset
										</FancyButton>
									)}

									{/*TODO: fix this mess of if statements*/}
									{loggedInUser?.id === purchasedItem.owner_id && isWarMachine() && (
										<FancyButton size="small" borderColor={colors.darkGrey} onClick={() => setRenameWindowOpen(true)}>
											Rename Asset
										</FancyButton>
									)}
									{loggedInUser?.id === purchasedItem.owner_id ? (
										collection.mint_contract !== "" && !purchasedItem.minted_at ? (
											<FancyButton size="small" onClick={() => setMintWindowOpen(true)}>
												Continue Transition Off World
											</FancyButton>
										) : !purchasedItem.minted_at && isWarMachine() ? (
											<>
												{!purchasedItem.minted_at && (
													<FancyButton size="small" onClick={() => setMintWindowOpen(true)}>
														Transition Off World
													</FancyButton>
												)}
											</>
										) : (
											<>
												{!queueDetail?.war_machine_metadata.is_insured && (
													<FancyButton size="small" loading={submitting} onClick={payInsurance}>
														Pay Insurance
													</FancyButton>
												)}
												<FancyButton size="small" loading={submitting} onClick={leaveQueue} borderColor={colors.errorRed}>
													Leave
												</FancyButton>
											</>
										)
									) : null}
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
									{collection && ownerUsername === "OnChain" && (
										<Button
											component={"a"}
											href={
												collection.mint_contract === "0xEEfaF47acaa803176F1711c1cE783e790E4E750D"
													? `https://testnets.opensea.io/assets/goerli/${collection.mint_contract}/${purchasedItem.external_token_id}`
													: `https://opensea.io/assets/${collection.mint_contract}/${purchasedItem.external_token_id}`
											}
											target="_blank"
											rel="noopener noreferrer"
											endIcon={<OpenInNewIcon />}
										>
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
					<StakeModel
						collection={collection}
						open={stakeModelOpen}
						asset={purchasedItem}
						provider={provider}
						onClose={() => setStakeModelOpen(false)}
					/>
				)}
				{provider && purchasedItem && (
					<UnstakeModel
						collection={collection}
						open={unstakeModelOpen}
						asset={purchasedItem}
						provider={provider}
						onClose={() => setUnstakeModelOpen(false)}
					/>
				)}
			</Paper>
		</>
	)
}

export type Rarity = "Rare" | "Legendary" | "Mega" | "Colossal" | "Elite Legendary" | "Ultra Rare" | "Exotic" | "Guardian" | "Mythic" | "Deus ex" | "Titan"

export const rarityTextStyles: { [key in Rarity]: any } = {
	Mega: {
		color: colors.rarity.mega,
	},
	Colossal: {
		color: colors.rarity.colossal,
	},
	Rare: {
		color: colors.rarity.rare,
	},
	Legendary: {
		color: colors.rarity.legendary,
	},
	"Elite Legendary": {
		color: colors.rarity.eliteLegendary,
	},
	"Ultra Rare": {
		color: colors.rarity.ultraRare,
	},
	Exotic: {
		color: colors.rarity.exotic,
	},
	Guardian: {
		color: colors.rarity.guardian,
	},
	Mythic: {
		color: colors.rarity.mythic,
		textShadow: `0 0 2px ${colors.rarity.mythic}`,
	},
	"Deus ex": {
		color: colors.rarity.deusEx,
		textShadow: `0 0 2px ${colors.rarity.deusEx}`,
	},
	Titan: {
		color: colors.rarity.titan,
		textShadow: `0 0 2px ${colors.rarity.titan}`,
	},
}

const StyledFancyButton = styled(({ navigate, ...props }: FancyButtonProps & { navigate?: any }) => <FancyButton {...props} size="small" />)({})

const StyledDisabledButton = styled(({ navigate, ...props }: ButtonProps & { navigate?: any }) => <Button {...props} variant="text" disabled />)({
	justifyContent: "start",
	color: `${colors.darkerGrey} !important`,
})

interface PercentageDisplayProps {
	displayValue: string
	percentage?: number
	label: string
}

export const PercentageDisplay: React.VoidFunctionComponent<PercentageDisplayProps> = ({ displayValue, percentage, label }) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			}}
		>
			<Box
				sx={{
					position: "relative",
					width: "100%",
					maxWidth: "100px",
					minHeight: "100px",
					marginBottom: "1rem",
				}}
			>
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						borderRadius: "50%",
						backgroundColor: colors.darkerNavyBlue,
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						borderRadius: "50%",
						background: `conic-gradient(${percentage ? colors.neonPink : colors.skyBlue} calc(${percentage || 100}*1%),#0000 0)`,
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						transform: "scale(.8)",
						borderRadius: "50%",
						backgroundColor: percentage ? colors.darkNeonPink : colors.darkSkyBlue,
					}}
				/>
				<Typography
					variant="h5"
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
					}}
				>
					{displayValue}
				</Typography>
			</Box>
			<Typography variant="caption" textAlign="center">
				{label}
			</Typography>
		</Box>
	)
}

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
	provider: ethers.providers.Web3Provider
	asset: PurchasedItem
}

//
// if minted, get on chain wallet owner
// if user wallet == online wallet
//     have stake button
// tell them there are 2 phases
// approve (show est gas)
// stake (show est gas)
//	const mintAttempt = useCallback(async () => {
// 		try {
// 			if (currentChainId?.toString() !== ETHEREUM_CHAIN_ID) {
// 				setErrorMinting("Connected to wrong chain.")
// 				return
// 			}
// 			if (!provider) return
// 			setLoadingMint(true)
// 			// get nonce from mint contract
// 			// send nonce, amount and user wallet addr to server
// 			// server validates they have enough sups
// 			// server generates a sig and returns it
// 			// submit that sig to mint contract mintSups func
// 			// listen on backend for update
//
// 			// A Human-Readable ABI; for interacting with the contract,
// 			// we must include any fragment we wish to use
// 			const abi = ["function nonces(address) view returns (uint256)", "function signedMint(uint256 tokenID, bytes signature, uint256 expiry)"]
// 			const signer = provider.getSigner()
// 			const mintContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, signer)
// 			if (mintingSignature && mintingSignature !== "") {
// 				await mintContract.signedMint(tokenID, mintingSignature)
// 				setErrorMinting(undefined)
// 				return
// 			}
//
// 			const nonce = await mintContract.nonces(account)
// 			const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/mint-nft/${account}/${nonce}/${tokenID}`)
// 			const respJson: GetSignatureResponse = await resp.json()
// 			await mintContract.signedMint(tokenID, respJson.messageSignature, respJson.expiry)
// 			setErrorMinting(undefined)
// 			onClose()
// 		} catch (e) {
// 			setErrorMinting(e === "string" ? e : "Issue minting, please try again or contact support.")
// 		} finally {
// 			setLoadingMint(false)
// 		}
// 	}, [provider, account, tokenID, mintingSignature, currentChainId, onClose])

//	OnWorld, - done
// 	OnWorldLocked,
// 	OnWorldFrozen,
// 	OffWorldNotStaked, - done
// 	OffWorldStaked,

// //
// useEffect(()=>{
// 	if(!asset || !asset.minted || !provider || !loggedInUser?.publicAddress) return
// 		;(async ()=>{
// 		try {
// 			const abi = ["function ownerOf(uint256) view returns (address)"]
// 			const signer = provider.getSigner()
// 			const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, signer)
//
// 			const owner = await nftContract.ownerOf(asset.tokenID)
//
// 			if ((owner !== loggedInUser.publicAddress) ||
// 				(owner === loggedInUser.publicAddress && asset.userID === '2fa1a63e-a4fa-4618-921f-4b4d28132069')) {
// 				setAssetState(AssetState.OffWorldNotStaked)
// 			} else if (owner === loggedInUser.publicAddress && asset.userID === loggedInUser.id) {
// 				setAssetState(AssetState.OffWorldStaked)
// 			}
// 		} catch (e) {
// 		}
// 	})()
// },[asset, provider, loggedInUser])

const UnstakeModel = ({ open, onClose, provider, asset, collection }: StakeModelProps) => {
	const [error, setError] = useState<string>()
	const [unstakingLoading, setUnstakingLoading] = useState<boolean>(false)
	const [unstakingSuccess, setUnstakingSuccess] = useState<boolean>(false)

	// TODO: fix unstaking vinnie - 25/02/22
	const unstake = useCallback(async () => {
		try {
			setUnstakingLoading(true)
			const abi = ["function unstake(address,uint256)"]
			const signer = provider.getSigner()
			const nftstakeContract = new ethers.Contract(collection.stake_contract, abi, signer)
			const tx = await nftstakeContract.unstake(collection.mint_contract, asset.external_token_id)
			await tx.wait()
			setUnstakingSuccess(true)
		} catch (e: any) {
			//checking metamask error signature and setting error
			if (e.code && e.message) {
				setError(e.message)
				return
			}
			setError(typeof e === "string" ? e : "Something went wrong, please try again.")
			// setError(e)
		} finally {
			setUnstakingLoading(false)
		}
	}, [provider, asset])

	return (
		<Dialog onClose={() => onClose()} open={open}>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Transition Asset on World
			</DialogTitle>
			<DialogContent sx={{ display: "flex", width: "100%", flexDirection: "column", gap: "1rem", justifyContent: "center" }}>
				<>
					<Typography variant={"h5"} color={"error"}>
						GABS WARNING:
					</Typography>
					<Typography>
						Once transitioned off world you will be required to pay the fees to approve and transition back, transition with care.
					</Typography>
				</>

				<FancyButton disabled={unstakingSuccess || unstakingLoading} fullWidth onClick={unstake}>
					{unstakingLoading && <CircularProgress />}
					{!unstakingLoading && unstakingSuccess && "Successfully Transitioned"}
					{!unstakingLoading && !unstakingSuccess && "Transition"}
				</FancyButton>
			</DialogContent>
			<DialogActions>
				{!!error && <Alert severity="error">{error}</Alert>}
				<Button onClick={() => onClose()}>Cancel</Button>
			</DialogActions>
		</Dialog>
	)
}

const StakeModel = ({ open, onClose, provider, asset, collection }: StakeModelProps) => {
	const [error, setError] = useState<string>()
	const [approvalLoading, setApprovalLoading] = useState<boolean>(false)
	const [approvalSuccess, setApprovalSuccess] = useState<boolean>(false)

	const [stakingLoading, setStakingLoading] = useState<boolean>(false)
	const [stakingSuccess, setStakingSuccess] = useState<boolean>(false)

	// TODO: give our est gas price
	// useEffect(()=>{
	// 	;(async ()=>{
	// 	try {
	// 		// "function withdrawSUPS(uint256, bytes signature, uint256 expiry)"]
	// 		const abi = ["function ownerOf(uint256) view returns (address)", "function approve(address, uint256)"]
	// 		const signer = provider.getSigner()
	// 		const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, abi, signer)
	// 		const estimation = await nftContract.estimateGas.approve(NFT_STAKING_CONTRACT_ADDRESS, asset.tokenID);
	//
	// 		setApproveGasEst(estimation)
	//
	// 		// if ((owner !== loggedInUser.publicAddress) ||
	// 		// 	(owner === loggedInUser.publicAddress && asset.userID === '2fa1a63e-a4fa-4618-921f-4b4d28132069')) {
	// 		// 	setAssetState(AssetState.OffWorldNotStaked)
	// 		// } else if (owner === loggedInUser.publicAddress && asset.userID === loggedInUser.id) {
	// 		// 	setAssetState(AssetState.OffWorldStaked)
	// 		// }
	// 	} catch (e) {
	// 		console.log(e)
	// 	}
	// })()
	// },[provider, asset])

	const approve = useCallback(async () => {
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
		try {
			setStakingLoading(true)
			const abi = ["function stake(address,uint256)"]
			const signer = provider.getSigner()
			const nftstakeContract = new ethers.Contract(collection.stake_contract, abi, signer)
			const tx = await nftstakeContract.stake(collection.mint_contract, asset.external_token_id)
			await tx.wait()
			setStakingSuccess(true)
		} catch (e: any) {
			//checking metamask error signature and setting error
			if (e.code && e.message) {
				setError(e.message)
				return
			}
			setError(typeof e === "string" ? e : "Something went wrong, please try again.")
		} finally {
			setStakingLoading(false)
		}
	}, [provider, asset])

	return (
		<Dialog onClose={() => onClose()} open={open}>
			<DialogTitle
				sx={(theme) => ({
					fontSize: theme.typography.h3,
				})}
				color={"primary"}
			>
				Transition Asset on World
			</DialogTitle>
			<DialogContent sx={{ display: "flex", width: "100%", flexDirection: "column", gap: "1rem", justifyContent: "center" }}>
				<>
					<Typography variant={"h5"} color={"error"}>
						GABS WARNING:
					</Typography>
					<Typography>To transition your items back on world it is a 2 part process, with each part requiring fees.</Typography>
				</>
				<Box>
					<Typography>1. First you need to approve us to transition your item.</Typography>
					<FancyButton disabled={approvalSuccess || approvalLoading} fullWidth onClick={approve}>
						{approvalLoading && <CircularProgress />}
						{!approvalLoading && approvalSuccess && "Successfully Approved"}
						{!approvalLoading && !approvalSuccess && "Approve"}
					</FancyButton>
				</Box>
				<Box>
					<Typography>2. Transition your item on world.</Typography>
					<FancyButton disabled={stakingSuccess || stakingLoading} fullWidth onClick={stake}>
						{stakingLoading && <CircularProgress />}
						{!stakingLoading && stakingSuccess && "Successfully Transitioned"}
						{!stakingLoading && !stakingSuccess && "Transition"}
					</FancyButton>
				</Box>
			</DialogContent>
			<DialogActions>
				{!!error && <Alert severity="error">{error}</Alert>}
				<Button onClick={() => onClose()}>Cancel</Button>
			</DialogActions>
		</Dialog>
	)
}
