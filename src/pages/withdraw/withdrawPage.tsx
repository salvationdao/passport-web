import { Box, Paper, Typography } from "@mui/material"
// import { BigNumber } from "ethers"
// import { formatUnits } from "ethers/lib/utils"
import React from "react"
import { Navbar } from "../../components/home/navbar"
// import { TransactionResultOverlay } from "../../components/transferStatesOverlay/transactionResultOverlay"
// import { WithdrawSups } from "../../components/withdrawSups"
// import { API_ENDPOINT_HOSTNAME } from "../../config"
// import { useWeb3 } from "../../containers/web3"
// import { AddressDisplay } from "../../helpers/web3"
// import { transferStateType } from "../../types/types"
// import { usePassportCommandsUser } from "../../hooks/usePassport"
// import { useAuth } from "../../containers/auth"

// interface CanEnterResponse {
// 	can_withdraw: boolean
// }

export const WithdrawPage = () => {
	// const { account } = useWeb3()
	// const { user } = useAuth()
	// const { state, send } = usePassportCommandsUser("/commander")
	//
	// const [currentTransferHash, setCurrentTransferHash] = useState<string>("")
	//
	// //TODO: set this transferstate to "none" when withdrawSUPs functionality becomes available
	// const [currentTransferState, setCurrentTransferState] = useState<transferStateType>("unavailable")
	// const [loading, setLoading] = useState<boolean>(false)
	// const [error, setError] = useState<string>("")
	// const [withdrawAmount, setWithdrawAmount] = useState<BigNumber>(BigNumber.from(0))

	// useEffect(() => {
	// 	try {
	// 		;(async () => {
	// 			const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/withdraw/check`)
	// 			const body = (await resp.clone().json()) as CanEnterResponse
	// 			if (body.can_withdraw) {
	// 				setCurrentTransferState("none")
	// 				return
	// 			}
	// 		})()
	// 	} catch (e) {
	// 		console.error(e)
	// 	}
	// }, [])

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
			}}
		>
			<Navbar />
			<Box
				sx={{
					display: "flex",
					flex: 1,
					m: "0 2rem 2rem 2rem",
				}}
			>
				<Paper
					sx={{
						display: "flex",
						flex: 1,
						flexDirection: "column",
						alignItems: "center",
						padding: "1rem",
						overflow: "auto",
						borderRadius: 1.5,
						gap: "1rem",
						justifyContent: "center",
						position: "relative",
					}}
				>
					{/*<TransactionResultOverlay*/}
					{/*	currentTransferState={currentTransferState}*/}
					{/*	setCurrentTransferState={setCurrentTransferState}*/}
					{/*	currentTransferHash={currentTransferHash}*/}
					{/*	confirmationMessage={`Withdrawing ${withdrawAmount ? formatUnits(withdrawAmount) : "NONE"} $SUPS from users: ${*/}
					{/*		user?.username*/}
					{/*	} to wallet address: ${account ? AddressDisplay(account) : null}.`}*/}
					{/*	error={error}*/}
					{/*	loading={loading}*/}
					{/*/>*/}
					<Box
						sx={{
							width: "80%",
							maxWidth: "750px",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<Typography variant={"h4"}>
							Withdrawal of SUPS are currently paused while we transition over to the Ethereum network. Sorry for any inconvenience
							caused.
						</Typography>
						{/*<WithdrawSups*/}
						{/*	setCurrentTransferState={setCurrentTransferState}*/}
						{/*	currentTransferState={currentTransferState}*/}
						{/*	withdrawAmount={withdrawAmount}*/}
						{/*	setWithdrawAmount={setWithdrawAmount}*/}
						{/*	setError={setError}*/}
						{/*	setCurrentTransferHash={setCurrentTransferHash}*/}
						{/*	setLoading={setLoading}*/}
						{/*	user={user}*/}
						{/*	send={send}*/}
						{/*	state={state}*/}
						{/*/>*/}
					</Box>
				</Paper>
			</Box>
		</Box>
	)
}
