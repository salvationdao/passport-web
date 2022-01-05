import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { AuthContainer } from "../containers/auth"
import { useHistory, Link } from "react-router-dom"
import { Perm } from "../types/enums"
import { ListPage } from "../pages/listPages"
import { Avatar, Button, Breadcrumbs, Typography, Popover, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material"
import { VerifyEmailNotification } from "./verifyEmailNotification"
import { Box } from "@mui/material"
import { styled } from "@mui/material/styles"
import { OnlineStatusBadge } from "./userAvatar"
import { useSidebarState } from "../containers/sidebar"
import { Menu as MenuIcon } from "@mui/icons-material"

interface Crumb {
	name: string
	url?: string
}

export const TopBar = () => {
	const history = useHistory()
	const { setSidebarOpen } = useSidebarState()

	// Calculate breadcrumbs from pathname
	const [breadcrumbs, setBreadcrumbs] = useState<Crumb[]>([])
	useEffect(() => {
		const crumbs: Crumb[] = []
		const split = history.location.pathname.split("/")
		if (split[0] === "") split.shift()
		if (split[split.length - 1] === "") split.pop()
		if (split.length === 0) {
			setBreadcrumbs([{ name: "Dashboard" }])
			return
		}

		let path = "/"
		for (let i = 0; i < split.length; i++) {
			crumbs.push({
				name: split[i]
					.replace(/[_.-]/g, " ") // replace dots, dashes and hyphens with spaces
					.replace("~", " / ") // replace ~ with / (for page titles that want a /)
					.replace(/([a-z])([A-Z])/g, "$1 $2"), // split camel-case
				url: i === split.length - 1 ? undefined : path + split[i],
			})
			path += split[i] + "/"
		}

		setBreadcrumbs(crumbs)
	}, [history.location.pathname])

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "flex-end",
				alignItems: "center",
				width: "100%",
				height: "70px",
				borderBottom: `1px solid #D9D9D9`,
				fontSize: "1.5rem",
			}}
		>
			<IconButton onClick={() => setSidebarOpen((prev) => !prev)} sx={{ ml: 1 }}>
				<MenuIcon />
			</IconButton>
			<Box
				sx={{
					marginRight: "25px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					width: "100%",
				}}
			>
				<Breadcrumbs
					aria-label="breadcrumb"
					sx={{
						textTransform: "capitalize",
						marginLeft: "20px",
						fontSize: "1.2rem",
					}}
				>
					{breadcrumbs.map((crumb, index) => {
						if (crumb.url)
							return (
								<Box
									component={Link}
									sx={
										index !== breadcrumbs.length - 1
											? {
													color: "#AAAAAA !important",
													":hover": {
														color: "#DADADA !important",
													},
											  }
											: undefined
									}
									key={`breadcrumb-${index}`}
									to={crumb.url}
								>
									{crumb.name}
								</Box>
							)
						return (
							<Typography color="textPrimary" key={`breadcrumb-${index}`} sx={{ fontSize: "1.2rem" }}>
								{crumb.name}
							</Typography>
						)
					})}
				</Breadcrumbs>

				<Account />
			</Box>
		</Box>
	)
}

const MenuItem = styled(Button)({
	dwidth: "100%",
	padding: "10px 20px",
	justifyContent: "left",
	whiteSpace: "nowrap",
})

const Account = () => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
	const open = Boolean(anchorEl)
	const id = open ? "simple-popover" : undefined
	const onClose = () => setAnchorEl(null)
	const token = localStorage.getItem("token")
	const { user, loading, hasPermission, impersonateUser, isImpersonatingUser, logout } = AuthContainer.useContainer()

	const [showImpersonateDialog, setShowImpersonateDialog] = useState(false)

	const history = useHistory()

	if (!user || loading) return null

	return (
		<>
			<Button
				onClick={(e) => setAnchorEl(e.currentTarget)}
				disableRipple
				sx={{
					cursor: "pointer",
					display: "flex",
					alignItems: "center",
				}}
			>
				<OnlineStatusBadge overlap="circular" anchorOrigin={{ vertical: "bottom", horizontal: "right" }} variant="dot">
					<Avatar
						src={user.avatarID ? `/api/files/${user.avatarID}?token=${encodeURIComponent(token || "")}` : undefined}
						style={{
							filter: isImpersonatingUser ? "grayscale(1) opacity(0.5)" : "unset",
						}}
					/>
				</OnlineStatusBadge>
				<Box sx={{ marginLeft: "0.5rem", marginRight: "0.5rem" }}>
					<Typography variant="h6" sx={{ marginTop: "0px", marginBottom: "0px" }}>
						{`${user.firstName} ${user.lastName}`}
					</Typography>
				</Box>
				<FontAwesomeIcon icon={["fal", open ? "chevron-up" : "chevron-down"]} size={"xs"} />
			</Button>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={onClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
			>
				<Box sx={{ display: "flex", flexDirection: "column" }}>
					<MenuItem
						startIcon={<FontAwesomeIcon icon={["fal", "cog"]} />}
						onClick={() => {
							history.push("/settings")
							onClose()
						}}
					>
						Settings
					</MenuItem>
					{isImpersonatingUser && (
						<MenuItem startIcon={<FontAwesomeIcon icon={["fal", "user-secret"]} />} onClick={() => impersonateUser()}>
							Stop Impersonating User
						</MenuItem>
					)}
					{hasPermission(Perm.ImpersonateUser) && (
						<MenuItem startIcon={<FontAwesomeIcon icon={["fal", "user-secret"]} />} onClick={() => setShowImpersonateDialog(true)}>
							Impersonate User
						</MenuItem>
					)}
					<MenuItem
						startIcon={<FontAwesomeIcon icon={["fal", "sign-out"]} />}
						onClick={() => {
							logout()
						}}
					>
						Log out
					</MenuItem>
				</Box>
			</Popover>

			<Dialog onClose={() => setShowImpersonateDialog(false)} open={showImpersonateDialog} fullWidth maxWidth="lg" PaperProps={{ sx: { height: "100%" } }}>
				<DialogTitle>
					<Typography variant="h6">Impersonate User</Typography>
					<IconButton
						aria-label="close"
						onClick={() => setShowImpersonateDialog(false)}
						size="large"
						sx={{ position: "absolute", right: 1, top: 1, color: "text.secondary" }}
					>
						<FontAwesomeIcon icon={["fal", "times"]} />
					</IconButton>
				</DialogTitle>
				<DialogContent>
					<ListPage.View
						id="user_id"
						onRowClick={(user) => {
							impersonateUser(user)
							setShowImpersonateDialog(false)
						}}
					/>
				</DialogContent>
			</Dialog>

			{!user.verified && <VerifyEmailNotification />}
		</>
	)
}
