import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { IconName } from "@fortawesome/fontawesome-svg-core"
import { AuthContainer } from "../containers"
import { Perm } from "../types/enums"
import Logo from "../assets/images/NinjaSoftwareLogo.svg"
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Box, Hidden } from "@mui/material"
import { VersionText } from "./version"
import { useSidebarState } from "../containers/sidebar"

const drawerWidth = 240

interface SideBarProps {
	routes: SideBarRoute[]
	admin?: boolean
}

export const SideBar = ({ routes, admin }: SideBarProps) => {
	const { hasPermission } = AuthContainer.useContainer()
	const { sidebarOpen, setSidebarOpen } = useSidebarState()

	const contents = (
		<>
			<Box
				component={Link}
				to="/"
				sx={{
					width: "100%",
					minHeight: "140px",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Box component="img" src={Logo} alt="balloon" sx={{ width: "50%" }} />
			</Box>
			{!!admin && (
				<Typography
					variant="subtitle1"
					sx={{
						color: "black",
						fontWeight: 600,
						textAlign: "center",
						marginTop: "-10px",
					}}
				>
					ADMIN
				</Typography>
			)}

			<List>
				{routes.map(({ perm, ...rest }, index) => {
					if (!!perm && !hasPermission(perm)) return null
					return <SideMenuButton key={`sidebar-button-${index}`} index={index} {...rest} exact />
				})}
			</List>

			<VersionText />
		</>
	)

	return (
		<Box
			component="nav"
			sx={{
				width: {
					xs: "0px",
					md: sidebarOpen ? drawerWidth : "0px",
				},
				minWidth: {
					xs: "0px",
					md: "unset",
				},
				transition: "width 225ms ease",
			}}
		>
			<Hidden mdUp implementation={"js"}>
				<Drawer
					PaperProps={{
						elevation: 5,
						sx: {
							width: drawerWidth,
							color: "primary.contrastText",
							backgroundColor: "primary.main",
						},
					}}
					variant={"temporary"}
					anchor={"left"}
					open={sidebarOpen}
					onClose={() => setSidebarOpen(false)}
					ModalProps={{
						keepMounted: true,
					}}
				>
					{contents}
				</Drawer>
			</Hidden>
			<Hidden smDown implementation={"js"}>
				<Drawer
					PaperProps={{
						elevation: 5,
						sx: {
							width: drawerWidth,
							color: "primary.contrastText",
							backgroundColor: "primary.main",
						},
					}}
					variant={"persistent"}
					open={sidebarOpen}
					onClose={() => setSidebarOpen(false)}
				>
					{contents}
				</Drawer>
			</Hidden>
		</Box>
	)
}

interface ButtonProps {
	index: number
	label: string
	icon: IconName
	url: string
	exact?: boolean
}

export interface SideBarRoute extends Omit<ButtonProps, "index"> {
	perm?: Perm
}

const SideMenuButton = (props: ButtonProps) => {
	const { label, icon, url, exact } = props

	const selected = exact ? window.location.pathname === url : window.location.pathname.startsWith(url)

	return (
		<Box component={Link} to={url} sx={{ textDecoration: "none", color: "inherit" }}>
			<ListItem
				button
				key={label}
				sx={{
					backgroundColor: selected ? "rgba(0, 0, 0, 0.25)" : "unset",
				}}
			>
				<ListItemIcon
					sx={{
						width: "38px",
						marginLeft: "10px",
						textAlign: "center",
						color: "inherit",
					}}
				>
					<FontAwesomeIcon icon={["fal", icon]} size={"2x"} />
				</ListItemIcon>
				<ListItemText primary={label} />
			</ListItem>
		</Box>
	)
}
