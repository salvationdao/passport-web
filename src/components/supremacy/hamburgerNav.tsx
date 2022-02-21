import { Box, SxProps } from "@mui/system"
import React from "react"
import { colors } from "../../theme"

interface Props {
	showNav: () => void
	active: boolean
	sx?: SxProps
}

export const HamburgerNav = (props: Props) => {
	const { showNav, active } = props

	return (
		<Box
			sx={{
				display: "inline-block",
				cursor: "pointer",
				textTransform: "none",
				backgroundColor: "transparent",
				border: 0,
				margin: 0,
				overflow: "hidden",
				"@media (min-width:1000px)": {
					display: "none",
				},
				WebkitTapHighlightColor: "transparent",
				...props.sx,
			}}
			onClick={showNav}
		>
			<Box
				sx={{
					width: "40px",
					height: "28px",
					position: "relative",
					display: "inline-block",
				}}
			>
				<Box
					sx={{
						display: "block",
						top: "50%",
						marginTop: "-2px",
						backgroundColor: active ? "transparent" : colors.white,
						transitionTimingFunction: "ease-in",
						transitionDelay: active ? "0s" : "unset",
						"&, &::before, &::after": {
							width: "25px",
							height: "3px",
							position: "absolute",
							transition: "background-color 0.125s 0.175s ease-in",
						},
						"&::before, &::after": {
							background: colors.white,
							content: '""',
							display: "block",
						},
						"&::before": {
							top: active ? "-80px" : "-8px",
							left: active ? "-80px" : 0,
							transform: active ? "translate3d(80px, 80px, 0) rotate(45deg)" : "unset",
							transition: active
								? "left 0.125s ease-out, top 0.05s 0.125s linear, transform 0.125s 0.175s cubic-bezier(0.075, 0.82, 0.165, 1)"
								: "transform 0.125s cubic-bezier(0.6, 0.04, 0.98, 0.335), top 0.05s 0.125s linear, left 0.125s 0.175s ease-in",
						},
						"&::after": {
							top: active ? "-80px" : "8px",
							right: active ? "-80px" : 0,
							transform: active ? "translate3d(-80px, 80px, 0) rotate(-45deg)" : "unset",
							transition: active
								? "right 0.125s ease-out, top 0.05s 0.125s linear, transform 0.125s 0.175s cubic-bezier(0.075, 0.82, 0.165, 1)"
								: "transform 0.125s cubic-bezier(0.6, 0.04, 0.98, 0.335), top 0.05s 0.125s linear, right 0.125s 0.175s ease-in",
						},
					}}
				/>
			</Box>
		</Box>
	)
}
