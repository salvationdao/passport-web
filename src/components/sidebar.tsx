import AppsIcon from "@mui/icons-material/Apps"
import FaceIcon from "@mui/icons-material/Face"
import LoginIcon from "@mui/icons-material/Login"
import LogoutIcon from "@mui/icons-material/Logout"
import StorefrontIcon from "@mui/icons-material/Storefront"
import { Box, Button, Divider, Drawer, SxProps, Theme, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { SupTokenIcon } from "../assets"
import { useAuth } from "../containers/auth"
import { supFormatter } from "../helpers/items"
import useSubscription from "../hooks/useSubscription"
import HubKey from "../keys"
import { colors } from "../theme"
import { FancyButton } from "./fancyButton"
import { ProfileButton } from "./home/navbar"
import { useSidebarState } from "../containers/sidebar"
import { useWeb3, Web3Provider } from "../containers/web3"

const drawerWidth = 300

export interface SidebarLayoutProps {
	onClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined
}

export const Sidebar: React.FC<SidebarLayoutProps> = ({ onClose, children }) => {
	const history = useHistory()
	const { user, logout } = useAuth()
	const { supBalance } = useWeb3()
	const { payload } = useSubscription<string>(HubKey.UserSupsSubscibe)
	const [errorMessage, setErrorMessage] = useState<string | undefined>()
	const [xsynSups, setXsynSups] = useState<string | undefined>()
	const [walletSups, setWalletSups] = useState<string | undefined>()

	const { sidebarOpen } = useSidebarState()

	useEffect(() => {
		if (!payload || !user) return
		setXsynSups(supFormatter(payload))
	}, [payload, user])

	useEffect(() => {
		setWalletSups(supBalance)
	}, [supBalance])

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
					{walletSups || "No sups"}
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
								setErrorMessage(
									"You must have a MetaMask connection if you want to redeem SUPs. You can connect your MetaMask account in your profile page.",
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
								setErrorMessage(
									"You must have a MetaMask connection if you want to withdraw SUPs. You can connect your MetaMask account in your profile page.",
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
				<NavButton to="/profile" startIcon={<FaceIcon />}>
					Profile
				</NavButton>
				<NavButton to={`/${user.username}/collections`} startIcon={<AppsIcon />}>
					Collections
				</NavButton>
				<NavButton to="/store" startIcon={<StorefrontIcon />}>
					Store
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
				<NavButton to="/store" startIcon={<StorefrontIcon />}>
					Store
				</NavButton>
			</Box>
		</Box>
	)

	return (
		<>
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
					{/* The implementation can be swapped with js to avoid SEO duplication of links. */}
					<Drawer
						variant="temporary"
						open={sidebarOpen}
						onClose={onClose}
						ModalProps={{
							keepMounted: true, // Better open performance on mobile.
						}}
						sx={{
							display: "none",
							"@media (max-width: 1000px)": {
								display: "block",
							},
							"& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
						}}
					>
						{content}
					</Drawer>
					<Drawer
						variant="persistent"
						sx={{
							width: drawerWidth,
							display: "block",
							flexShrink: 0,
							"@media (max-width: 1000px)": {
								display: "none",
							},
							"& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
						}}
						open={sidebarOpen}
					>
						{content}
					</Drawer>
				</Box>
				<Box
					component="main"
					sx={(theme) => ({
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
					{/*<Box component="main" sx={{ display: "flex", flex: 1 }}>*/}
					{children}
				</Box>
			</Box>
		</>
	)
}

interface NavButtonProps {
	to: string
	active?: boolean
	sx?: SxProps<Theme>
	startIcon?: React.ReactNode
}

const NavButton: React.FC<NavButtonProps> = ({ to, active, sx, startIcon, children }) => {
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
		>
			{children}
		</Button>
	)
}
