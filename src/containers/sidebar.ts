import { useState } from "react"
import { createContainer } from "unstated-next"

const SidebarStateContainer = createContainer(() => {
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const [snackbarOpen, setSnackbarOpen] = useState(false)

	return {
		sidebarOpen,
		setSidebarOpen,
		snackbarOpen,
		setSnackbarOpen,
	}
})
export const SidebarStateProvider = SidebarStateContainer.Provider
export const useSidebarState = SidebarStateContainer.useContainer
