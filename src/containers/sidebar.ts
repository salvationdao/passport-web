import { useState } from "react"
import { createContainer } from "unstated-next"

const SidebarStateContainer = createContainer(() => {
	const [sidebarOpen, setSidebarOpen] = useState(true)
	return {
		sidebarOpen,
		setSidebarOpen,
	}
})
export const SidebarStateProvider = SidebarStateContainer.Provider
export const useSidebarState = SidebarStateContainer.useContainer
