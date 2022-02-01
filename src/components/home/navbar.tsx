import { LoadingButton } from "@mui/lab"
import { Avatar, Box, BoxProps, IconButton, IconButtonProps, Menu, MenuItem, MenuItemProps, MenuList, useTheme } from "@mui/material"
import React, { useState } from "react"
import { Link, useHistory, useLocation } from "react-router-dom"
import SupremacyLogo from "../../assets/images/supremacy-logo.svg"
import XSYNLogoImage from "../../assets/images/XSYN Stack White.svg"
import { AuthContainer } from "../../containers"

interface NavbarProps extends BoxProps {}

export const Navbar: React.FC<NavbarProps> = ({ sx, ...props }) => {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				width: "100%",
				maxWidth: "1700px",
				margin: "0 auto",
				padding: "0 3rem",
				paddingTop: "3rem",
				...sx,
			}}
			{...props}
		>
			<Link to="/">
				<Box component="img" src={XSYNLogoImage} alt="XSYN Logo" />
			</Link>
			<Box
				sx={{
					flex: 1,
				}}
			/>
			<ProfileButton
				sx={{
					marginRight: "2rem",
				}}
			/>
			<MenuButton />
		</Box>
	)
}

const ProfileButton: React.FC<IconButtonProps> = ({ sx, onClick, ...props }) => {
	const history = useHistory()
	const { user } = AuthContainer.useContainer()
	const token = localStorage.getItem("token")
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
	const open = Boolean(anchorEl)

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
		if (onClick) onClick(event)
		history.push("/profile")
		// setAnchorEl(event.currentTarget);
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	if (!user) return null

	return (
		<>
			<Menu
				id="profile-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}
				PaperProps={{
					sx: (theme) => ({
						padding: "1rem",
						backgroundColor: theme.palette.background.default,
					}),
				}}
			>
				<StyledMenuItem route="/profile" label="Profile" handleClose={handleClose} />
			</Menu>
			<IconButton
				onClick={handleClick}
				sx={{
					position: "relative",
					width: "fit-content",
					padding: 0,
					"& .Avatar, & .Avatar-border": {
						transition: "transform .2s cubic-bezier(.3, .7, .4, 1.5)",
					},
					"&:hover .Avatar": {
						transform: "translate3d(-2px, -2px, 0)",
					},
					"&:hover .Avatar-border": {
						transform: "translate3d(2px, 2px, 0)",
					},
					"&:active .Avatar": {
						transform: "translate3d(1px, 1px, 0)",
					},
					"&:active .Avatar-border": {
						transform: "translate3d(-1px, -1px, 0)",
					},
					...sx,
				}}
				{...props}
			>
				<Box
					className="Avatar-border"
					sx={(theme) => ({
						zIndex: -1,
						position: "absolute",
						top: ".3rem",
						left: ".3rem",
						display: "block",
						width: "100%",
						height: "100%",
						borderRadius: "50%",
						border: `2px solid ${theme.palette.secondary.main}`,
					})}
				/>
				{!!user && (
					<Avatar
						className="Avatar"
						src={user.avatarID ? `/api/files/${user.avatarID}?token=${encodeURIComponent(token || "")}` : undefined}
						sx={{
							height: "3rem",
							width: "3rem",
						}}
					/>
				)}
			</IconButton>
		</>
	)
}

const MenuButton: React.FC = () => {
	const { user, logout } = AuthContainer.useContainer()
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
	const open = Boolean(anchorEl)

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
		setAnchorEl(event.currentTarget)
	}
	const handleClose = () => {
		setAnchorEl(null)
	}

	return (
		<>
			<Menu
				id="nav-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}
				PaperProps={{
					sx: (theme) => ({
						padding: "1rem",
						backgroundColor: theme.palette.background.default,
					}),
				}}
			>
				<MenuList>
					{!!user ? (
						[
							<StyledMenuItem key={0} route="/wallet" label="Wallet" handleClose={handleClose} />,
							<StyledMenuItem key={1} route={`/${user.username}/collections`} label="Collections" handleClose={handleClose} />,
							<StyledMenuItem key={2} onClick={() => logout()} label="Logout" handleClose={handleClose} />,
						]
					) : (
						<StyledMenuItem route="/login" label="Login" handleClose={handleClose} />
					)}
				</MenuList>
				{!!user && [
					<Box
						key={0}
						sx={{
							marginBottom: ".5rem",
							fontSize: "1rem",
							color: "#807f82",
						}}
					>
						My Games
					</Box>,
					<a key={1} href="https://supremacy.game">
						<Box
							component="img"
							sx={{
								width: "100%",
							}}
							src={SupremacyLogo}
							alt="Supremacy Logo"
						/>
					</a>,
				]}
			</Menu>
			<LoadingButton
				onClick={handleClick}
				sx={{
					position: "relative",
					height: "3.3rem",
					width: "3.3rem",
					minWidth: "auto",
					padding: 0,
					borderRadius: "50%",
					cursor: "pointer",
					backgroundColor: "transparent",
					border: "none",
					"&:hover": {
						"& > *:nth-of-type(1)": {
							transform: "rotate(30deg) translate(-3px, 0)",
						},
						"& > *:nth-of-type(2)": {},
						"& > *:nth-of-type(3)": {
							transform: "rotate(30deg) translate(3px, 0)",
						},
					},
					"&:active": {
						"& > *:nth-of-type(1)": {
							transform: "rotate(30deg) translate(1px, 0)",
						},
						"& > *:nth-of-type(2)": {},
						"& > *:nth-of-type(3)": {
							transform: "rotate(30deg) translate(-1px, 0)",
						},
					},
				}}
			>
				<Box
					component="span"
					sx={(theme) => ({
						position: "absolute",
						top: ".5rem",
						left: ".5rem",
						height: "2rem",
						width: ".2rem",
						transform: "rotate(30deg)",
						transition: "transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
						backgroundColor: theme.palette.common.white,
					})}
				/>
				<Box
					component="span"
					sx={(theme) => ({
						position: "absolute",
						top: ".5rem",
						left: "1.5rem",
						height: "2rem",
						width: ".2rem",
						transform: "rotate(30deg)",
						transition: "transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
						backgroundColor: theme.palette.common.white,
					})}
				/>
				<Box
					component="span"
					sx={(theme) => ({
						position: "absolute",
						top: ".5rem",
						left: "2.5rem",
						height: "2rem",
						width: ".2rem",
						transform: "rotate(30deg)",
						transition: "transform .2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
						backgroundColor: theme.palette.common.white,
					})}
				/>
			</LoadingButton>
		</>
	)
}

interface StyledMenuItemProps extends Omit<MenuItemProps, "children"> {
	route?: string
	label: string
	handleClose: () => void
}

const StyledMenuItem: React.FC<StyledMenuItemProps> = ({ onClick, route, label, handleClose, sx, ...props }) => {
	const location = useLocation()
	const history = useHistory()
	const theme = useTheme()

	return (
		<MenuItem
			onClick={(e) => {
				if (onClick) onClick(e)
				if (route) history.push(route)
				handleClose()
			}}
			sx={{
				padding: ".5rem 0",
				fontSize: "1.6rem",
				lineHeight: 1,
				color: location.pathname === route ? theme.palette.secondary.main : theme.palette.primary.main,
				...sx,
			}}
			{...props}
		>
			<Box
				component="span"
				sx={{
					marginRight: ".5rem",
				}}
			>
				&#62;
			</Box>
			{label}
		</MenuItem>
	)
}
