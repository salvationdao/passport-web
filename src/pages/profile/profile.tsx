import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import {
	Box,
	Button,
	ButtonProps,
	Chip,
	ChipProps,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	IconButtonProps,
	Link,
	Paper,
	styled,
	SwipeableDrawer,
	Typography,
	useMediaQuery,
} from "@mui/material"
import React, { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link as RouterLink, useHistory, useParams } from "react-router-dom"
import { GradientHeartIconImagePath, SupTokenIcon } from "../../assets"
import { FancyButton, FancyButtonProps } from "../../components/fancyButton"
import { InputField } from "../../components/form/inputField"
import { Navbar, ProfileButton } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { MintModal } from "../../components/mintModal"
import { SearchBar } from "../../components/searchBar"
import { NFT_CONTRACT_ADDRESS } from "../../config"
import { useAsset } from "../../containers/assets"
import { useAuth } from "../../containers/auth"
import { useSnackbar } from "../../containers/snackbar"
import { SocketState, useWebsocket } from "../../containers/socket"
import { middleTruncate } from "../../helpers"
import { getItemAttributeValue, supFormatter } from "../../helpers/items"
import { useQuery } from "../../hooks/useSend"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { NilUUID } from "../../types/auth"
import { Asset, Attribute, User } from "../../types/types"
import { CollectionItemCard } from "../collections/collectionItemCard"

