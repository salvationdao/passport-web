import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet"
import AppsIcon from "@mui/icons-material/Apps"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import FaceIcon from "@mui/icons-material/Face"
import LoginIcon from "@mui/icons-material/Login"
import LogoutIcon from "@mui/icons-material/Logout"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import SavingsIcon from "@mui/icons-material/Savings"
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import StorefrontIcon from "@mui/icons-material/Storefront"
import { Box, Button, Divider, Drawer, Stack, SxProps, Theme, Typography, useMediaQuery, useTheme } from "@mui/material"
import { BigNumber } from "ethers"
import React, { useEffect, useState } from "react"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { MetaMaskIcon, WalletConnectIcon } from "../assets"
import SupsToken from "../assets/images/sup-token.svg"
import SupsTokenLogo from "../assets/images/sups-token-logo.png"
import { API_ENDPOINT_HOSTNAME, BATTLE_ARENA_LINK, TOKEN_SALE_ENDPOINT } from "../config"
import { useAuth } from "../containers/auth"
import { useSidebarState } from "../containers/sidebar"
import { SocketState, useWebsocket } from "../containers/socket"
import { MetaMaskState, useWeb3 } from "../containers/web3"
import { supFormatter } from "../helpers/items"
import { useSecureSubscription } from "../hooks/useSecureSubscription"
import HubKey from "../keys"
import { colors } from "../theme"
import { Faction, FactionTheme, User } from "../types/types"
import { DepositSupsModal } from "./depositSupsModal"
import { FancyButton } from "./fancyButton"
import { ProfileButton } from "./home/navbar"
import { EnlistButton } from "./supremacy/enlistButton"
import { WithdrawSupsModal } from "./withdrawSupsModal"

const drawerWidth = 260

export interface SidebarLayoutProps {
	onClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined
}

