import AppsIcon from "@mui/icons-material/Apps"
import FaceIcon from "@mui/icons-material/Face"
import LoginIcon from "@mui/icons-material/Login"
import LogoutIcon from "@mui/icons-material/Logout"
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi"
import StorefrontIcon from "@mui/icons-material/Storefront"
import { Alert, Box, Button, Divider, Drawer, SxProps, Theme, Typography, useMediaQuery } from "@mui/material"
import { BigNumber } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import { useEffect, useState } from "react"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { SupTokenIcon } from "../assets"
import { useAuth } from "../containers/auth"
import { useSidebarState } from "../containers/sidebar"
import { useSnackbar } from "../containers/snackbar"
import { API_ENDPOINT_HOSTNAME, SocketState, useWebsocket } from "../containers/socket"
import { useWeb3 } from "../containers/web3"
import { useSecureSubscription } from "../hooks/useSecureSubscription"
import HubKey from "../keys"
import { colors } from "../theme"
import { Faction, User } from "../types/types"
import { DepositSupsModal } from "./depositSupsModal"
import { FancyButton } from "./fancyButton"
import { ProfileButton } from "./home/navbar"
import { EnlistButton } from "./supremacy/enlistButton"
import { WithdrawSupsModal } from "./withdrawSupsModal"

const drawerWidth = 300

export interface SidebarLayoutProps {
	onClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined
}

export const Sidebar: React.FC<SidebarLayoutProps> = ({ onClose, children }) => {
	const history = useHistory()
	const { send, state } = useWebsocket()
	const { sidebarOpen, setSidebarOpen } = useSidebarState()
	const { displayMessage } = useSnackbar()
	const { user, logout } = useAuth()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	// Wallet
	const userPublicAddress = user?.publicAddress

	// Supremacy
	const [factionsData, setFactionsData] = useState<Faction[]>([])
	const { supBalance, account } = useWeb3()
	const [walletSups, setWalletSups] = useState<string | undefined>()
	const [walletMsg, setWalletMsg] = useState<string>()
	const { payload: userSups } = useSecureSubscription<string>(HubKey.UserSupsSubscribe)
	const [withdrawDialogOpen, setWithdrawDialogOpen] = useState<boolean>(false)
	const [depositDialogOpen, setDepositDialogOpen] = useState<boolean>(false)
	const [xsynSups, setXsynSups] = useState<BigNumber>(BigNumber.from(0))

	const correctWalletCheck = (userPubAddr: string, metaMaskAcc: string) => {
		const str1 = userPubAddr.toUpperCase()
		const str2 = metaMaskAcc.toUpperCase()

		return str1 === str2
	}

	useEffect(() => {
		// not logged in
		if (!user || !account) {
			setWalletMsg("")
			setWalletSups("N/A")
			return
		}
		if (userSups) {
			setXsynSups(BigNumber.from(userSups))
		}

		// no wallet connected
		if (!user.publicAddress) {
			setWalletMsg("Wallet not connected")
			setWalletSups("N/A")
			return
		}

		const correctWallet = correctWalletCheck(user.publicAddress, account)
		setWalletMsg(correctWallet ? "" : "Incorrect wallet connected")
		if (supBalance) setWalletSups(correctWallet ? formatUnits(supBalance, 18) : "N/A")
	}, [userSups, supBalance, account, user, userPublicAddress])

	useEffect(() => {
		if (state !== SocketState.OPEN) return
		;(async () => {
			try {
				const resp = await send<Faction[]>(HubKey.GetFactionsDetail)

				setFactionsData(resp)
			} catch (e) {
				setFactionsData([])
			}
		})()
	}, [send, state])

	let truncatedUsername = ""
	if (user) {
		const maxLength = 8
		truncatedUsername = user.username
		if (truncatedUsername.length > maxLength) {
			truncatedUsername = `${user.username.substring(0, maxLength)}...`
		}
	}
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
					size="4rem"
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
					<Typography variant="h5">{truncatedUsername}</Typography>
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
				{!!walletMsg && <Alert severity="error">{walletMsg}</Alert>}

				<Typography
					sx={{
						textTransform: "uppercase",
						fontWeight: 600,
					}}
				>
					My Wallet
				</Typography>
				<Typography
					key={`usersups-${xsynSups.toString()}`}
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
						XSYN Balance:
					</Box>
					<SupTokenIcon />
					{formatUnits(xsynSups, 18)}
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
						Wallet Balance:
					</Box>
					<SupTokenIcon />
					{walletSups ? walletSups : "___"}
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
					{/* <FancyButton
						size="small"
						sx={{
							flex: 1,
						}}
						onClick={() => {
							if (!user.publicAddress) {
								displayMessage(
									"You must have a wallet connected to your account if you want to redeem SUPs. You can connect a wallet account in your profile page.",
									"error",
								)
							}
						}}
					>
						Redeem
					</FancyButton> */}
					<FancyButton
						size="small"
						borderColor={colors.skyBlue}
						sx={{
							flex: 1,
						}}
						onClick={() => {
							if (!user.publicAddress) {
								displayMessage(
									"You must have a wallet connected to your account if you want to redeem SUPs. You can connect a wallet account in your profile page.",
									"error",
								)
								return
							}
							history.push("/withdraw")
						}}
					>
						Withdraw
					</FancyButton>
					<FancyButton
						size="small"
						borderColor={colors.neonPink}
						sx={{
							flex: 1,
						}}
						onClick={() => {
							if (!user.publicAddress) {
								displayMessage(
									"You must have a wallet connected to your account if you want to redeem SUPs. You can connect a wallet account in your profile page.",
									"error",
								)
								return
							}
							setDepositDialogOpen(true)
						}}
					>
						Deposit
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
					Supremacy
				</Typography>
				<Divider />
				<RenderEnlist factionsData={factionsData} user={user} />
				<Divider />
				<NavButton
					sx={{ color: !xsynSups.eq(0) ? "" : colors.supremacy.grey, cursor: { color: !xsynSups.eq(0) ? "pointer" : "default" } }}
					onClick={() => {
						if (!xsynSups.eq(0)) {
							window.open("https://staging-watch.supremacy.game", "_blank")?.focus()
						}
					}}
					to={`/profile`}
					startIcon={<SportsKabaddiIcon />}
				>
					{!xsynSups.eq(0) ? "Battle Arena" : "Battle Arena (SUPS required)"}
				</NavButton>
				<Divider />
				<a></a>
				<NavButton to={`/collections`} startIcon={<AppsIcon />}>
					My Inventory
				</NavButton>
				<NavButton to="/stores" startIcon={<StorefrontIcon />}>
					Purchase Assets
				</NavButton>
			</Box>

			<Divider />
			<Box flex="1" />
			<NavButton sx={{ alignSelf: "start", width: "100%" }} to="/profile" startIcon={<FaceIcon />}>
				Edit Profile
			</NavButton>
			<Box>
				<Button
					startIcon={<LogoutIcon />}
					onClick={() => logout()}
					sx={(theme) => ({
						justifyContent: "flex-start",
						width: "100%",
						":hover": {
							backgroundColor: theme.palette.error.main,
						},
					})}
				>
					Logout
				</Button>
			</Box>
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
				<NavButton to="/stores" startIcon={<StorefrontIcon />}>
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
			<WithdrawSupsModal open={withdrawDialogOpen} onClose={() => setWithdrawDialogOpen(false)} />
			<DepositSupsModal
				walletBalance={supBalance || BigNumber.from(0)}
				xsynBalance={xsynSups}
				open={depositDialogOpen}
				onClose={() => setDepositDialogOpen(false)}
			/>
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