export const ProfilePage: React.FC = () => {
	const { username, token_id } = useParams<{ username: string; token_id: string }>()
	const history = useHistory()
	const { state, send } = useWebsocket()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	// User
	const { user: loggedInUser } = useAuth()
	const [user, setUser] = useState<User>()
	const [loadingText, setLoadingText] = useState<string>()
	const [error, setError] = useState<string>()

	useEffect(() => {
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
	}, [loggedInUser, state, history, send, username])

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
				minHeight: "100vh",
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
								width: "100%",
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
							{user.publicAddress && (
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
										{middleTruncate(user.publicAddress)}
									</Typography>
									<IconButton
										onClick={() => navigator.clipboard.writeText(user.publicAddress!)}
										sx={{
											margin: "-.5rem",
										}}
										title="Copy wallet address"
									>
										<ContentCopyIcon fontSize="small" />
									</IconButton>
								</Box>
							)}
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
				{!!token_id ? <AssetView user={user} tokenID={parseInt(token_id)} /> : <CollectionView user={user} />}
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
	const { state } = useWebsocket()
	const { loading, error, payload, query } = useQuery<{ tokenIDs: number[]; total: number }>(HubKey.AssetList, false)

	// Collection data
	const [search, setSearch] = useState("")
	const [tokenIDs, setTokenIDs] = useState<number[]>([])

	// Filter/Sort
	const [openFilterDrawer, setOpenFilterDrawer] = useState(false)
	const [sort, setSort] = useState<{ sortBy: string; sortDir: string }>()
	const [assetType] = useState<string>()
	const [rarities, setRarities] = useState<Set<string>>(new Set())

	const toggleRarity = (rarity: string) => {
		setRarities((prev) => {
			const exists = prev.has(rarity)
			const temp = new Set(prev)
			if (exists) {
				temp.delete(rarity)
				return temp
			}
			temp.clear()
			return temp.add(rarity)
		})
	}

	useEffect(() => {
		if (state !== SocketState.OPEN) return

		const filterItems: any[] = [
			// filter by user id
			{
				columnField: "username",
				operatorValue: "=",
				value: user.username,
			},
		]

		const attributeFilterItems: any[] = []
		if (assetType && assetType !== "All") {
			attributeFilterItems.push({
				trait: "Asset Type",
				value: assetType,
				operatorValue: "contains",
			})
		}
		rarities.forEach((v) =>
			attributeFilterItems.push({
				trait: "Rarity",
				value: v,
				operatorValue: "contains",
			}),
		)

		query({
			search,
			filter: {
				linkOperator: "and",
				items: filterItems,
			},
			attributeFilter: {
				linkOperator: "and",
				items: attributeFilterItems,
			},
			...sort,
		})
	}, [user, query, state, search, assetType, rarities, sort])

	useEffect(() => {
		if (!payload || loading || error) return
		setTokenIDs(payload.tokenIDs)
	}, [payload, loading, error])

	const renderFilters = () => (
		<>
			<Box>
				<Typography
					variant="subtitle1"
					sx={{
						display: "flex",
						alignItems: "center",
						marginBottom: ".5rem",
					}}
				>
					Sort By
				</Typography>
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						gap: ".5rem",
					}}
				>
					{(() => {
						const newSort = {
							sortBy: "created_at",
							sortDir: "asc",
						}
						return (
							<SortChip
								active={sort?.sortBy === newSort.sortBy && sort.sortDir === newSort.sortDir}
								label="Oldest first"
								variant="outlined"
								onClick={() => {
									setSort(newSort)
								}}
							/>
						)
					})()}
					{(() => {
						const newSort = {
							sortBy: "created_at",
							sortDir: "desc",
						}
						return (
							<SortChip
								active={sort?.sortBy === newSort.sortBy && sort.sortDir === newSort.sortDir}
								label="Newest first"
								variant="outlined"
								onClick={() => {
									setSort(newSort)
								}}
							/>
						)
					})()}
					{(() => {
						const newSort = {
							sortBy: "name",
							sortDir: "asc",
						}
						return (
							<SortChip
								active={sort?.sortBy === newSort.sortBy && sort.sortDir === newSort.sortDir}
								label="Name: Alphabetical"
								variant="outlined"
								onClick={() => {
									setSort(newSort)
								}}
							/>
						)
					})()}
					{(() => {
						const newSort = {
							sortBy: "name",
							sortDir: "desc",
						}
						return (
							<SortChip
								active={sort?.sortBy === newSort.sortBy && sort.sortDir === newSort.sortDir}
								label="Name: Alphabetical (reverse)"
								variant="outlined"
								onClick={() => {
									setSort(newSort)
								}}
							/>
						)
					})()}
				</Box>
			</Box>
			<Box>
				<Typography
					variant="subtitle1"
					sx={{
						marginBottom: ".5rem",
					}}
				>
					Rarity
				</Typography>
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						gap: ".5rem",
					}}
				>
					<FilterChip
						active={rarities.has("Common")}
						label="Common"
						color={colors.rarity.common}
						variant="outlined"
						onClick={() => toggleRarity("Common")}
					/>
					<FilterChip active={rarities.has("Rare")} label="Rare" color={colors.rarity.rare} variant="outlined" onClick={() => toggleRarity("Rare")} />
					<FilterChip
						active={rarities.has("Legendary")}
						label="Legendary"
						color={colors.rarity.legendary}
						variant="outlined"
						onClick={() => toggleRarity("Legendary")}
					/>
					<FilterChip active={rarities.has("Mega")} label="Mega" color={colors.rarity.mega} variant="outlined" onClick={() => toggleRarity("Mega")} />
					<FilterChip
						active={rarities.has("Colossal")}
						label="Colossal"
						color={colors.rarity.colossal}
						variant="outlined"
						onClick={() => toggleRarity("Colossal")}
					/>
					<FilterChip
						active={rarities.has("Elite Legendary")}
						label="Elite Legendary"
						color={colors.rarity.eliteLegendary}
						variant="outlined"
						onClick={() => toggleRarity("Elite Legendary")}
					/>
					<FilterChip
						active={rarities.has("Ultra Rare")}
						label="Ultra Rare"
						color={colors.rarity.ultraRare}
						variant="outlined"
						onClick={() => toggleRarity("Ultra Rare")}
					/>
					<FilterChip
						active={rarities.has("Exotic")}
						label="Exotic"
						color={colors.rarity.exotic}
						variant="outlined"
						onClick={() => toggleRarity("Exotic")}
					/>
					<FilterChip
						active={rarities.has("Guardian")}
						label="Guardian"
						color={colors.rarity.guardian}
						variant="outlined"
						onClick={() => toggleRarity("Guardian")}
					/>
					<FilterChip
						active={rarities.has("Mythic")}
						label="Mythic"
						color={colors.rarity.mythic}
						variant="outlined"
						onClick={() => toggleRarity("Mythic")}
					/>
					<FilterChip
						active={rarities.has("Deus ex")}
						label="Deus ex"
						color={colors.rarity.deusEx}
						variant="outlined"
						onClick={() => toggleRarity("Deus ex")}
					/>
				</Box>
			</Box>
		</>
	)

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
				{renderFilters()}
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
								"@media (max-width: 630px)": {
									height: "4rem",
								},
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
				{tokenIDs.length ? (
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
							gap: "1rem",
						}}
					>
						{tokenIDs.map((a) => {
							return <CollectionItemCard key={a} tokenID={a} username={user.username} />
						})}
					</Box>
				) : (
					<Box
						sx={{
							flex: 1,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Typography variant="subtitle2" color={colors.darkGrey}>
							{loading ? "Loading assets..." : error ? "An error occurred while loading assets." : "No results found."}
						</Typography>
					</Box>
				)}
			</Paper>
		</>
	)
}

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
		onDelete={active ? props.onClick : undefined}
		{...props}
	/>
)

