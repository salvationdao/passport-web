import { Box, CircularProgress, IconButton, IconButtonProps, Typography } from "@mui/material"
import React, { useState } from "react"
import { middleTruncate } from "../../../../helpers"
import { colors } from "../../../../theme"

interface ConnectionButtonProps extends Omit<IconButtonProps, "children"> {
	icon: React.ElementType
	value?: string
	loading?: boolean
	disabled?: boolean
	handleClick?: () => Promise<void>
}

export const ConnectionButton = ({ icon, value, loading, disabled, sx, handleClick, ...props }: ConnectionButtonProps) => {
	const [btnLoading, setBtnLoading] = useState(loading)

	const btnClick = async () => {
		if (!handleClick) return
		setBtnLoading(true)
		await handleClick()
		setBtnLoading(false)
	}

	return (
		<IconButton
			onClick={btnClick}
			sx={{
				minWidth: "10rem",
				color: colors.white,
				width: "max-content",
				overflowX: "hidden",
				position: "relative",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "1rem",
				borderRadius: 0,
				border: `2px solid ${disabled ? colors.darkerGrey : colors.skyBlue}`,
				...sx,
			}}
			disabled={disabled || !!loading}
			{...props}
		>
			{!!btnLoading && (
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
			<Typography>{value ? middleTruncate(value) : "Connect"}</Typography>
		</IconButton>
	)
}
