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
	errorRed: "#d32f2f",
	neonPink: "#f72485",
	darkNeonPink: "#c31c69",
	darkerNeonPink: "#90144d",
	skyBlue: "#4CC9F0",
	darkSkyBlue: "#3b9ebd",
	darkerSkyBlue: "#3388a3",
	lightNavyBlue: "#211E33",
	navyBlue: "#402F98",
	darkNavyBlue: "#0a061f",
	darkerNavyBlue: "#030208",
	purple: "#351EBA",
	white: "#fff",
	black: "#000",
	lightGrey: "#f7f7f7",
	darkGrey: "#c3c3c3",
	metamaskOrange: "#F6851B",
	facebookBlue: "#3F558C",
	twitchPurple: "#8551F6",
	twitterBlue: "#1DA1F2",
	discordGrey: "#2c2f33",
	supremacyGold: "#F3D977",
	rarity: {
		common: "#c3c3c3",
		rare: "#4d90fa",
		legendary: "#fabd4d",
	},
	supremacy: {
		text: "#FFFFFF",
		offWhite: "#F8F8F8",
		red: "#C24242",
		green: "#30B07D",
		yellow: "#FFE200",

		neonBlue: "#2BE9FD",
		darkNeonBlue: "#176969",
		darkerNeonBlue: "#073339",
		darkestNeonBlue: "#050c12",
		darkNavy: "#101019",

		white: "#FFFFFF",
		grey: "#89898d",
		darkGrey: "#494949",
		darkerGrey: "#383838",
		darkGreyBlue: "#101019",
		darkNavyBlue: "#070719",
	},
}

const fallbackFonts = [
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
]

export const fonts = {
	bizmoblack: ["bizmoblack", ...fallbackFonts].join(","),
	bizmobold: ["bizmobold", ...fallbackFonts].join(","),
	bizmoextra_bold: ["bizmoextra_bold", ...fallbackFonts].join(","),
	bizmoextra_light: ["bizmoextra_light", ...fallbackFonts].join(","),
	bizmolight: ["bizmolight", ...fallbackFonts].join(","),
	bizmomedium: ["bizmomedium", ...fallbackFonts].join(","),
	bizmosemi_bold: ["bizmosemi_bold", ...fallbackFonts].join(","),
	bizmothin: ["bizmothin", ...fallbackFonts].join(","),
	bizmoregular: ["bizmoregular", ...fallbackFonts].join(","),
	supremacy: {
		sharetech: ["Share Tech", ...fallbackFonts].join(","),
		nostromomedium: ["Nostromo Regular Medium", ...fallbackFonts].join(","),
		nostromoblack: ["Nostromo Regular Black", ...fallbackFonts].join(","),
		nostromobold: ["Nostromo Regular Bold", ...fallbackFonts].join(","),
	},
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
			main: colors.darkNavyBlue,
			contrastText: colors.white,
		},
		success: {
			main: "#44b700",
		},
		error: {
			main: colors.errorRed,
			light: "#ef5350",
			dark: "#c62828",
		},
		background: {
			default: colors.darkerNavyBlue,
			paper: colors.darkNavyBlue,
		},
		text: {
			primary: colors.white,
			secondary: colors.white,
			disabled: colors.darkGrey,
		},
		divider: colors.lightNavyBlue,
		action: {
			active: "rgba(255, 255, 255, 0.54)",
			disabled: colors.lightGrey,
			disabledBackground: colors.darkGrey,
		},
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
		fontFamily: fonts.bizmomedium,
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
			fontFamily: fonts.bizmoregular,
			fontSize: 14,
		},
		subtitle1: {
			fontFamily: fonts.bizmobold,
			fontWeight: 400,
		},
		subtitle2: {
			fontFamily: fonts.bizmosemi_bold,
			fontWeight: 400,
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
					},
				},
				body: {
					backgroundColor: colors.darkerNavyBlue,
				},
				"*, *::after, *::before": {
					":focus": {
						boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 0,
				},
			},
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
					borderRadius: ".5rem",
				},
			},
		},
		MuiInputBase: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-notchedOutline": {
						borderColor: colors.darkGrey,
					},
					"&&::before": {
						borderColor: colors.darkGrey,
					},
					"& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
						display: "none",
						margin: 80,
					},
				},
			},
		},
		MuiFilledInput: {
			styleOverrides: {
				root: {
					borderRadius: ".5rem",
					backgroundColor: colors.lightNavyBlue,
					"&&::before": {
						borderColor: "transparent",
					},
				},
			},
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
