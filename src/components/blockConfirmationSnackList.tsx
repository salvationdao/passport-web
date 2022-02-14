import { Box, Snackbar } from "@mui/material"
import { useEffect, useState } from "react"
import { useAuth } from "../containers/auth"
import { SocketState, useWebsocket } from "../containers/socket"
import HubKey from "../keys"
import { BlockConfirmationSnackbar } from "./blockConfirmationAlert"

export interface ChainConfirmations {
	tx: string
	txID: number
	block: number
	chainID: number
	confirmedAt: string
	createdAt: string
	confirmationAmount: number
}

export const BlockConfirmationSnackList = () => {
	const { state, subscribe } = useWebsocket()
	const { user } = useAuth()

	const [txConfirms, setTxConfirms] = useState<ChainConfirmations[]>([])
	const [filterArr, setFilterArr] = useState<string[]>([])
	const [results, setResults] = useState<ChainConfirmations[]>([])

	useEffect(() => {
		if (state !== SocketState.OPEN || !user) return
		//subscribe to handler
		return subscribe<ChainConfirmations>(
			HubKey.BlockConfirmation,
			(chainConf) => {
				if (!chainConf) return
				setTxConfirms((prev) => {
					//creating new array from previous one to return.
					//if confirmation does not exist, add it onto the end of the array, if it does replace the index with the most up to date version
					const newArr = [...prev]

					const ind = newArr.findIndex((conf) => conf.tx === chainConf.tx)
					if (ind < 0) {
						return [...newArr, chainConf]
					}

					newArr.splice(ind, 1, chainConf)

					return newArr
				})
			},
			{ id: user.id, getInitialData: false },
		)
	}, [user, state])

	//compare the original array to the filtered array and if the id is in the transaction array then filter it out.
	//if the confirmation has 6+ confirmation blocks, then set a time out to make the alert dissapear
	useEffect(() => {
		let resultArr: ChainConfirmations[]
		resultArr = txConfirms.filter((item) => !filterArr.includes(item.tx))
		resultArr.map((item) => {
			if (item.confirmationAmount >= 6) {
				setTimeout(() => {
					handleFilter(item.tx)
				}, 4000)
			}
		})

		setResults(resultArr)
	}, [txConfirms, filterArr])

	//put the transaction id in a seperate array that will be filtered out in the above useEffect
	const handleFilter = (txID: string) => {
		if (filterArr.includes(txID)) return
		setFilterArr([...filterArr, txID])
	}

	return (
		<Snackbar
			anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			open={user && [WebSocket.OPEN].includes(state)}
			sx={user && [WebSocket.OPEN].includes(state) && results.length > 0 ? { display: "block" } : { display: "none" }}
		>
			<Box sx={{ display: "flex", flexDirection: "column" }}>
				{results.map((x) => {
					return <BlockConfirmationSnackbar key={x.tx} currentConfirmation={x} handleFilter={handleFilter} />
				})}
			</Box>
		</Snackbar>
	)
}
