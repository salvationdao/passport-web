import { LoadingButton } from "@mui/lab"
import { Box, BoxProps, SxProps, Theme } from "@mui/material"
import React from "react"
import { Link } from "react-router-dom"
import { XSYNLogoImagePath } from "../../assets"
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

// const RenderFaction = (size: string) => {
// 	const user = useUser()
// 	if (user?.faction) {
// 		return (
// 			<Box
// 				sx={{
// 					height: size,
// 					width: size,
// 					marginRight: ".5rem",
// 					flexShrink: 0,
// 					backgroundImage: `url(${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/files/${user.faction.logo_blob_id})`,
// 					backgroundRepeat: "no-repeat",
// 					backgroundPosition: "center",
// 					backgroundSize: "contain",
// 					backgroundColor: user.faction.theme.primary,
// 					borderRadius: "50%",
// 					border: `${user.faction.theme.primary} 1px solid`,
// 				}}
// 			/>
// 		)
// 	}
// }

interface MenuButtonProps {
	sx?: SxProps<Theme>
}

const MenuButton: React.FC<MenuButtonProps> = ({ sx }) => {
	const { setSidebarOpen } = useSidebarState()

	return (
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
	)
}
