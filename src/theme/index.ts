import { createTheme } from "@mui/material/styles"
import AvatarDefault from "../assets/images/NinjaSoftwareLogo.svg"

declare module "@mui/material/styles" {
	interface Palette {
		neutral: Palette["primary"]
	}

	interface PaletteOptions {
		neutral: PaletteOptions["primary"]
	}
}

declare module "@mui/material/Button" {
	interface ButtonPropsColorOverrides {
		neutral: true
	}
}


export const colors = {
	neonPink: "#f72485",
	skyBlue: "#4CC9F0",
	navyBlue: "#0a061f",
	darkNavyBlue: "#030208",
	white: "#fff",
	lightGrey: "#f7f7f7",
	darkGrey: "#c3c3c3",
}

const lightTheme = createTheme({
	palette: {
		primary: {
			main: colors.neonPink,
			contrastText: colors.white,
		},
		secondary: {
			main: colors.skyBlue,
			contrastText: colors.white,
		},
		neutral: {
			main: colors.navyBlue,
			contrastText: colors.white,
		},
		success: {
			main: "#44b700",
		},
		error: {
			main: "#d32f2f",
			light: "#ef5350",
			dark: "#c62828"
		},
		background: {
			default: colors.darkNavyBlue,
			paper: colors.navyBlue,
		},
		text: {
			primary: colors.white,
			secondary: colors.white,
			disabled: colors.darkGrey,
		},
		action: {
			active: "rgba(255, 255, 255, 0.54)",
			disabledBackground: colors.darkGrey
		}
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 960,
			lg: 1280,
			xl: 1440,
		},
	},
	typography: {
		fontFamily: [
			"bizmomedium",
			"-apple-system",
			"BlinkMacSystemFont",
			'"Segoe UI"',
			"Roboto",
			'"Helvetica Neue"',
			"Arial",
			"sans-serif",
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
		].join(","),
		fontSize: 14,
		fontWeightLight: 300,
		fontWeightRegular: 400,
		fontWeightMedium: 600,
		h1: {
			fontSize: "2rem",
			fontWeight: 600,
			lineHeight: 1.2,
		},
		h2: {
			fontSize: "1.75rem",
			fontWeight: 600,
			lineHeight: 1.2,
		},
		h3: {
			fontSize: "1.5rem",
			fontWeight: 600,
			lineHeight: 1.2,
		},
		h4: {
			fontSize: "1.25rem",
			fontWeight: 600,
			lineHeight: 1.2,
		},
		h5: {
			fontSize: "1.125rem",
			fontWeight: 600,
			lineHeight: 1.2,
		},
		h6: {
			fontSize: "1.0625rem",
			fontWeight: 600,
			lineHeight: 1.2,
		},
		body1: {
			fontSize: 14,
		},
		button: {
			textTransform: "none",
		},
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				html: {
					"@media (max-width: 1000px)": {
						fontSize: "80%",
					}
				},
				body: {
					backgroundColor: colors.darkNavyBlue,
				},
			}
		},
		MuiCardHeader: {
			defaultProps: {
				titleTypographyProps: { variant: "h6" },
			},
		},
		MuiAvatar: {
			defaultProps: {
				src: AvatarDefault,
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					color: "inherit",
				},
			},
		},
		MuiInputBase: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: colors.darkGrey
					},
					"&&::before": {
						borderColor: colors.darkGrey
					}
				}
			}
		},
		MuiFormLabel: {
			styleOverrides: {
				root: {
					fontWeight: 600,
				},
			},
		},
		MuiTooltip: {
			styleOverrides: {
				tooltip: {
					backgroundColor: "#bfbfbf9c",
					color: "#0F0F0F",
					fontSize: "0.75rem",
					backdropFilter: "blur(4px)",
				},
			},
		},
	},
})

const themes = [lightTheme]

export default themes
