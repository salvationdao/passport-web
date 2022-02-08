import { LoadingButton, LoadingButtonProps } from "@mui/lab"
import { useTheme } from "@mui/material"
import { colors } from "../theme"

type ButtonSize = "small" | "medium" | "large"

export interface FancyButtonProps extends LoadingButtonProps {
	fancy?: boolean
	borderColor?: string
	filled?: boolean
	size?: ButtonSize
}

export const FancyButton: React.FC<FancyButtonProps> = ({ fancy, borderColor, filled, size = "medium", sx, children, ...props }) => {
	const theme = useTheme()

	const mainColor = borderColor || theme.palette.primary.main

	const sizeStyles: { [key in ButtonSize]: any } = {
		small: {
			padding: ".3rem",
			fontSize: ".7rem",
		},
		medium: {
			padding: ".5rem",
		},
		large: {
			padding: ".8rem",
			fontSize: "1.3rem",
		},
	}

	return (
		<LoadingButton
			sx={{
				boxSizing: "content-box",
				position: "relative",
				borderRadius: 0,
				border: `2px solid ${mainColor}`,
				textTransform: "uppercase",
				background: filled ? borderColor : "transparent",
				color: filled ? theme.palette.background.default : "inherit",
				"&:disabled": {
					color: colors.darkGrey,
					border: `2px solid ${colors.darkGrey}`,
					cursor: "not-allowed",
					"&:hover": {
						boxShadow: "none",
						"&::before": {
							display: "none",
						},
						"&::after": {
							display: "none",
						},
					},
				},
				"&:hover": {
					color: "inherit",
					boxShadow: `inset 0px 0px 10px ${mainColor},0px 0px 10px ${mainColor}`,
					"&::before": {
						opacity: 0.4,
					},
					"&::after": {
						opacity: 0.2,
						transitionDelay: ".1s",
					},
				},
				"&::before": fancy
					? {
							content: "''",
							position: "absolute",
							top: "3px",
							left: "3px",
							width: "100%",
							height: "100%",
							border: `2px solid ${mainColor}`,
							opacity: 0,
							transition: "opacity .3s ease-in",
							pointerEvents: "none",
					  }
					: null,
				"&::after": fancy
					? {
							content: "''",
							position: "absolute",
							top: "8px",
							left: "8px",
							width: "100%",
							height: "100%",
							border: `2px solid ${mainColor}`,
							opacity: 0,
							transition: "opacity .3s ease-in",
							pointerEvents: "none",
					  }
					: null,
				...sizeStyles[size],
				...sx,
			}}
			{...props}
		>
			{children}
		</LoadingButton>
	)
}
