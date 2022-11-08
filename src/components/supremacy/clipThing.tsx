import { Theme } from "@emotion/react"
import { Box, SxProps } from "@mui/material"
import React, { forwardRef } from "react"
import { colors } from "../../theme"

interface ClipThingProps {
	children: JSX.Element | JSX.Element[]
	clipSize?: string
	border?:
		| {
				borderThickness?: string
				borderColor?: string
				isFancy?: boolean
		  }
		| boolean
	sx?: SxProps<Theme>
	innerSx?: SxProps<Theme>
	fillHeight?: boolean
}

export const ClipThing = forwardRef(({ children, clipSize = "1rem", border, innerSx, sx, fillHeight }: ClipThingProps, ref) => {
	const clipStyles: any = {
		height: fillHeight ? "100%" : "fit-content",
		lineHeight: 1,
		clipPath: `polygon(0 0, calc(100% - ${clipSize}) 0%, 100% ${clipSize}, 100% 100%, ${clipSize} 100%, 0% calc(100% - ${clipSize}))`,
	}
	const borderStyles: any = {
		borderTopLeftRadius: "2px",
		borderBottomRightRadius: "2px",
	}

	if (border) {
		if (typeof border == "boolean") {
			// Set default styles
			borderStyles.padding = "1px"
			borderStyles.backgroundColor = colors.supremacy.neonBlue
		} else {
			borderStyles.padding = border.borderThickness || "1px"
			if (border.isFancy) {
				borderStyles.background = `transparent linear-gradient(59deg, ${
					border.borderColor || colors.supremacy.neonBlue
				} 0%, rgba(0, 0, 0, 0) 51%, ${border.borderColor || colors.supremacy.neonBlue} 100%) 0% 0% no-repeat padding-box`
			} else {
				borderStyles.backgroundColor = border.borderColor || colors.supremacy.neonBlue
			}
		}
	}
	return (
		<Box
			sx={{
				...borderStyles,
				...clipStyles,
				...sx,
			}}
		>
			<Box
				sx={{
					...clipStyles,
					...innerSx,
				}}
			>
				{children}
			</Box>
		</Box>
	)
})
