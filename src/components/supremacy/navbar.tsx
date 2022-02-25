import TelegramIcon from "@mui/icons-material/Telegram"
import TwitterIcon from "@mui/icons-material/Twitter"
import { Fade, Grow, Modal, Slide, Stack, useMediaQuery } from "@mui/material"
import { Box, styled, SxProps } from "@mui/system"
import React, { useEffect, useState } from "react"
import Logo from "../../assets/images/supremacy-white.svg"
import { IMAGE_FOLDER, NAVBAR_HEIGHT } from "../../pages/sale/salePage"
import { colors } from "../../theme"
import { HamburgerNav } from "./hamburgerNav"
import { TOKEN_SALE_ENDPOINT } from "../../config"

const LogoLink = styled("a")({
	"& img": {
		maxWidth: "16rem",
		"@media (max-width: 1500px)": {
			maxWidth: "15rem",
		},
		"@media (max-width: 1200px) and (min-width: 1000px)": {
			maxWidth: "12rem",
		},
		"@media (max-width: 350px)": {
			maxWidth: "12rem",
		},
	},
})

interface NavLinkProps {
	label?: string
	href?: string
	onClick?: () => void
	newTab?: boolean
}

function NavLink(props: NavLinkProps) {
	return (
		<Box
			sx={{
				"& a": {
					fontSize: "1.5vmin",
					fontFamily: "Nostromo Regular Black",
					color: props.label?.includes("sale") ? colors.gold : colors.white,
					textDecoration: "none",
					textTransform: "uppercase",
					whiteSpace: "nowrap",
					cursor: "pointer",
					":hover": {
						color: colors.neonBlue,
					},
					"@media (max-width:1500px)": {
						fontSize: ".7rem",
					},
				},
			}}
			onClick={props.onClick}
		>
			{props.href && (
				<a href={props.href} target={props.newTab ? "_blank" : "_self"} rel="noreferrer">
					{props.label}
				</a>
			)}
		</Box>
	)
}

const MobileNav = styled("div")({
	fontSize: "1.5rem",
	fontFamily: "Nostromo Regular Black, sans serif",
	color: "white",
	textDecoration: "none",
	textTransform: "uppercase",
	whiteSpace: "nowrap",
	width: "100%",
	cursor: "pointer",
	margin: 0,
	"@media (max-height:600px)": {
		fontSize: "6vmin",
	},
	"&>a": {
		color: colors.white,
		textDecoration: "none",
		width: "100%",
		display: "inline-block",
	},
	"&:hover": {
		color: colors.neonBlue,
	},
	"&:focus": {
		boxShadow: "none",
	},
	"&.Mui-selected": {
		color: colors.neonBlue,
	},
})

function MobileNavItem(props: { label: string; href: string; handleClick: () => void; newTab?: boolean }) {
	return (
		<MobileNav sx={{ "& a": { color: props.label?.includes("sale") ? colors.gold : colors.white } }}>
			<a href={props.href} target={props.newTab ? "_blank" : "_self"} rel="noreferrer">
				{props.label}
			</a>
		</MobileNav>
	)
}

