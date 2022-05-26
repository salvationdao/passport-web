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
	Stack,
	useMediaQuery,
	Pagination,
	Select,
	MenuItem,
	Tab,
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
import { Sort } from "./sort"
import { PageSizeSelectionInput } from "../../components/pageSizeSelectionInput"
import { middleTruncate } from "../../helpers"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { Rarity } from "../../types/enums"
import { User } from "../../types/types"
import { AssetItemCard } from "./assetItemCard"
import { AssetViewContainer } from "./assetView"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import { LockButton, LockModal, lockOptions, LockOptionsProps } from "./lockButtons"
import { useAuth } from "../../containers/auth"
import { User1155Asset, UserAsset } from "../../types/purchased_item"
import { usePagination } from "../../hooks/usePagination"
import { useDebounce } from "../../hooks/useDebounce"
import { TabContext, TabList, TabPanel } from "@mui/lab"

export const ProfilePage: React.FC = () => {
	const { user } = useAuth()
	if (!user) return <Loading />
	return <ProfilePageInner loggedInUser={user} />
}

const ProfilePageInner = ({ loggedInUser }: { loggedInUser: User }) => {
	const { username, asset_hash } = useParams<{ username: string; asset_hash: string }>()
	const { send } = usePassportCommandsUser("/commander")
	const history = useHistory()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	// User
	const [user, setUser] = useState<User>()
	const [loadingText, setLoadingText] = useState<string>()
	const [error, setError] = useState<string>()
	const [lockOption, setLockOption] = useState<LockOptionsProps>()
	const [lockOpen, setLockOpen] = useState<boolean>(false)

	useEffect(() => {
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
					const userTimeout = setTimeout(() => {
						history.push("/login")
					}, 2000)

					return () => clearTimeout(userTimeout)
				}
			}
		})()
	}, [loggedInUser, history, send, username])

	if (error) return <Box>{error}</Box>

	if (!user) return <Loading text={loadingText} />

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
						{lockOption && <LockModal option={lockOption} setOpen={setLockOpen} open={lockOpen} />}
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
								<Typography variant="h3">{user.username}</Typography>
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
								<>
									<Section>
										<Typography variant="h6">Manage</Typography>
										<StyledFancyButton sx={{ width: "100%" }}>
											<RouterLink to={`/profile/${user.username}/edit`}>Edit Profile</RouterLink>
										</StyledFancyButton>
									</Section>
									<Section>
										<Typography variant="h6">Lock Account</Typography>
										<Stack spacing={".5rem"}>
											{lockOptions.map((option) => (
												<LockButton key={option.type} option={option} setLockOption={setLockOption} setOpen={setLockOpen} />
											))}
										</Stack>
									</Section>
								</>
							)}
						</Box>
						<Box minHeight="2rem" minWidth="2rem" />
					</>
				)}

				{!!asset_hash ? (
					<>
						<AssetViewContainer user={user} assetHash={asset_hash} edit={loggedInUser?.id === user.id} />
					</>
				) : (
					<>
						<CollectionView user={user} />
					</>
				)}
			</Box>
		</Box>
	)
}

export const StyledFancyButton = styled(({ navigate, ...props }: FancyButtonProps & { navigate?: any }) => <FancyButton {...props} size="small" />)(
	{},
)

const Section = styled(Box)({
	"& > *:not(:last-child)": {
		marginBottom: ".5rem",
	},
})

const CollectionView = ({ user }: { user: User }) => {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>()
	const history = useHistory()

	// Collection data
	const [search, setSearch] = useDebounce("", 300)
	const { page, changePage, totalItems, setTotalItems, totalPages, pageSize, setPageSize } = usePagination({ pageSize: 20, page: 1 })
	const [userAssets, setUserAssets] = useState<UserAsset[]>([])
	const [user1155Assets, set1155UserAssets] = useState<User1155Asset[]>([])
	const [value, setValue] = useState<number>(1)
	// Filter/Sort
	const [openFilterDrawer, setOpenFilterDrawer] = useState(false)

	return (
		<>
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
					<SearchBar
						label="Search"
						placeholder="Keywords..."
						value={search}
						size="small"
						onChange={(value: string) => setSearch(value)}
						sx={{
							ml: "auto",
							width: "500px",
							minWidth: "200px",
							maxWidth: "800px",
						}}
					/>
				</Box>

				<TabContext value={value.toString()}>
					<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
						<TabList
							onChange={(event, newValue) => {
								setValue(newValue)
							}}
							aria-label="lab API tabs example"
						>
							<Tab label="Asset 721" value="1" />
							<Tab label="Asset 1155" value="2" />
						</TabList>
					</Box>
					<TabPanel value="1">
						<Stack direction="row" alignItems="center" sx={{ mb: "1rem" }}>
							<FancyButton
								onClick={() => setOpenFilterDrawer(true)}
								size="small"
								sx={{
									ml: "auto",
									"@media (max-width: 630px)": {
										width: "100%",
									},
								}}
							>
								Filters / Sort
							</FancyButton>
						</Stack>
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
								page={page}
								pageSize={pageSize}
								search={search}
								setUserAssets={setUserAssets}
								setTotal={setTotalItems}
								setLoading={setLoading}
								setError={setError}
							/>
						</SwipeableDrawer>
						{userAssets && userAssets.length > 0 && (
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
									gap: "1rem",
								}}
							>
								{userAssets.map((a) => {
									return <AssetItemCard key={a.id} userAsset={a} username={user.username} />
								})}
							</Box>
						)}

						{(!userAssets || userAssets.length < 0) && (
							<Box
								sx={{
									flex: 1,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexDirection: "column",
								}}
							>
								{loading && (
									<Typography variant="subtitle2" color={colors.darkGrey}>
										Loading assets...
									</Typography>
								)}
								{error && (
									<Typography variant="subtitle2" color={colors.darkGrey}>
										An error occurred while loading assets.
									</Typography>
								)}
								{!loading && !error && (
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
										<StyledFancyButton sx={{ padding: "0.5rem 2rem" }} onClick={() => history.push("/store")}>
											Go To Store
										</StyledFancyButton>
									</Box>
								)}
							</Box>
						)}
						<Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: "auto", pt: "1.5rem" }}>
							<Stack>
								<Typography sx={{ ml: ".2rem" }}>
									Showing {userAssets ? userAssets.length : 0} of {totalItems}
								</Typography>
								<Select
									value={pageSize}
									onChange={(e) => {
										setPageSize(typeof e.target.value === "number" ? e.target.value : parseInt(e.target.value))
										changePage(1)
									}}
									input={<PageSizeSelectionInput />}
								>
									<MenuItem value={5}>Display 5 results per page</MenuItem>
									<MenuItem value={10}>Display 10 results per page</MenuItem>
									<MenuItem value={20}>Display 20 results per page</MenuItem>
									<MenuItem value={50}>Display 50 results per page</MenuItem>
									<MenuItem value={100}>Display 100 results per page</MenuItem>
								</Select>
							</Stack>

							<Pagination
								page={page}
								count={totalPages}
								color="primary"
								showFirstButton
								showLastButton
								onChange={(_, newPageNumber) => changePage(newPageNumber)}
							/>
						</Stack>
					</TabPanel>
					<TabPanel value="2">Item Two</TabPanel>
				</TabContext>
			</Paper>
		</>
	)
}

const WarMachineImage = styled("img")({
	width: "100%",
	height: "100%",
	opacity: 0.5,
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
