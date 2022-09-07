import { useEffect } from "react"
import { useAuth } from "../containers/auth"
import { useSnackbar } from "../containers/snackbar"
import { Loading } from "./loading"

export const ExternalLogout = () => {
	const { logout } = useAuth()
	const { displayMessage } = useSnackbar()

	useEffect(() => {
		;(async () => {
			try {
				await logout()
				window.close()
			} catch (err: any) {
				console.error(err)
				displayMessage(err.message)
			}
		})()
	}, [logout, displayMessage])

	return <Loading />
}
