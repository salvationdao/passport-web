// @ts-nocheck
import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton"
import { Box, styled, SxProps, Theme } from "@mui/system"
import React from "react"
import { colors } from "../../theme"
import { ClipThing } from "./clipThing"

const Base = styled(LoadingButton)({
	borderRadius: 0,
	fontFamily: "Nostromo Regular Black, sans serif",
	backgroundColor: colors.darkNeonBlue,
	color: "white",
	textTransform: "uppercase",
	"&:hover": {
		backgroundColor: colors.darkerNeonBlue,
	},
	"&:focus": {
		boxShadow: "none",
	},
	"&:active": {
		opacity: 0.75,
	},
	"& .MuiLoadingButton-loadingIndicator": {
		color: colors.white,
	},
})

const Triangle = styled("div")({
	position: "absolute",
	bottom: "3px",
	right: "3px",
	clipPath: "polygon(100% 0, 0% 100%, 100% 100%)",
	height: "10px",
	width: "10px",
	backgroundColor: colors.neonBlue,
})

interface FancyButtonProps extends LoadingButtonProps {
	borderColor?: string
	backgroundColor?: string
	excludeCaret?: boolean
	sx?: SxProps<Theme>
	clipSx?: SxProps<Theme>
}

export const SupFancyButton: React.FC<FancyButtonProps> = ({
	children,
	borderColor,
	backgroundColor,
	clipSx,
	sx,
	fullWidth,
	excludeCaret = false,
	disabled,
	...props
}) => {
	const renderBase = () => (
		<Base
			sx={{
				...sx,
				backgroundColor,
			}}
			fullWidth
			{...props}
		>
			{children}
			{!excludeCaret && (
				<Triangle
					sx={{
						backgroundColor: borderColor,
					}}
				/>
			)}
		</Base>
	)

	return (
		<ClipThing
			clipSize=".75rem"
			sx={{
				display: "inline-block",
				width: fullWidth ? "100%" : "auto",
				...clipSx,
			}}
			border={{
				isFancy: true,
				borderColor: borderColor,
			}}
			innerSx={{
				backgroundColor,
			}}
		>
			{disabled && (
				<Box
					sx={{
						position: "absolute",
						top: 0,
						bottom: 0,
						left: 0,
						right: 0,
						backgroundColor: colors.darkestNeonBlue,
						opacity: 0.7,
						zIndex: 99,
					}}
				></Box>
			)}

			{renderBase()}
		</ClipThing>
	)
}
