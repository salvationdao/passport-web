import { useCallback, useEffect, useState } from "react"
import { createContainer } from "unstated-next"
import HubKey from "../keys"
import { NilUUID } from "../types/auth"
import { QueuedWarMachine } from "../types/types"
import { useAuth } from "./auth"
import { useWebsocket } from "./socket"

export const AssetContainer = createContainer(() => {
	const { factionID } = useAuth()
	const { subscribe } = useWebsocket()
	const [queuingList, setQueuingList] = useState<QueuedWarMachine[]>([])
	const [queuingContractReward, setQueuingContractReward] = useState<string>("0")
	// Effect: get/set asset via assetHash
	useEffect(() => {
		if (!factionID || factionID === NilUUID) return
		return subscribe<QueuedWarMachine[]>(HubKey.UserWarMachineQueuePositionSubscribe, (payload) => {
			if (!payload) return
			setQueuingList(payload)
		})
	}, [factionID, subscribe])

	useEffect(() => {
		if (!factionID || factionID === NilUUID) return
		return subscribe<string>(HubKey.AssetQueueContractReward, (payload) => {
			if (!payload) return
			setQueuingContractReward(payload)
		})
	}, [factionID, subscribe])

	const queuedWarMachine = useCallback((assetHash: string) => queuingList.find((q) => q.warMachineMetadata.assetHash === assetHash), [queuingList])
	return {
		queuedWarMachine,
		queuingContractReward,
	}
})

export const AssetProvider = AssetContainer.Provider
export const useAsset = AssetContainer.useContainer