export const Sidebar: React.FC<SidebarLayoutProps> = ({ onClose, children }) => {
	const history = useHistory()
	const { send, state } = useWebsocket()
	const { sidebarOpen } = useSidebarState()
	const { user, logout } = useAuth()
	const isWiderThan1000px = useMediaQuery("(min-width:1000px)")

	// Wallet
	const userPublicAddress = user?.public_address

	// Supremacy
	const [factionsData, setFactionsData] = useState<Faction[]>([])
	const { supBalance, account, metaMaskState } = useWeb3()
	const theme = useTheme()
	const [walletSups, setWalletSups] = useState<string | undefined>()
	const [walletMsg, setWalletMsg] = useState<string>()
	const { payload: userSups } = useSecureSubscription<string>(HubKey.UserSupsSubscribe)
	const [withdrawDialogOpen, setWithdrawDialogOpen] = useState<boolean>(false)
	const [depositDialogOpen, setDepositDialogOpen] = useState<boolean>(false)
	const [xsynSups, setXsynSups] = useState<BigNumber>(BigNumber.from(0))

	useEffect(() => {
		if (userSups) {
			setXsynSups(BigNumber.from(userSups))
		}
	}, [userSups])

	useEffect(() => {
		// not logged in
		if (!user || !account) {
			setWalletMsg("")
			setWalletSups(undefined)
			return
		}

		// no wallet connected
		if (!user.public_address) {
			setWalletMsg("Wallet not connected")
			setWalletSups(undefined)
			return
		}

		if (supBalance) setWalletSups(supBalance.toString())
	}, [supBalance, account, user, userPublicAddress, metaMaskState])

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
				overflowY: "auto",
				overflowX: "hidden",
				scrollbarWidth: "none",
				"::-webkit-scrollbar": {
					width: 4,
				},
				"::-webkit-scrollbar-track": {
					boxShadow: `inset 0 0 5px ${colors.darkNavyBackground}`,
					borderRadius: 3,
				},
				"::-webkit-scrollbar-thumb": {
					background: colors.darkNeonBlue,
					borderRadius: 3,
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
						{user.first_name} {user.last_name}
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
				<Box sx={{ display: "grid", width: "100%", gridTemplateColumns: "1fr 1fr 1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
					<Box
						sx={{
							gridColumnStart: "1",
							gridColumnEnd: "2",
							gridRowStart: "1",
							gridRowEnd: "3",
							justifySelf: "center",
							alignSelf: "center",
							border: `.5px solid ${colors.lightNavyBlue}`,
							borderRadius: "50%",
							height: "3.5rem",
							width: "3.5rem",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Box component="img" src={SupsTokenLogo} alt="token image" sx={{ height: "2.5rem", margin: ".5rem" }} />
					</Box>
					<Box
						sx={{
							gridColumnStart: "2",
							gridColumnEnd: "5",
							gridRowStart: "1",
							gridRowEnd: "2",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", width: "100%", marginBottom: ".2rem" }}>
							<SportsEsportsIcon sx={{ fontSize: "1.2rem", color: colors.darkGrey }} />
							<Box component="img" src={SupsToken} alt="token image" sx={{ height: "1rem", padding: " 0 .5rem" }} />
							<Typography variant="body1">{xsynSups ? supFormatter(xsynSups.toString()) : "--"}</Typography>
						</Box>

						<Divider />
					</Box>
					<Box
						sx={{
							gridColumnStart: "2",
							gridColumnEnd: "5",
							gridRowStart: "2",
							gridRowEnd: "3",
						}}
					>
						<Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
							{metaMaskState === MetaMaskState.NotInstalled ? (
								<WalletConnectIcon height={"1.2rem"} width={"1.2rem"} />
							) : (
								<MetaMaskIcon height={"1.2rem"} width={"1.2rem"} />
							)}
							<Box component="img" src={SupsToken} alt="token image" sx={{ height: "1rem", padding: "0 .5rem" }} />
							<Typography variant="body1">{walletSups ? supFormatter(walletSups) : "--"}</Typography>
						</Box>
					</Box>
				</Box>
				<Box>
					<FancyButton
						onClick={() => {
							window.open(TOKEN_SALE_ENDPOINT, "_blank")?.focus()
						}}
						borderColor={colors.skyBlue}
						sx={{ fontWeight: 400, width: "100%", marginTop: "1rem" }}
					>
						Token Sale
					</FancyButton>
				</Box>
				{
					//TODO: these buttons to be display: flex after launch
				}
			</Box>
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					"& > *:not(:last-child)": {
						marginBottom: ".5rem",
					},
				}}
			>
				<Divider />
				<Typography variant="body1" sx={{ textTransform: "uppercase", textAlign: "center", fontWeight: "600" }}>
					{user?.faction ? "Your Syndicate" : "Choose Your Syndicate"}
				</Typography>
				<RenderEnlist factionsData={factionsData} user={user} />
				<FactionWarMachineRemain />
				<Divider />
				<Button
					sx={{
						justifyContent: "start",
						color: !xsynSups.eq(0) ? "" : colors.supremacy.grey,
						cursor: { color: !xsynSups.eq(0) ? "pointer" : "default" },
					}}
					onClick={() => {
						if (!xsynSups.eq(0)) {
							window.open(BATTLE_ARENA_LINK, "_blank")?.focus()
						}
					}}
					startIcon={<PlayArrowIcon />}
				>
					{!xsynSups.eq(0) ? "Battle Arena" : "Battle Arena (SUPS required)"}
				</Button>
				<Divider />
				<NavButton to={`/collections/${user?.username}`} startIcon={<AppsIcon />}>
					My Inventory
				</NavButton>
				<NavButton to="/stores/supremacy-genesis" startIcon={<StorefrontIcon />}>
					Purchase Assets
				</NavButton>
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
				<NavButton to="/withdraw" startIcon={<AccountBalanceWalletIcon />}>
					Withdraw
				</NavButton>
				<NavButton to="/deposit" startIcon={<SavingsIcon />}>
					Deposit
				</NavButton>
				<NavButton to="/transactions" startIcon={<ReceiptLongIcon />}>
					Transactions
				</NavButton>
			</Box>

			{!!walletMsg && (
				<Box sx={{ display: "flex" }}>
					<ErrorOutlineIcon sx={{ fontSize: "2rem", color: theme.palette.error.light, alignSelf: "center" }} />
					<Typography variant="body1" sx={{ marginLeft: ".2rem" }}>
						{walletMsg}
					</Typography>
				</Box>
			)}
			<Box flex="1" />
			<NavButton sx={{ alignSelf: "start", width: "100%" }} to="/profile" startIcon={<FaceIcon />}>
				Profile
			</NavButton>
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
					flexGrow: 1,
					minWidth: 0, // DO NOT REMOVE THIS OR OVERFLOW X MAY BREAK ON SOME PAGES
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
			<WithdrawSupsModal
				walletBalance={supBalance || BigNumber.from(0)}
				xsynBalance={xsynSups}
				open={withdrawDialogOpen}
				onClose={() => setWithdrawDialogOpen(false)}
			/>
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
	const { setSidebarOpen } = useSidebarState()
	const mobileScreen = useMediaQuery("(max-width:600px)")

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
			onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
				if (mobileScreen) {
					setSidebarOpen(false)
				}
				if (onClick) {
					onClick(e)
				}
			}}
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
	if (!factionsData) return <Box>Loading...</Box>
	if (user?.faction) {
		return (
			<>
				<Typography
					sx={{
						display: "flex",
						alignItems: "center",
						color: user.faction.theme.primary,
						fontWeight: "fontWeightBold",
					}}
				>
					<Box
						component="img"
						src={`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${user.faction.logo_blob_id}`}
						alt={`${user.faction.label} Faction Logo`}
						sx={{
							height: "2rem",
							width: "2rem",
							marginRight: ".5rem",
							flexShrink: 0,
							objectFit: "contain",
							backgroundColor: user.faction.theme.primary,
							borderRadius: 0.8,
							border: `${user.faction.theme.primary} 1px solid`,
						}}
					/>
					<span>{user.faction.label}</span>
				</Typography>
			</>
		)
	}
	return <EnlistButtonGroup factionsData={factionsData} />
}

interface FactionAvailable {
	id: string
	label: string
	logo_blob_id: string
	theme: FactionTheme
	mega_amount: number
	lootbox_amount: number
}

const FactionWarMachineRemain = () => {
	const { state, subscribe } = useWebsocket()
	const [factionAvailables, setFactionAvailables] = useState<FactionAvailable[]>([])

	useEffect(() => {
		if (state !== WebSocket.OPEN || !subscribe) return
		return subscribe<FactionAvailable[]>(HubKey.FactionAvailables, (payload) => {
			if (!payload) return
			setFactionAvailables(payload)
		})
	}, [state, subscribe])

	return (
		<Stack spacing={1}>
			<Typography sx={{ py: 1.2, px: 1, textAlign: "center", color: colors.supremacy.neonBlue, backgroundColor: "#00000099" }} variant="h6">
				WAR MACHINES REMAINING
			</Typography>

			<Stack justifyContent="space-around" spacing={1.5}>
				{factionAvailables.map((fa) => {
					const { id, logo_blob_id, theme, mega_amount, lootbox_amount } = fa

					return (
						<Stack key={id} spacing={1} direction="row" alignItems="center" sx={{ px: 1 }}>
							<Box
								sx={{
									width: 41,
									height: 41,
									flexShrink: 0,
									backgroundImage: `url(${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${logo_blob_id})`,
									backgroundRepeat: "no-repeat",
									backgroundPosition: "center",
									backgroundSize: "contain",
									backgroundColor: theme.primary,
									borderRadius: 0.8,
									border: `${theme.primary} 1px solid`,
								}}
							/>
							<Stack>
								<Stack direction="row">
									<Typography sx={{ fontWeight: "fontWeightBold" }}>Mega:&nbsp;</Typography>
									<Typography sx={{ color: theme.primary, fontWeight: "fontWeightLight" }}>{mega_amount}</Typography>
								</Stack>
								<Stack direction="row">
									<Typography sx={{ fontWeight: "fontWeightBold" }}>Mystery Crates:&nbsp;</Typography>
									<Typography sx={{ color: theme.primary, fontWeight: "fontWeightLight" }}>{lootbox_amount}</Typography>
								</Stack>
							</Stack>
						</Stack>
					)
				})}
			</Stack>
		</Stack>
	)
}
