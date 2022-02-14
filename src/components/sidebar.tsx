import AppsIcon from "@mui/icons-material/Apps"
import FaceIcon from "@mui/icons-material/Face"
import LoginIcon from "@mui/icons-material/Login"
import LogoutIcon from "@mui/icons-material/Logout"
import StorefrontIcon from "@mui/icons-material/Storefront"
import { Alert, Box, Button, Divider, Drawer, SxProps, Theme, Typography, useMediaQuery } from "@mui/material"
import { useEffect, useState } from "react"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { SupTokenIcon } from "../assets"
import { useAuth } from "../containers/auth"
import { useSidebarState } from "../containers/sidebar"
import { useSnackbar } from "../containers/snackbar"
import { API_ENDPOINT_HOSTNAME, SocketState, useWebsocket } from "../containers/socket"
import { useWeb3 } from "../containers/web3"
import { supFormatter } from "../helpers/items"
import HubKey from "../keys"
import { colors } from "../theme"
import { NilUUID } from "../types/auth"
import { Faction, User } from "../types/types"
import { FancyButton } from "./fancyButton"
import { ProfileButton } from "./home/navbar"
import { EnlistButton } from "./supremacy/enlistButton"

const drawerWidth = 300

export interface SidebarLayoutProps {
	onClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined
}

export const Sidebar: React.FC<SidebarLayoutProps> = ({ onClose, children }) => {
	const history = useHistory()
	const { send, state } = useWebsocket()
	const { sidebarOpen, setSidebarOpen } = useSidebarState()
	const { displayMessage } = useSnackbar()
	const { user, userID, logout } = useAuth()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	// Wallet
	const { supBalance, account } = useWeb3()
	const userPublicAddress = user?.publicAddress
	const { subscribe } = useWebsocket()
	const [xsynSups, setXsynSups] = useState<string | undefined>()

	// Supremacy
	const [factionsData, setFactionsData] = useState<Faction[]>()
	const [walletSups, setWalletSups] = useState<string | undefined>()
	const [correctWallet, setCorrectWallet] = useState<boolean>()

	const correctWalletCheck = (userPubAddr: string, metaMaskAcc: string) => {
		const str1 = userPubAddr.toUpperCase()
		const str2 = metaMaskAcc.toUpperCase()
		return str1 === str2
	}

	useEffect(() => {
		if (!userID || userID === NilUUID) return
		return subscribe<string>(HubKey.UserSupsSubscribe, (payload) => {
			if (!payload) return
			setXsynSups(supFormatter(payload))
		})
	}, [userID, subscribe])

	useEffect(() => {
		if (!userID || userID === NilUUID || !userPublicAddress || !account) return
		const correctWallet = correctWalletCheck(userPublicAddress, account)
		setCorrectWallet(correctWallet)
		setWalletSups(correctWallet ? supBalance : "N/A")
	}, [supBalance, account, userID, userPublicAddress])

	useEffect(() => {
		// let unmounted = false
		if (state !== SocketState.OPEN) return
		;(async () => {
			try {
				const resp = await send<Faction[]>(HubKey.GetFactionsDetail)

				setFactionsData(resp)
			} catch (e) {
				setFactionsData(undefined)
			}
		})()
	}, [send, state])

	const content = user ? (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				padding: "1rem",
				"& > *:not(:last-child)": {
					marginBottom: "1rem",
				},
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "flex-end",
				}}
			>
				<ProfileButton
					sx={{
						marginRight: "2rem",
					}}
					size="5rem"
				/>
				<Box
					sx={{
						overflow: "hidden",
						width: "100%",
						whiteSpace: "nowrap",
						textOverflow: "ellipsis",
					}}
				>
					<Typography variant="subtitle1">
						{user.firstName} {user.lastName}
					</Typography>
					<Typography variant="h5">{user.username}</Typography>
				</Box>
			</Box>
			<Divider />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					"& > *:not(:last-child)": {
						marginBottom: ".5rem",
					},
				}}
			>
				{!correctWallet && <Alert severity="error">Incorrect wallet connected</Alert>}

				<Typography
					sx={{
						textTransform: "uppercase",
						fontWeight: 600,
					}}
				>
					SUPS
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
						XSYN SUPs:
					</Box>
					<SupTokenIcon />
					{xsynSups}
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
						Wallet SUPs:
					</Box>
					<SupTokenIcon />
					{walletSups}
				</Typography>
				<Box
					sx={{
						display: "flex",
						"& > *:not(:last-child)": {
							marginRight: ".2rem",
						},
					}}
				>
					<FancyButton
						size="small"
						borderColor={colors.supremacyGold}
						sx={{
							flex: 1,
						}}
						onClick={() => {
							history.push("/buy")
						}}
					>
						Buy SUPS
					</FancyButton>
					<FancyButton
						size="small"
						sx={{
							flex: 1,
						}}
						onClick={() => {
							if (!user.publicAddress) {
								displayMessage(
									"You must have a MetaMask connection if you want to redeem SUPs. You can connect your MetaMask account in your profile page.",
									"error",
								)
							}
						}}
					>
						Redeem
					</FancyButton>
					<FancyButton
						size="small"
						borderColor={colors.skyBlue}
						sx={{
							flex: 1,
						}}
						onClick={() => {
							if (!user.publicAddress) {
								displayMessage(
									"You must have a MetaMask connection if you want to withdraw SUPs. You can connect your MetaMask account in your profile page.",
									"error",
								)
							}
						}}
					>
						Withdraw
					</FancyButton>
				</Box>
			</Box>
			<Divider />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					"& > *:not(:last-child)": {
						marginBottom: ".5rem",
					},
				}}
			>
				<Typography
					sx={{
						marginBottom: ".5rem",
						textTransform: "uppercase",
						fontWeight: 600,
					}}
				>
					Supremacy - Enlist
				</Typography>
				<RenderEnlist factionsData={factionsData} user={user} />
			</Box>
			<Divider />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Typography
					sx={{
						marginBottom: ".5rem",
						textTransform: "uppercase",
						fontWeight: 600,
					}}
				>
					Quick Links
				</Typography>
				<NavButton onClick={() => setSidebarOpen(false)} to="/profile" startIcon={<FaceIcon />}>
					Profile
				</NavButton>
				<NavButton onClick={() => setSidebarOpen(false)} to={`/collections`} startIcon={<AppsIcon />}>
					Collections
				</NavButton>
				<NavButton onClick={() => setSidebarOpen(false)} to="/stores" startIcon={<StorefrontIcon />}>
					Stores
				</NavButton>
			</Box>
			<Divider />
			<Box flex="1" />
			<Button
				startIcon={<LogoutIcon />}
				onClick={() => logout()}
				sx={(theme) => ({
					":hover": {
						backgroundColor: theme.palette.error.main,
					},
				})}
			>
				Logout
			</Button>
		</Box>
	) : (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				padding: "1rem",
				"& > *:not(:last-child)": {
					marginBottom: "1rem",
				},
			}}
		>
			<FancyButton startIcon={<LoginIcon />} onClick={() => history.push("/login")}>
				Login
			</FancyButton>
			<Divider />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
				}}
			>
				<Typography
					sx={{
						marginBottom: ".5rem",
						textTransform: "uppercase",
						fontWeight: 600,
					}}
				>
					Quick Links
				</Typography>
				<NavButton onClick={() => setSidebarOpen(false)} to="/stores" startIcon={<StorefrontIcon />}>
					Stores
				</NavButton>
			</Box>
		</Box>
	)

	return (
		<Box
			sx={{
				display: "flex",
			}}
		>
			<Box
				component="nav"
				sx={{
					"@media (min-width: 1000px)": {
						width: drawerWidth,
						flexShrink: 0,
					},
				}}
			>
				{isWiderThan1000px ? (
					<Drawer
						variant="persistent"
						sx={{
							width: drawerWidth,
							flexShrink: 0,
							"& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
						}}
						open={sidebarOpen}
					>
						{content}
					</Drawer>
				) : (
					<Drawer
						variant="temporary"
						open={sidebarOpen}
						onClose={onClose}
						ModalProps={{
							keepMounted: true, // Better open performance on mobile.
						}}
						sx={{
							"& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
						}}
					>
						{content}
					</Drawer>
				)}
			</Box>
			<Box
				component="main"
				sx={(theme) => ({
					overflowX: "auto",
					flexGrow: 1,
					transition: theme.transitions.create("margin", {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.leavingScreen,
					}),
					marginLeft: `-${drawerWidth}px`,
					"@media (max-width: 1000px)": {
						marginLeft: 0,
					},
					...(sidebarOpen && {
						transition: theme.transitions.create("margin", {
							easing: theme.transitions.easing.easeOut,
							duration: theme.transitions.duration.enteringScreen,
						}),
						marginLeft: 0,
					}),
				})}
			>
				{children}
			</Box>
		</Box>
	)
}

