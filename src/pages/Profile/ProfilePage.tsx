import {Alert, Box, CircularProgress, Paper, Stack, Tab, Tabs, Typography} from "@mui/material"
import {useCallback, useEffect, useState} from "react"
import {Link, Redirect, Route, Switch, useHistory, useLocation, useParams} from "react-router-dom"
import {FancyButton} from "../../components/fancyButton"
import {Navbar} from "../../components/home/navbar"
import {Loading} from "../../components/loading"
import {ProfileButton} from "../../components/profileButton"
import {useAuth} from "../../containers/auth"
import {usePassportCommandsUser} from "../../hooks/usePassport"
import HubKey from "../../keys"
import {User} from "../../types/types"
import {Assets721} from "./Assets/721/Assets721"
import {colors} from "../../theme"
import {Assets1155} from "./Assets/1155/Assets1155"
import {SingleAsset1155View} from "./Assets/1155/SingleAssetView/SingleAsset1155View"
import {SingleAsset721View} from "./Assets/721/SingleAssetView/SingleAsset721View"
import {ProfileEditPage} from "./Edit/ProfileEditPage"

export const ProfilePage = () => {
	const {user} = useAuth()
	if (!user) return <Loading/>
	return <ProfilePageInner loggedInUser={user}/>
}

const ProfilePageInner = ({loggedInUser}: { loggedInUser: User }) => {
	const location = useLocation()
	const history = useHistory()

	const {send} = usePassportCommandsUser("/commander")
	const {username} = useParams<{ username: string }>()
	// User
	const [user, setUser] = useState<User>()
	const [loadingText, setLoadingText] = useState<string>()
	const [error, setError] = useState<string>()
	const [sentVerify, setSentVerify] = useState<boolean | null>(false)

	const handleSendVerify = useCallback(async () => {
		try {
			setSentVerify(null)
			const resp = await send<User>(HubKey.UserVerifySend, {
				user_agent: window.navigator.userAgent,
			})

			if (!resp.id) {
				throw resp
			}
			setSentVerify(true)
		} catch (err) {
			console.error(err)
			setSentVerify(false)
		}
	}, [send])

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

	if (!user) return <Loading text={loadingText}/>

	return (
		<Box
			sx={{
				display: "flex",
				flex: 1,
				flexDirection: "column",
				height: "100%",
			}}
		>
			<Navbar header={<Box
				sx={{
					// p: "2rem",
					display: "flex",
					gap: "1rem",
					flexDirection: "row",
					marginBottom: "0.5rem",
				}}
			>
				<Box>{loggedInUser?.id === user.id && <ProfileButton size="5rem" disabled sx={{mb: "1rem"}}/>}</Box>
				<Stack gap={"1rem"}>
					<Typography variant="h3" marginBottom={"0.5rem"}>
						{user.username}
					</Typography>
					{loggedInUser?.username === user.username && (user.first_name || user.last_name) && (
						<Typography variant="subtitle2">
							{user.first_name} {user.last_name}
						</Typography>
					)}
					{loggedInUser?.id === user.id && (
						<Link to={`/profile/${user.username}/edit`}
							  style={{textDecoration: "none", color: colors.neonPink}}>
							<FancyButton
								size="small"
								sx={{
									width: "100%",
									position: "relative",
								}}
							>
								Edit Profile
							</FancyButton>
						</Link>
					)}
				</Stack>
			</Box>}/>
			<Box
				sx={{
					display: "flex",
					flex: 1,
					m: "0 2rem 2rem 2rem",
					flexDirection: "column",
					alignItems: "center",
				}}
			>

				{!user.verified && user.email && (
					<Alert severity={sentVerify ? "info" : "error"} sx={{maxWidth: "600px", my: "1rem"}}>
						{sentVerify ? (
							"Email confirmation email sent! Please check your email."
						) : (
							<>
								Please verify your email: {user.email} <br/>
								Click{" "}
								{sentVerify === null ? (
									<CircularProgress size="15px" sx={{mx: ".5rem", mt: ".5rem"}}/>
								) : (
									<Typography
										component="span"
										onClick={handleSendVerify}
										sx={{
											cursor: "pointer",
											color: colors.darkerNeonBlue,
											fontWeight: "bold",
											textDecoration: "underline",
										}}
									>
										here
									</Typography>
								)}{" "}
								to resend a confirmation link to your email.
							</>
						)}
					</Alert>
				)}

				<Paper
					sx={{
						display: "flex",
						flexDirection: "column",
						overflow: "auto",
						width: "100%",
						borderRadius: 1.5,
						flexBasis: 0,
						flexGrow: 1,
					}}
				>
					<Switch>
						<Route exact path="/profile/:username/asset/:asset_hash">
							<SingleAsset721View edit={loggedInUser?.id === user.id}/>
						</Route>
						<Route exact path="/profile/:username/asset1155/:collection_slug/:token_id/:locked">
							<SingleAsset1155ViewPage edit={loggedInUser?.id === user.id} ownerID={user.id}/>
						</Route>
						<Route>
							<Tabs
								value={location.pathname}
								sx={{
									".MuiTab-root": {px: "2rem", py: "1.2rem"},
									borderBottom: 1,
									borderColor: "divider",
								}}
								onChange={(_event, newValue) => {
									history.push(newValue)
								}}
							>
								<Tab label="GAME ASSETS" value={`/profile/${username}/game-assets`}/>
								<Tab label="ACHIEVEMENTS" value={`/profile/${username}/achievements`}/>
							</Tabs>
							<Switch>
								<Route path={`/profile/${username}/game-assets`}>
									<Assets721 user={user} loggedInUser={loggedInUser}/>
								</Route>
								<Route path={`/profile/${username}/achievements`}>
									<Assets1155 user={user} loggedInUser={loggedInUser}/>
								</Route>
								<Route path={`/profile/${username}/edit`}>
									<ProfileEditPage/>
								</Route>
								<Route>
									<Redirect to={`/profile/${username || user.username}/game-assets`}/>
								</Route>
							</Switch>
						</Route>
					</Switch>
				</Paper>
			</Box>
		</Box>
	)
}

interface SingleAsset1155ViewPageProps {
	edit: boolean
	ownerID: string
}

const SingleAsset1155ViewPage = ({edit, ownerID}: SingleAsset1155ViewPageProps) => {
	const {
		collection_slug,
		token_id,
		locked
	} = useParams<{ collection_slug: string; token_id: string; locked: string }>()

	return (
		<SingleAsset1155View
			edit={edit}
			ownerID={ownerID}
			collection_slug={collection_slug}
			tokenID={parseInt(token_id, 10)}
			locked={locked !== "false"}
		/>
	)
}
