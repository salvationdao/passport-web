import { AlertColor, SnackbarProps } from "@mui/material"
import { useCallback, useState } from "react"
import { createContainer } from "unstated-next"

const SnackbarContainer = createContainer(() => {
	const [message, setMessage] = useState<string>()
	const [snackbarProps, setSnackbarProps] = useState<SnackbarProps>()
	const [alertSeverity, setAlertSeverity] = useState<AlertColor>()

	const displayMessage = useCallback((message: string, type?: AlertColor, options?: Omit<SnackbarProps, "children" | "message" | "onClose">) => {
		setSnackbarProps({
			...options,
		})
		setAlertSeverity(type)
		setMessage(message)
	}, [])

	const resetSnackbar = () => {
		setMessage(undefined)
	}

	return {
		message,
		snackbarProps,
		alertSeverity,
		displayMessage,
		resetSnackbar,
	}
})
export const SnackbarProvider = SnackbarContainer.Provider
export const useSnackbar = SnackbarContainer.useContainer