interface NavButtonProps {
	to: string
	active?: boolean
	sx?: SxProps<Theme>
	startIcon?: React.ReactNode
	onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

const NavButton: React.FC<NavButtonProps> = ({ to, active, sx, startIcon, onClick, children }) => {
	return (
		<Button
			sx={{
				justifyContent: "start",
				backgroundColor: active ? colors.lightNavyBlue : undefined,
				...sx,
			}}
			component={RouterLink}
			to={to}
			startIcon={startIcon}
			onClick={onClick}
		>
			{children}
		</Button>
	)
}

interface EnlistButtonGroupProps {
	factionsData: Faction[]
}

const EnlistButtonGroup: React.VoidFunctionComponent<EnlistButtonGroupProps> = ({ factionsData }) => {
	if (!factionsData) return <Box>Loading...</Box>

	return (
		<Box
			sx={{
				display: "flex",
				"& > *:not(:last-child)": {
					marginRight: ".2rem",
				},
			}}
		>
			{factionsData.map((f) => (
				<EnlistButton key={f.id} faction={f} />
			))}
		</Box>
	)
}

const RenderEnlist = ({ factionsData, user }: { factionsData?: Faction[]; user?: User }) => {
	if (!factionsData) return <Box>Loadiaang...</Box>
	if (user?.faction) {
		return (
			<>
				<Typography
					sx={{
						display: "flex",
						alignItems: "start",
					}}
				>
					<Box
						component="img"
						src={`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${user.faction.logoBlobID}`}
						alt="Faction Logo"
						sx={{
							height: "2rem",
							marginRight: ".5rem",
						}}
					/>
					<span>{user.faction.label}</span>
				</Typography>
			</>
		)
	}
	return <EnlistButtonGroup factionsData={factionsData} />
}
