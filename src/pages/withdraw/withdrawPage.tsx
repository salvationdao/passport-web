import { Box, Paper } from "@mui/material"
import React, { useState } from "react"
import { GradientCircleThing } from "../../components/home/gradientCircleThing"
import { Navbar } from "../../components/home/navbar"
import { TransactionResultOverlay } from "../../components/transferStatesOverlay/transactionResultOverlay"
import { WithdrawSups } from "../../components/withdrawSups"
import { useAuth } from "../../containers/auth"
import { useWebsocket } from "../../containers/socket"
import { useWeb3 } from "../../containers/web3"
import { transferStateType } from "../../types/types"

export const WithdrawPage = () => {
	const { account } = useWeb3()
	const { user } = useAuth()
	const { send, state } = useWebsocket()

	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")

	//TODO: set this transferstate to "none" when withdrawSUPs functionality becomes available
	const [currentTransferState, setCurrentTransferState] = useState<transferStateType>("none")
	const [loading, setLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>("")
	const [withdrawAmount, setWithdrawAmount] = useState<string>()

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
					<GradientCircleThing
						sx={{ position: "absolute", height: "100%", maxHeight: "950px", maxWidth: "950px", display: { xs: "none", xl: "block" } }}
						hideInner
					/>
					<TransactionResultOverlay
						currentTransferState={currentTransferState}
						setCurrentTransferState={setCurrentTransferState}
						currentTransferHash={currentTransferHash}
						confirmationMessage={`Withdrawing ${withdrawAmount ? withdrawAmount : "NONE"} $SUPS from wallet address: ${account} to Alpha Citizen ${
							user?.username
						}.`}
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
