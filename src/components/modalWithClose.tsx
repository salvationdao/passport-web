import { Box, Fade, IconButton, Modal, Stack } from "@mui/material"
import React, { useState } from "react"
import { colors } from "../theme"

export interface IModalWithCloseProps {
	cb?: () => void
}

export const ModalWithClose: React.FC<IModalWithCloseProps> = ({ children, cb }) => {
	const [open, setOpen] = useState(true)

	const handleClose = () => {
		cb && cb()
		setOpen(false)
	}

	return (
		<Modal
			open={open}
			onBackdropClick={handleClose}
			closeAfterTransition
			sx={{
				"&:focus": {
					border: 0,
					outline: "none",
				},
			}}
		>
			<Fade in={open} timeout={500}>
				<Stack
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%,-50%)",
						gap: "1rem",
						"&:focus-visible": {
							outline: "none",
						},
					}}
				>
					<IconButton
						sx={{
							alignSelf: "flex-end",
							width: "2rem",
							height: "2rem",
						}}
						onClick={handleClose}
					>
						<Box
							sx={{
								display: "block",
								position: "absolute",
								top: "12px",
								right: "5px",
								transform: "rotate(45deg)",
								"&::after": {
									content: '""',
									display: "block",
									position: "absolute",
									right: 0,
									top: 0,
									transform: "rotate(90deg)",
								},

								"&, &::after": {
									position: "absolute",
									width: "20px",
									height: "4px",
									background: colors.white,
								},
							}}
						/>
					</IconButton>
					{children}
				</Stack>
			</Fade>
		</Modal>
	)
}