interface AssetViewProps {
	user: User
	tokenID: number
}

const AssetView = ({ user, tokenID }: AssetViewProps) => {
	const history = useHistory()
	const { state, subscribe, send } = useWebsocket()
	const { user: loggedInUser } = useAuth()
	const { displayMessage } = useSnackbar()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	// Asset data
	const [asset, setAsset] = useState<Asset>()
	const [, setAssetAttributes] = useState<Attribute[]>([])
	const [numberAttributes, setNumberAttributes] = useState<Attribute[]>([])
	const [, setRegularAttributes] = useState<Attribute[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	// Asset actions
	const { queuedWarMachine, queuingContractReward } = useAsset()
	const queueDetail = queuedWarMachine(tokenID)
	const [submitting, setSubmitting] = useState(false)
	const [mintWindowOpen, setMintWindowOpen] = useState(false)
	const [renameWindowOpen, setRenameWindowOpen] = useState(false)

	const isOwner = asset ? loggedInUser?.id === asset?.userID : false

	const isWarMachine = (): boolean => {
		if (!asset) return false
		// loops through asset's attributes checks if it has a trait_type of "Asset Type", and value of "War Machine"
		const wm = asset.attributes.filter((a) => a.trait_type === "Asset Type" && a.value === "War Machine")
		return wm.length > 0
	}

	const onDeploy = async () => {
		if (!tokenID) return
		setSubmitting(true)
		try {
			await send(HubKey.AssetJoinQueue, { assetTokenID: tokenID })
			displayMessage(`Successfully deployed ${asset?.name}`, "success")
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}

	const leaveQueue = async () => {
		if (!tokenID) return
		setSubmitting(true)
		try {
			await send(HubKey.AssetLeaveQue, { assetTokenID: tokenID })
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}

	const payInsurance = async () => {
		if (!tokenID) return
		setSubmitting(true)
		try {
			await send(HubKey.AssetInsurancePay, { assetTokenID: tokenID })
		} catch (e) {
			displayMessage(typeof e === "string" ? e : "Something went wrong, please try again.", "error")
		} finally {
			setSubmitting(false)
		}
	}

	useEffect(() => {
		if (state !== SocketState.OPEN) return

		setLoading(true)
		try {
			return subscribe<Asset>(
				HubKey.AssetUpdated,
				(payload) => {
					if (!payload) return
					let assetAttributes = new Array<Attribute>()
					let numberAttributes = new Array<Attribute>()
					let regularAttributes = new Array<Attribute>()
					payload.attributes.forEach((a) => {
						if (a.token_id) {
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
					setAsset(payload)
					setLoading(false)
				},
				{ tokenID },
			)
		} catch (e) {
			setError(typeof e === "string" ? e : "Something went wrong while fetching asset data. Please try again.")
		}
	}, [state, tokenID, subscribe])

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

	if (loading || !asset) {
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
			<MintModal
				open={mintWindowOpen}
				onClose={() => setMintWindowOpen(false)}
				tokenID={asset.tokenID.toString()}
				mintingSignature={asset.mintingSignature}
			/>
			<UpdateNameModal open={renameWindowOpen} onClose={() => setRenameWindowOpen(false)} asset={asset} userID={user.id} />
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
						{isOwner && isWarMachine() && !asset.frozenAt && (
							<FancyButton size="small" borderColor={colors.darkGrey} onClick={() => setRenameWindowOpen(true)}>
								Rename Asset
							</FancyButton>
						)}
						{isOwner ? (
							(asset.mintingSignature || asset.mintingSignature !== "") && !asset.minted ? (
								<FancyButton size="small" onClick={() => setMintWindowOpen(true)}>
									Continue Transition Off World
								</FancyButton>
							) : !asset.frozenAt && isWarMachine() ? (
								<>
									<FancyButton size="small" onClick={() => onDeploy()}>
										Deploy
									</FancyButton>
									{!asset.minted && (
										<FancyButton size="small" onClick={() => setMintWindowOpen(true)}>
											Transition Off World
										</FancyButton>
									)}
								</>
							) : (
								<>
									{!queueDetail?.warMachineMetadata.isInsured && (!asset.lockedByID || asset.lockedByID === NilUUID) && (
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
							component="img"
							src={asset.image}
							alt="Asset Image"
							sx={{
								width: "100%",
								maxWidth: "350px",
							}}
						/>
						<Box
							sx={{
								flex: 1,
								flexBasis: "400px",
							}}
						>
							<Typography
								variant="h2"
								component="h1"
								sx={{
									marginBottom: ".3rem",
									textTransform: "uppercase",
								}}
							>
								{asset.name}
								{asset.frozenAt && (
									<Box
										component="span"
										sx={{
											marginLeft: ".5rem",
											color: colors.skyBlue,
											fontSize: "1rem",
										}}
									>
										(Frozen)
									</Box>
								)}
							</Typography>
							<Typography
								variant="h4"
								component="p"
								sx={{
									fontFamily: fonts.bizmoblack,
									fontStyle: "italic",
									letterSpacing: "2px",
									textTransform: "uppercase",
									...rarityTextStyles[getItemAttributeValue(asset.attributes, "Rarity") as Rarity],
								}}
							>
								{getItemAttributeValue(asset.attributes, "Rarity")}
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
									{asset.username}
								</Typography>
							</Box>
							<Divider
								sx={{
									margin: ".5rem 0",
								}}
							/>
							{loggedInUser?.id === asset.userID && (
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
												{supFormatter(queueDetail.warMachineMetadata.contractReward)}
											</Typography>
											{queueDetail.warMachineMetadata.isInsured ? (
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
									{loggedInUser?.id === asset.userID && isWarMachine() && !asset.frozenAt && (
										<FancyButton size="small" borderColor={colors.darkGrey} onClick={() => setRenameWindowOpen(true)}>
											Rename Asset
										</FancyButton>
									)}
									{loggedInUser?.id === asset.userID ? (
										(asset.mintingSignature || asset.mintingSignature !== "") && !asset.minted ? (
											<FancyButton size="small" onClick={() => setMintWindowOpen(true)}>
												Continue Transition Off World
											</FancyButton>
										) : !asset.frozenAt && isWarMachine() ? (
											<>
												<FancyButton size="small" onClick={() => onDeploy()}>
													Deploy
												</FancyButton>
												{!asset.minted && (
													<FancyButton size="small" onClick={() => setMintWindowOpen(true)}>
														Transition Off World
													</FancyButton>
												)}
											</>
										) : (
											<>
												{!queueDetail?.warMachineMetadata.isInsured && (!asset.lockedByID || asset.lockedByID === NilUUID) && (
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
									Description
								</Typography>
								<Divider
									sx={{
										margin: ".5rem 0",
									}}
								/>
								{asset.description ? (
									<Typography variant="body1">{asset.description}</Typography>
								) : (
									<Typography variant="body1" color={colors.darkGrey} fontStyle="italic">
										No description available
									</Typography>
								)}
							</Box>
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
								<Typography variant="body1">Part of the {asset.collection.name} collection.</Typography>
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
									{asset.username === "OnChain" && (
										<Button
											component={"a"}
											href={
												NFT_CONTRACT_ADDRESS === "0xC1ce98F52E771Bd82938c4Cb6CCaA40Dc2B3258D"
													? `https://testnets.opensea.io/assets/goerli/${NFT_CONTRACT_ADDRESS}/${asset.tokenID}`
													: `https://opensea.io/assets/${NFT_CONTRACT_ADDRESS}/${asset.tokenID}`
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
			</Paper>
		</>
	)
}

export type Rarity = "Common" | "Rare" | "Legendary" | "Mega" | "Colossal" | "Elite Legendary" | "Ultra Rare" | "Exotic" | "Guardian" | "Mythic" | "Deus ex"

export const rarityTextStyles: { [key in Rarity]: any } = {
	Common: {
		color: colors.rarity.common,
	},
	Rare: {
		color: colors.rarity.rare,
	},
	Legendary: {
		color: colors.rarity.legendary,
	},
	Mega: {
		color: colors.rarity.mega,
	},
	Colossal: {
		color: colors.rarity.colossal,
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
}

const StyledIconButton = styled(({ navigate, ...props }: IconButtonProps & { navigate?: any }) => <IconButton {...props} />)({
	borderRadius: ".5rem",
	"& svg": {
		height: "2rem",
	},
})

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

const UpdateNameModal = (props: { open: boolean; onClose: () => void; asset: Asset; userID: string }) => {
	const { open, onClose, asset, userID } = props
	const { send } = useWebsocket()
	const { displayMessage } = useSnackbar()
	const { control, handleSubmit, setValue } = useForm<{ name: string }>()
	const [loading, setLoading] = useState(false)

	const getName = useCallback(() => {
		let result = ""
		const attr = asset.attributes.filter((a) => a.trait_type === "Name")
		if (attr.length > 0) {
			result = `${attr[0].value}`
		}
		return result
	}, [asset])

	const onSubmit = handleSubmit(async ({ name }) => {
		setLoading(true)
		try {
			await send<Asset>(HubKey.AssetUpdateName, {
				tokenID: asset.tokenID,
				userID,
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
		setValue("name", getName())
	}, [getName, setValue])

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
