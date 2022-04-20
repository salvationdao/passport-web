import { Box, Snackbar } from "@mui/material"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../containers/auth"
import HubKey from "../keys"
import { BlockConfirmationSnackbar } from "./blockConfirmationAlert"
import useCommands from "../containers/useCommands"

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
	const { user } = useAuth()

	const [txConfirms, setTxConfirms] = useState<ChainConfirmations[]>([])
	const [filterArr, setFilterArr] = useState<string[]>([])
	const [results, setResults] = useState<ChainConfirmations[]>([])

	//put the transaction id in a seperate array that will be filtered out in the above useEffect
	const handleFilter = useCallback(
		(txID: string) => {
			if (filterArr.includes(txID)) return
			setFilterArr([...filterArr, txID])
		},
		[filterArr],
	)

	//compare the original array to the filtered array and if the id is in the transaction array then filter it out.
	//if the confirmation has 6+ confirmation blocks, then set a time out to make the alert dissapear
	useEffect(() => {
		let resultArr: ChainConfirmations[]
		resultArr = txConfirms.filter((item) => !filterArr.includes(item.tx))
		resultArr.map((item) => {
			if (item.confirmationAmount >= 6) {
				return setTimeout(() => {
					handleFilter(item.tx)
				}, 4000)
			} else {
				return null
			}
		})

		setResults(resultArr)
	}, [txConfirms, filterArr, handleFilter])

	return (
		<Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={true} sx={results.length > 0 ? { display: "block" } : { display: "none" }}>
			<Box sx={{ display: "flex", flexDirection: "column" }}>
				{results.map((x) => {
					return <BlockConfirmationSnackbar key={x.tx} currentConfirmation={x} handleFilter={handleFilter} />
				})}
			</Box>
		</Snackbar>
	)
}
