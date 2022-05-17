import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import {
	Box,
	Chip,
	ChipProps,
	IconButton,
	Paper,
	styled,
	SwipeableDrawer,
	Typography,
	useMediaQuery,
	Pagination,
	Select,
	MenuItem,
} from "@mui/material"
import React, { useEffect, useState } from "react"
import { Link as RouterLink, useHistory, useParams } from "react-router-dom"
import { GradientHeartIconImagePath } from "../../assets"
import WarMachine from "../../assets/images/WarMachine.png"
import { FancyButton, FancyButtonProps } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { ProfileButton } from "../../components/profileButton"
import { SearchBar } from "../../components/searchBar"
import { Sort } from "../../components/sort"
import { PageSizeSelectionInput } from "../../components/pageSizeSelectionInput"
import { middleTruncate } from "../../helpers"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Rarity } from "../../types/enums"
import { User } from "../../types/types"
import { CollectionItemCard } from "../collections/collectionItemCard"
import { AssetViewContainer } from "./assetView"
import useCommands from "../../containers/ws/useCommands"
import { useAuth } from "../../containers/auth"

export const ProfilePage: React.FC = () => {
	const { user } = useAuth()
	if (!user) {
		return <Loading />
	}

	return <ProfilePageInner loggedInUser={user} />
}

const ProfilePageInner: React.FC<{ loggedInUser: User }> = ({ loggedInUser }) => {
	const { username, asset_hash } = useParams<{ username: string; asset_hash: string }>()
	const history = useHistory()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	const { send } = useCommands()

	// User
	const [user, setUser] = useState<User>()
	const [loadingText, setLoadingText] = useState<string>()
	const [error, setError] = useState<string>()

	useEffect(() => {
		let userTimeout: NodeJS.Timeout
		;(async () => {
			if (username) {
				try {
					const resp = await send<User>(HubKey.User, {
						username,
					})
					setUser(resp)
				} catch (e) {
					setError(typeof e === "string" ? e : "Something went wrong while fetching the user. Please try again or contact support.")
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
	}, [loggedInUser, history, send, username])

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
								{loggedInUser?.username === user.username && (user.first_name || user.last_name) && (
									<Typography variant="subtitle2">
										{user.first_name} {user.last_name}
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

							{loggedInUser?.username === user.username && (
								<Section>
									<Typography variant="h6" component="p">
										Manage
									</Typography>
									<StyledFancyButton>
										<RouterLink to={`/profile/${user.username}/edit`}>Edit Profile</RouterLink>
									</StyledFancyButton>
								</Section>
							)}
						</Box>
						<Box minHeight="2rem" minWidth="2rem" />
					</>
				)}
				{!!asset_hash ? (
					<AssetViewContainer user={user} assetHash={asset_hash} edit={loggedInUser?.id === user.id} />
				) : (
					<CollectionView user={user} />
				)}
			</Box>
		</Box>
	)
}

const StyledFancyButton = styled(({ navigate, ...props }: FancyButtonProps & { navigate?: any }) => <FancyButton {...props} size="small" />)({})

const Section = styled(Box)({
	"& > *:not(:last-child)": {
		marginBottom: ".5rem",
	},
})

interface CollectionViewProps {
	user: User
}

const CollectionView = ({ user }: CollectionViewProps) => {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>()
	const history = useHistory()

	// Collection data
	const [currentPage, setCurrentPage] = useState(1)
	const [pageSize, setPageSize] = useState(20)
	const [total, setTotal] = useState(0)
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
				<Sort
					pillSizeSmall={true}
					showOffWorldFilter={false}
					page={currentPage - 1}
					pageSize={pageSize}
					assetType={assetType}
					search={search}
					setAssetHashes={setAssetHashes}
					setTotal={setTotal}
					setLoading={setLoading}
					setError={setError}
				/>
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
								<StyledFancyButton sx={{ padding: "0.5rem 2rem" }} onClick={() => history.push("/stores")}>
									Go To Store
								</StyledFancyButton>
							</Box>
						)}
					</Box>
				)}
				<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
					<Select
						value={pageSize}
						onChange={(e) => {
							setPageSize(typeof e.target.value === "number" ? e.target.value : parseInt(e.target.value))
							setCurrentPage(1)
						}}
						input={<PageSizeSelectionInput />}
					>
						<MenuItem value={5}>Showing 5 results per page</MenuItem>
						<MenuItem value={10}>Showing 10 results per page</MenuItem>
						<MenuItem value={20}>Showing 20 results per page</MenuItem>
						<MenuItem value={50}>Showing 50 results per page</MenuItem>
						<MenuItem value={100}>Showing 100 results per page</MenuItem>
					</Select>
					<Pagination
						page={currentPage}
						count={Math.ceil(total / pageSize)}
						color="primary"
						onChange={(_, newPageNumber) => setCurrentPage(newPageNumber)}
					/>
				</Box>
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

export const rarityTextStyles: { [key in Rarity]: any } = {
	MEGA: {
		color: colors.rarity.MEGA,
	},
	COLOSSAL: {
		color: colors.rarity.COLOSSAL,
	},
	RARE: {
		color: colors.rarity.RARE,
	},
	LEGENDARY: {
		color: colors.rarity.LEGENDARY,
	},
	ELITE_LEGENDARY: {
		color: colors.rarity.ELITE_LEGENDARY,
	},
	ULTRA_RARE: {
		color: colors.rarity.ULTRA_RARE,
	},
	EXOTIC: {
		color: colors.rarity.EXOTIC,
	},
	GUARDIAN: {
		color: colors.rarity.GUARDIAN,
	},
	MYTHIC: {
		color: colors.rarity.MYTHIC,
		textShadow: `0 0 2px ${colors.rarity.MYTHIC}`,
	},
	DEUS_EX: {
		color: colors.rarity.DEUS_EX,
		textShadow: `0 0 2px ${colors.rarity.DEUS_EX}`,
	},
	TITAN: {
		color: colors.rarity.TITAN,
		textShadow: `0 0 2px ${colors.rarity.TITAN}`,
	},
}
