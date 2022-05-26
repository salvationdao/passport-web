import { useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"
import { Loading } from "../components/loading"
import { API_ENDPOINT_HOSTNAME } from "../config"
import { useSnackbar } from "../containers/snackbar"
import { UserAsset } from "../types/purchased_item"

export const AssetRedirectPage = () => {
	const { asset_hash } = useParams<{ asset_hash: string }>()
	const history = useHistory()
	const { displayMessage } = useSnackbar()

	useEffect(() => {
		;(async () => {
			try {
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/asset/${asset_hash}`)

				if (!resp.ok || resp.status !== 200) throw new Error("Something went wrong while fetching asset data.")
				const json = (await resp.json()) as UserAsset
				history.push(`/profile/${json.owner_id}/asset/${json.hash}`)
			} catch (e) {
				if (typeof e === "string") displayMessage(e, "error")
				else if (e instanceof Error) displayMessage(e.message, "error")
			}
		})()
	}, [history, asset_hash, displayMessage])

	return <Loading text="Redirecting you to the asset..." />
}
