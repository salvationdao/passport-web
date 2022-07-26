import { Box, CircularProgress, IconButton, IconButtonProps, Typography } from "@mui/material"
import React from "react"
import { middleTruncate } from "../../../../helpers"
import useHover from "../../../../hooks/useHover"
import { colors } from "../../../../theme"

interface ConnectionButtonProps extends Omit<IconButtonProps, "children"> {
	icon: React.ElementType
	value?: string
	loading?: boolean
	disabled?: boolean
	handleClick?: any
	connected?: boolean
	small?: boolean
}

export const ConnectionButton = ({ icon, value, loading, disabled, sx, handleClick, connected, small, ...props }: ConnectionButtonProps) => {
	const [hoverRef, isHovered] = useHover<HTMLButtonElement>()

	let greyBorder = disabled || connected

	return (
		<IconButton
			ref={hoverRef}
			onClick={handleClick}
			sx={{
				flex: "1",
				maxWidth: small ? "8rem" : "unset",
				color: colors.white,
				width: "max-content",
				overflowX: "hidden",
				position: "relative",
				display: "flex",
				flexDirection: small ? "column" : "row",
				alignItems: "center",
				justifyContent: "center",
				padding: "1rem",
				borderRadius: "15px",
				border: `2px solid ${greyBorder ? colors.darkerGrey : small ? colors.skyBlue : colors.gold}`,
				"&>svg": {
					height: small ? "2rem" : "3rem",
					mr: small ? "unset" : "5px",
				},
				"&:hover": {
					border: `2px solid ${small ? colors.skyBlue : colors.gold}`,
				},
				...sx,
			}}
			disabled={disabled || !!loading}
			{...props}
		>
			{loading && (
				<Box
					sx={{
						position: "absolute",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						backgroundColor: "rgba(0, 0, 0, .6)",
					}}
				>
					<CircularProgress />
				</Box>
			)}
			<Box
				component={icon}
				sx={{
					marginBottom: ".5rem",
					filter: disabled ? "grayscale(1)" : "unset",
				}}
			/>
			<Typography
				component="span"
				variant="body1"
				sx={{
					color: connected ? colors.darkGrey : colors.white,
					transition: "all .2s",
					"&:hover": {
						color: colors.white,
					},
				}}
			>
				{value ? middleTruncate(value) : isHovered && connected ? "Disconnect" : connected ? "Connected" : props.title}
			</Typography>
		</IconButton>
	)
}