export const SupremacyNavbar: React.FC<{ sx?: SxProps; loading: boolean }> = (props: { sx?: SxProps; loading: boolean }) => {
	// MobileNav
	const [open, setOpen] = useState<boolean>(false)
	const matches = useMediaQuery("(max-width:1000px)")
	const [show, setShow] = useState<boolean>(true)

	useEffect(() => {
		if (matches) setShow(false)
	}, [matches])

	const navbarControl = () => {
		if (window.scrollY) {
			setShow(true)
		} else {
			setShow(false)
		}
	}

	useEffect(() => {
		window.document.getElementById("sup-navbar")?.addEventListener("mouseover", () => setShow(true))
		window.addEventListener("scroll", navbarControl)
		return () => window.removeEventListener("scroll", navbarControl)
	}, [])

	const navbarPaths: { label: string; path: string; newTab?: boolean }[] = [
		{
			label: "token sale",
			path: "/",
		},
		{
			label: "utility token",
			path: "https://supremacy.game/utility-token",
		},
		{
			label: "Whitepaper",
			path: "https://supremacy.game/whitepaper",
			newTab: true,
		},
		{
			label: "NFT",
			path: "https://supremacy.game/nft",
		},
		{
			label: "Rewards",
			path: "https://supremacy.game/rewards",
		},
		{
			label: "News",
			path: "https://supremacy.game/news",
		},
		{
			label: "FAQ",
			path: "https://supremacy.game/faq",
		},

		{
			label: "Media",
			path: "https://supremacy.game/media",
		},
	]

	const handleClose = () => {
		setOpen(false)
	}
	const handleToggle = () => {
		setOpen(!open)
	}

	const renderSocialLinks = () => (
		<>
			<a href="https://discord.com/invite/supremacygame" target="_blank" rel="noreferrer">
				<Box component="img" src={IMAGE_FOLDER + "/icons/discord.svg"} alt="discord" />
			</a>
			<a href="https://t.me/SupremacyMeta" target="_blank" rel="noreferrer">
				<TelegramIcon />
			</a>

			<a href="https://twitter.com/SupremacyMeta" target="_blank" rel="noreferrer">
				<TwitterIcon />
			</a>
		</>
	)

	return (
		<Box
			component="header"
			id="sup-navbar"
			sx={{
				width: "100vw",
				minHeight: "5rem",
				position: "fixed",
				top: 0,
				zIndex: 3333,
			}}
		>
			{matches && (
				<Box
					sx={{
						zIndex: 3333,
						position: "fixed",
						top: 0,
						left: 0,
					}}
				>
					<Box
						sx={{
							background: open ? colors.black2 : "unset",
							height: NAVBAR_HEIGHT,
							width: "100vw",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							p: "1em",
						}}
					>
						<LogoLink
							href="https://supremacy.game/home"
							onClick={handleClose}
							sx={{
								zIndex: open ? 3333 : 1,
								opacity: open ? 1 : 0,
							}}
						>
							<img src={Logo} alt="Supremacy Metaverse Game Logo" />
						</LogoLink>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								height: NAVBAR_HEIGHT,
								position: "fixed",
								zIndex: open ? 3333 : 1,
								top: 0,
								right: 0,
								p: "2em 1em",
								"@media (max-width:375px)": {
									p: "2em 0",
								},
							}}
						>
							<HamburgerNav active={open} showNav={handleToggle} />
						</Box>
					</Box>
				</Box>
			)}
			<Fade in={show} timeout={400}>
				<Box
					sx={{
						position: "fixed",
						top: 0,

						background: colors.black2,
						width: "100%",
						height: NAVBAR_HEIGHT,
						margin: "0 auto",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: open ? 2222 : 10,
						...props.sx,
					}}
				>
					<Slide direction="down" in={show} timeout={400}>
						<Box
							sx={{
								padding: "2em",
								maxWidth: "2560px",
								width: "100%",
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<Modal
								open={open}
								onClose={handleClose}
								BackdropProps={{
									style: {
										height: "100%",
										backgroundColor: "rgba(0,0,0,0.9)",
									},
								}}
								sx={{
									overflowY: "scroll",
									overflowX: "hidden",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									"@media (max-height:800px)": {
										p: 0,
										justifyContent: "flex-start",
									},

									"@media (min-aspect-ratio:17/10)": {
										overflow: "scroll",
									},
								}}
							>
								<Box
									sx={{
										pt: `${NAVBAR_HEIGHT}px`,
										background: colors.black2,
										minHeight: "100vh",
										"&:focus": {
											boxShadow: "none",
										},
									}}
								>
									<Grow in={open}>
										<Box
											component="nav"
											sx={{
												overflowY: "scroll",
												overflowX: "hidden",
												display: "flex",
												flexDirection: "column",
												justifyContent: "space-around",
												gap: "1em",
												backgroundColor: colors.black2,
												height: "90%",
											}}
										>
											<Stack
												sx={{
													gap: "5%",
													px: "2em",
													pt: "2em",
													height: "90%",
													width: "60vw",
													maxWidth: "400px",
													"@media (max-width:600px)": {
														borderTop: `1px groove ${colors.neonBlue}`,
														maxWidth: "unset",
														width: "100vw",
													},
													"@media (orientation: landscape)": {
														gap: "1em",
														height: "fit-content",
													},
												}}
											>
												{navbarPaths.map((item) => (
													<MobileNavItem
														key={item.label}
														href={item.path}
														label={item.label}
														handleClick={() => {
															handleClose()
														}}
														newTab={item.newTab}
													/>
												))}
											</Stack>
											<Box
												sx={{
													display: "flex",
													justifyContent: "center",
													alignItems: "center",
													width: "100%",
													py: "1em",
													borderTop: "2px solid",
													borderBottom: 0,
													gap: "2em",
													borderImage: `linear-gradient(90deg, #00000000 0%, ${colors.neonBlue} 50%, #00000000 100%) 1`,
													"& svg, & img": {
														height: "2rem",
														width: "2rem",
													},
													"& > *": {
														color: colors.white,
														cursor: "pointer",
														"&:not(:last-child)": {
															marginRight: ".6rem",
														},
													},
												}}
											>
												{renderSocialLinks()}
											</Box>
										</Box>
									</Grow>
								</Box>
							</Modal>
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									width: "100%",
									"@media (max-width: 1000px)": {
										justifyContent: "center",
									},
								}}
							>
								<LogoLink
									href="https://supremacy.game/home"
									onClick={handleClose}
									sx={{
										zIndex: open ? 3333 : 1,
										opacity: open ? 0 : 1,
									}}
								>
									<img src={Logo} alt="Supremacy Metaverse Game" />
								</LogoLink>
							</Box>
							<Box
								sx={{
									height: "1rem",
								}}
							/>
							<Box
								component="nav"
								sx={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									"@media (max-width: 1000px)": {
										flexDirection: "column",
										alignItems: "start",
									},
								}}
							>
								<Box
									sx={{
										display: "flex",
										gap: "4vmin",
										alignItems: "center",
										marginRight: "10rem",
										"@media (max-width: 1800px)": {
											gap: "3vmin",
											marginRight: "5vmin",
										},
										"@media (max-width:1200px)": {
											gap: "2vmin",
										},

										"@media (max-width: 1000px)": {
											display: "none",
										},
									}}
								>
									{navbarPaths.map((item) => (
										<NavLink key={item.label} label={item.label} href={item.path} newTab={item.newTab} />
									))}
								</Box>
								<Box
									sx={{
										display: "inline-flex",
										alignItems: "center",
										gap: "2em",
										"@media (max-width: 1200px)": {
											gap: "1em",
										},
										"@media (max-width: 1000px)": {
											display: "none",
										},
										"& svg, & img": {
											height: "2rem",
											width: "2rem",
											"@media (max-width: 1300px)": {
												gap: "1em",
												height: "1.5rem",
												width: "1.5rem",
											},
										},

										"& > *": {
											cursor: "pointer",
										},

										"& > a": {
											color: colors.white,
											display: "inline-flex",
											alignItems: "center",
										},
									}}
								>
									{renderSocialLinks()}
								</Box>
							</Box>
						</Box>
					</Slide>
				</Box>
			</Fade>
		</Box>
	)
}
