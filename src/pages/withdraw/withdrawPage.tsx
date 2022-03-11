import { Box, Paper } from "@mui/material"
import { BigNumber } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import React, { useEffect, useState } from "react"
import { Navbar } from "../../components/home/navbar"
import { TransactionResultOverlay } from "../../components/transferStatesOverlay/transactionResultOverlay"
import { WithdrawSups } from "../../components/withdrawSups"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { useAuth } from "../../containers/auth"
import { useWebsocket } from "../../containers/socket"
import { useWeb3 } from "../../containers/web3"
import { AddressDisplay } from "../../helpers/web3"
import { transferStateType } from "../../types/types"

interface CanEnterResponse {
	can_withdraw: boolean
}

export const WithdrawPage = () => {
	const { account } = useWeb3()
	const { user } = useAuth()
	const { send, state } = useWebsocket()

	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")

	//TODO: set this transferstate to "none" when withdrawSUPs functionality becomes available
	const [currentTransferState, setCurrentTransferState] = useState<transferStateType>("none")
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>("")
	const [withdrawAmount, setWithdrawAmount] = useState<BigNumber>(BigNumber.from(0))

	useEffect(() => {
		try {
			;(async () => {
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/withdraw/check`)
				const body = (await resp.clone().json()) as CanEnterResponse
				if (body.can_withdraw) {
					setCurrentTransferState("none")
					return
				}
			})()
		} catch (e) {
			console.error(e)
		}
	}, [])

	return (
		<div>
			<Navbar sx={{ marginBottom: "2rem" }} />
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					flexWrap: "wrap",
					padding: "0 3rem",
					"@media (max-width: 630px)": {
						flexDirection: "column",
						alignItems: "stretch",
					},
				}}
			>
				<Paper
					sx={{
						width: "100%",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						height: "100vh",
						position: "relative",
					}}
				>
					{/* <GradientCircleThing
						sx={{ position: "absolute", height: "100%", maxHeight: "950px", maxWidth: "950px", display: { xs: "none", xl: "block" } }}
						hideInner
					/> */}
					<TransactionResultOverlay
						currentTransferState={currentTransferState}
						setCurrentTransferState={setCurrentTransferState}
						currentTransferHash={currentTransferHash}
						confirmationMessage={`Withdrawing ${withdrawAmount ? formatUnits(withdrawAmount) : "NONE"} $SUPS from users: ${
							user?.username
						} to wallet address: ${account ? AddressDisplay(account) : null}.`}
						error={error}
						loading={loading}
					/>
					<Box
						sx={{
							width: "80%",
							maxWidth: "750px",
							position: "relative",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						<WithdrawSups
							setCurrentTransferState={setCurrentTransferState}
							currentTransferState={currentTransferState}
							withdrawAmount={withdrawAmount}
							setWithdrawAmount={setWithdrawAmount}
							setError={setError}
							setCurrentTransferHash={setCurrentTransferHash}
							setLoading={setLoading}
							user={user}
							send={send}
							state={state}
						/>
					</Box>
				</Paper>
			</Box>
		</div>
	)
}
