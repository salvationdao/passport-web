import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import { Box, IconButton, Stack, Typography, useMediaQuery } from "@mui/material"
import { useEffect, useState } from "react"
import { Link as RouterLink, useHistory, useParams } from "react-router-dom"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { Loading } from "../../components/loading"
import { ProfileButton } from "../../components/profileButton"
import { useAuth } from "../../containers/auth"
import { middleTruncate } from "../../helpers"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import HubKey from "../../keys"
import { colors } from "../../theme"
import { User } from "../../types/types"
import { Assets721 } from "./Assets/721/Assets721"
import { LockButton, lockOptions, LockOptionsProps } from "./Locking/LockButton"
import { LockModal } from "./Locking/LockModal"
import { SingleAsset721View } from "./Assets/721/SingleAssetView/SingleAsset721View"

export const ProfilePage = () => {
	const { user } = useAuth()
	if (!user) return <Loading />
	return <ProfilePageInner loggedInUser={user} />
}

const ProfilePageInner = ({ loggedInUser }: { loggedInUser: User }) => {
	const { send } = usePassportCommandsUser("/commander")
	const { username, asset_hash } = useParams<{ username: string; asset_hash: string }>()
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
			} else if (loggedInUser) {
				setUser(loggedInUser)
			} else {
				setLoadingText("You need to be logged in to view this page. Redirecting to login page...")
				const userTimeout = setTimeout(() => {
					history.push("/login")
				}, 2000)

				return () => clearTimeout(userTimeout)
			}
		})()
	}, [loggedInUser, history, send, username])

	if (error) return <Box>{error}</Box>

	if (!user) return <Loading text={loadingText} />

	return (
		<Stack>
			<Navbar sx={{ mb: "2rem" }} />
			<Stack
				direction="row"
				sx={{
					flex: 1,
					width: "100%",
					maxWidth: "1700px",
					m: "0 auto",
					mb: "3rem",
					p: "0 3rem",
					"@media (max-width: 1000px)": {
						flexDirection: "column",
					},
				}}
			>
				{isWiderThan1000px && (
					<>
						{lockOption && <LockModal option={lockOption} setOpen={setLockOpen} open={lockOpen} />}

						<Stack
							spacing="1.8rem"
							sx={{
								maxWidth: "340px",
								p: "2rem 0",
								"@media (max-width: 1000px)": {
									alignSelf: "center",
									maxWidth: "600px",
								},
							}}
						>
							<Stack>
								<ProfileButton size="5rem" disabled sx={{ mb: "1rem" }} />

								<Typography variant="h3">{user.username}</Typography>
								{loggedInUser?.username === user.username && (user.first_name || user.last_name) && (
									<Typography variant="subtitle2">
										{user.first_name} {user.last_name}
									</Typography>
								)}

								{user.public_address && (
									<Stack
										direction="row"
										sx={{
											mt: ".8rem",
											alignSelf: "start",
											p: ".5rem 1rem",
											borderRadius: 2,
											boxShadow: `0px 0px 5px ${colors.navyBlue}`,
											backgroundColor: colors.lightNavyBlue,
										}}
									>
										<Typography
											variant="subtitle2"
											color={colors.skyBlue}
											sx={{
												flexGrow: 1,
												mr: "1rem",
											}}
										>
											{middleTruncate(user.public_address)}
										</Typography>
										<IconButton
											onClick={() => navigator.clipboard.writeText(user.public_address!)}
											sx={{
												m: "-.5rem",
											}}
											title="Copy wallet address"
										>
											<ContentCopyIcon fontSize="small" />
										</IconButton>
									</Stack>
								)}
							</Stack>

							{loggedInUser?.username === user.username && (
								<>
									<Stack spacing=".5rem">
										<Typography variant="h6">MANAGE</Typography>

										<FancyButton size="small" sx={{ width: "100%" }}>
											<RouterLink to={`/profile/${user.username}/edit`}>Edit Profile</RouterLink>
										</FancyButton>
									</Stack>

									<Stack spacing=".5rem">
										<Typography variant="h6">LOCK ACCOUNT</Typography>

										<Stack spacing={".5rem"}>
											{lockOptions.map((option) => (
												<LockButton key={option.type} option={option} setLockOption={setLockOption} setOpen={setLockOpen} />
											))}
										</Stack>
									</Stack>
								</>
							)}
						</Stack>

						<Box minHeight="2rem" minWidth="2rem" />
					</>
				)}

				{!!asset_hash ? (
					<SingleAsset721View assetHash={asset_hash} edit={loggedInUser?.id === user.id} />
				) : (
					<Assets721 user={user} loggedInUser={loggedInUser} />
				)}
			</Stack>
		</Stack>
	)
}
