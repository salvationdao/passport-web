import { Alert, Box, Paper, Typography } from "@mui/material"
import { BigNumber } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import React, { useEffect, useState } from "react"
import Safe from "../../assets/images/gradient/safeLarge.png"
import { FancyButton } from "../../components/fancyButton"
import { Navbar } from "../../components/home/navbar"
import { TransactionResultOverlay } from "../../components/transferStatesOverlay/transactionResultOverlay"
import { WithdrawSups } from "../../components/withdrawSups"
import { API_ENDPOINT_HOSTNAME } from "../../config"
import { useAuth } from "../../containers/auth"
import { useWeb3 } from "../../containers/web3"
import { AddressDisplay } from "../../helpers/web3"
import { usePassportCommandsUser } from "../../hooks/usePassport"
import { transferStateType } from "../../types/types"

interface CheckCanWithdrawResp {
	withdrawals_enabled: boolean
	withdrawal_chain: number
	withdrawal_contract_address: string
	token_contract_address: string
}

export const WithdrawPage: React.FC = () => {
	const { account } = useWeb3()
	const { user } = useAuth()
	const { state, send } = usePassportCommandsUser("/commander")

	const [currentTransferHash, setCurrentTransferHash] = useState<string>("")

	const [checkCanWithdrawResp, setCheckCanWithdrawResp] = useState<CheckCanWithdrawResp>()
	const [currentTransferState, setCurrentTransferState] = useState<transferStateType>("unavailable")
	const [loading, setLoading] = useState<boolean>(false)
	const [loadingError, setLoadingError] = useState<string>()
	const [error, setError] = useState<string>("")
	const [withdrawAmount, setWithdrawAmount] = useState<BigNumber>(BigNumber.from(0))

	useEffect(() => {
		;(async () => {
			try {
				setLoading(true)
				const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/withdraw/check`)
				if (resp.status === 200) {
					const body = (await resp.json()) as CheckCanWithdrawResp
					setCheckCanWithdrawResp(body)
					if (body.withdrawals_enabled) setCurrentTransferState("none")
				} else {
					setLoadingError("Unable to get withdrawal details, please try again or contract support.")
				}
			} catch (e) {
				console.error(e)
				setLoadingError(typeof e === "string" ? e : "Unable to get withdrawal details, please try again or contract support.")
			} finally {
				setLoading(false)
			}
		})()
	}, [])

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
					{checkCanWithdrawResp && checkCanWithdrawResp.withdrawals_enabled && (
						<TransactionResultOverlay
							chain={checkCanWithdrawResp.withdrawal_chain.toString()}
							currentTransferState={currentTransferState}
							setCurrentTransferState={setCurrentTransferState}
							currentTransferHash={currentTransferHash}
							confirmationMessage={`Withdrawing ${withdrawAmount ? formatUnits(withdrawAmount) : "NONE"} $SUPS from users: ${
								user?.username
							} to wallet address: ${account ? AddressDisplay(account) : null}.`}
							error={error}
							loading={loading}
						/>
					)}
					<Box
						sx={{
							width: "80%",
							maxWidth: "750px",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
						}}
					>
						{loadingError && <Alert severity={"error"}>{loadingError}</Alert>}
						{checkCanWithdrawResp && !checkCanWithdrawResp.withdrawals_enabled && (
							<Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
								<Box
									component="img"
									src={Safe}
									alt="Image of a Safe"
									sx={{
										height: "12rem",
										width: "12rem",
									}}
								/>
								<Typography>
									{`Withdrawals are currently unavailable as $SUPS are migrating from the Binance Smart Chain to Ethereum Mainnet.  
									Withdrawals to Ethereum Mainnet will be enabled on November 15th 2022.`}
								</Typography>
								<FancyButton href={"https://supremacy.game/news/announcing-the-supremacy-sustainability-roadmap"}>
									Learn more here
								</FancyButton>
							</Box>
						)}
						{checkCanWithdrawResp && checkCanWithdrawResp.withdrawals_enabled && (
							<WithdrawSups
								chain={checkCanWithdrawResp.withdrawal_chain}
								withdrawalContractAddress={checkCanWithdrawResp.withdrawal_contract_address}
								tokenContractAddress={checkCanWithdrawResp.token_contract_address}
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
						)}
					</Box>
				</Paper>
			</Box>
		</Box>
	)
}
