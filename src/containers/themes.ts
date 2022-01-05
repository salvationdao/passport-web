import { useState } from "react"
import { Theme } from "@mui/material/styles"
import { createContainer } from "unstated-next"
import themes from "../theme"

const useTheme = (initialState: number = 0) => {
	let [currentTheme, setTheme] = useState<Theme>(themes[initialState])
	return {
		currentTheme,
		setTheme: (themeIndex: number) => {
			setTheme(themes[themeIndex])
		},
	}
}

export const Themes = createContainer(useTheme)
