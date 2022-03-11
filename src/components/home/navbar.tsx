import { LoadingButton } from "@mui/lab"
import { Avatar, Box, BoxProps, IconButton, IconButtonProps, SxProps, Theme, useMediaQuery } from "@mui/material"
import React, { useState } from "react"
import { Link, useHistory } from "react-router-dom"
import { XSYNLogoImagePath } from "../../assets"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { AuthContainer } from "../../containers"
import { useAuth } from "../../containers/auth"
import { useSidebarState } from "../../containers/sidebar"

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
			<MenuButton />
			<Box
				sx={{
					flex: 1,
				}}
			/>
			<Link to="/">
				<Box
					component="img"
					sx={{
						height: "4rem",
					}}
					src={XSYNLogoImagePath}
					alt="XSYN Logo"
				/>
			</Link>
		</Box>
	)
}

const RenderFaction = (size: string) => {
	const { user } = useAuth()
	if (user?.faction) {
		return (
			<Box
				sx={{
					height: size,
					width: size,
					marginRight: ".5rem",
					flexShrink: 0,
					backgroundImage: `url(${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${user.faction.logo_blob_id})`,
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundSize: "contain",
					backgroundColor: user.faction.theme.primary,
					borderRadius: "50%",
					border: `${user.faction.theme.primary} 1px solid`,
				}}
			/>
		)
	}
}

interface ProfileButtonProps extends Omit<IconButtonProps, "size"> {
	size?: string
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ size = "3rem", sx, onClick, ...props }) => {
	const history = useHistory()
	const { user } = AuthContainer.useContainer()
	const token = localStorage.getItem("token")

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
		if (onClick) onClick(event)
		history.push("/profile")
	}

	if (!user) return null

	return (
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
					transform: "translate3d(-1px, -1px, 0)",
				},
				"&:hover .Avatar-border": {
					transform: "translate3d(1px, 1px, 0)",
				},
				"&:active .Avatar": {
					transform: "translate3d(1px, 1px, 0)",
				},
				"&:active .Avatar-border": {
					transform: "translate3d(-1px, -1px, 0)",
				},
				"&:disabled": {
					"&:hover .Avatar": {
						transform: "translate3d(0, 0, 0)",
					},
					"&:hover .Avatar-border": {
						transform: "translate3d(0, 0, 0)",
					},
					"&:active .Avatar": {
						transform: "translate3d(0, 0, 0)",
					},
					"&:active .Avatar-border": {
						transform: "translate3d(0, 0, 0)",
					},
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
					top: "10%",
					left: "10%",
					display: "block",
					width: "100%",
					height: "100%",
					borderRadius: "50%",
					border: `2px solid ${theme.palette.secondary.main}`,
				})}
			/>
			{!!user && user.faction && !user.avatar_id ? (
				<Avatar
					className="Avatar"
					src={`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${user.faction.logo_blob_id}`}
					sx={{
						height: size,
						width: size,
					}}
				/>
			) : (
				<Avatar
					className="Avatar"
					src={user.avatar_id ? `/api/files/${user.avatar_id}?token=${encodeURIComponent(token || "")}` : undefined}
					sx={{
						height: size,
						width: size,
					}}
				/>
			)}
		</IconButton>
	)
}

interface MenuButtonProps {
	sx?: SxProps<Theme>
}

const MenuButton: React.FC<MenuButtonProps> = ({ sx }) => {
	const { setSidebarOpen } = useSidebarState()
	const mobileScreen = useMediaQuery("(max-width:1024px)")

	return mobileScreen ? (
		<>
			<LoadingButton
				onClick={() => setSidebarOpen((prev) => !prev)}
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
					...sx,
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
	) : null
}
