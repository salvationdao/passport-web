import { useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"
import { Loading } from "../components/loading"
import { API_ENDPOINT_HOSTNAME } from "../config"
import { useSnackbar } from "../containers/snackbar"
import { Asset } from "../types/types"

export const AssetRedirectPage = () => {
	const { token_id } = useParams<{ token_id: string }>()
	const history = useHistory()
	const { displayMessage } = useSnackbar()

	useEffect(() => {
		;(async () => {
			try {
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/asset/${token_id}`)

				if (!resp.ok || resp.status !== 200) throw new Error("Something went wrong while fetching asset data.")
				const json = (await resp.json()) as Asset
				history.push(`/profile/${json.username}/asset/${json.tokenID}`)
			} catch (e) {
				if (typeof e === "string") displayMessage(e, "error")
				else if (e instanceof Error) displayMessage(e.message, "error")
			}
		})()
	}, [history, token_id])

	return <Loading text="Redirecting you to the asset..." />
}
