import { useEffect } from "react"
import { useAuth } from "../containers/auth"
import { useSnackbar } from "../containers/snackbar"
import { Loading } from "./loading"

export const ExternalLogout = () => {
	const { logout, userID } = useAuth()
	const { displayMessage } = useSnackbar()

	useEffect(() => {
		;(async () => {
			try {
				if (userID) await logout()
				window.close()
			} catch (err: any) {
				console.error(err)
				displayMessage(err.message)
			}
		})()
	}, [logout, userID, displayMessage])

	return <Loading />
}
