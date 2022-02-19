// import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import AppsIcon from "@mui/icons-material/Apps"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Box, IconButton, IconButtonProps, Link, Paper, styled, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { DiscordIcon, FacebookIcon, GoogleIcon, GradientHeartIconImagePath, MetaMaskIcon, TwitchIcon, TwitterIcon } from "../../assets"
import { FancyButton, FancyButtonProps } from "../../components/fancyButton"
import { Navbar, ProfileButton } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { SearchBar } from "../../components/searchBar"
import { useAuth } from "../../containers/auth"
import { SocketState, useWebsocket } from "../../containers/socket"
import { middleTruncate } from "../../helpers"
import { useQuery } from "../../hooks/useSend"
import HubKey from "../../keys"
import { colors, fonts } from "../../theme"
import { CollectionItemCard } from "../collections/collectionItemCard"

export const ProfilePage: React.FC = () => {
	const history = useHistory()
	const { user } = useAuth()
	const { state } = useWebsocket()

	// Collection assets
	const { loading, error, payload, query } = useQuery<{ tokenIDs: number[]; total: number }>(HubKey.AssetList, false)
	const [search, setSearch] = useState("")
	const [tokenIDs, setTokenIDs] = useState<number[]>([])

	useEffect(() => {
		if (state !== SocketState.OPEN || !user) return

		const filtersItems: any[] = [
			// filter by user id
			{
				columnField: "username",
				operatorValue: "=",
				value: user.username,
			},
		]

		query({
			search,
			filter: {
				linkOperator: "and",
				items: filtersItems,
			},
		})
	}, [user, query, state, search])

	useEffect(() => {
		if (!payload || loading || error) return
		setTokenIDs(payload.tokenIDs)
	}, [payload, loading, error])

	useEffect(() => {
		if (user) return

		const userTimeout = setTimeout(() => {
			history.push("/login")
		}, 2000)
		return () => clearTimeout(userTimeout)
	}, [user, history])

	if (!user) {
		return <Loading text="You need to be logged in to view this page. Redirecting to login page..." />
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
					<Section>
						<Typography variant="h6" component="p">
							Bio
						</Typography>
						<Typography variant="body1">Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.</Typography>
					</Section>
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
								<RouterLink component={StyledIconButton} to="/profile/edit#connections" title="Connect with MetaMask">
									<MetaMaskIcon />
								</RouterLink>
							)}
							{!user.twitterID && (
								<RouterLink component={StyledIconButton} to="/profile/edit#connections" title="Connect with Twitter">
									<TwitterIcon />
								</RouterLink>
							)}
							{!user.discordID && (
								<RouterLink component={StyledIconButton} to="/profile/edit#connections" title="Connect with Discord">
									<DiscordIcon />
								</RouterLink>
							)}
							{!user.facebookID && (
								<RouterLink component={StyledIconButton} to="/profile/edit#connections" title="Connect with Facebook">
									<FacebookIcon />
								</RouterLink>
							)}
							{!user.googleID && (
								<RouterLink component={StyledIconButton} to="/profile/edit#connections" title="Connect with Google">
									<GoogleIcon />
								</RouterLink>
							)}
							{!user.twitchID && (
								<RouterLink component={StyledIconButton} to="/profile/edit#connections" title="Connect with Twitch">
									<TwitchIcon />
								</RouterLink>
							)}
						</Box>
					</Section>
					<Section>
						<Typography variant="h6" component="p">
							Manage
						</Typography>
						<RouterLink component={StyledFancyButton} to="/profile/edit">
							Edit Profile
						</RouterLink>
					</Section>
				</Box>
				<Box minHeight="2rem" minWidth="2rem" />
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
							marginBottom: "1rem",
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
							marginBottom: "1rem",
						}}
					>
						<Link
							variant="h5"
							underline="hover"
							sx={{
								display: "flex",
								alignItems: "center",
								marginLeft: "auto",
								textTransform: "uppercase",
								whiteSpace: "nowrap",
							}}
							color={colors.white}
							component={RouterLink}
							to={`/collections/${user.username}`}
						>
							View Full Collection
							<AppsIcon
								sx={{
									marginLeft: ".5rem",
								}}
							/>
						</Link>
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
			</Box>
		</Box>
	)
}

const StyledIconButton = styled(({ navigate, ...props }: IconButtonProps & { navigate: any }) => <IconButton {...props} />)({
	borderRadius: ".5rem",
	"& svg": {
		height: "2rem",
	},
})

const StyledFancyButton = styled(({ navigate, ...props }: FancyButtonProps & { navigate: any }) => <FancyButton {...props} />)({})

const Section = styled(Box)({
	"& > *:not(:last-child)": {
		marginBottom: ".5rem",
	},
})
