import { Box, Typography } from "@mui/material"
import { BigNumber } from "ethers"
import React, { useEffect, useState } from "react"
import { API_ENDPOINT_HOSTNAME } from "../config"
import { SocketState, WSSendFn } from "../containers/socket"
import { transferStateType, User } from "../types/types"
import { EarlyContributorSignMessage } from "./earlyContributorSignMessage"
import { EarlySaftAgreement } from "./earlySaftAgreement"
import { GradientCircleThing } from "./home/gradientCircleThing"
import { Loading } from "./loading"
import { WithdrawSupsForm } from "./withdrawSupsForm"

interface WithdrawSupsProps {
	setCurrentTransferState: React.Dispatch<React.SetStateAction<transferStateType>>
	currentTransferState: string
	withdrawAmount: BigNumber
	setWithdrawAmount: React.Dispatch<React.SetStateAction<BigNumber>>
	setError: React.Dispatch<React.SetStateAction<string>>
	setCurrentTransferHash: React.Dispatch<React.SetStateAction<string>>
	setLoading: React.Dispatch<React.SetStateAction<boolean>>
	user: User | undefined
	state: SocketState
	send: WSSendFn
}

interface EarlyContributorCheck {
	key: string
	value: boolean
	has_signed: boolean
	agreed: boolean
}

export const WithdrawSups = ({
	setCurrentTransferState,
	currentTransferState,
	withdrawAmount,
	setWithdrawAmount,
	setError,
	setCurrentTransferHash,
	setLoading,
	user,
	state,
	send,
}: WithdrawSupsProps) => {
	const [signed, setSigned] = useState(false)
	const [loadingEarlyCheck, setLoadingEarlyCheck] = useState<boolean>(true)
	const [agreed, setAgreed] = useState(false)
	const [isEarly, setIsEarly] = useState<boolean>(false)
	const [showUserDisagree, setShowUserDisagree] = useState<boolean>(false)
	const [showSignMessage, setShowSignMessage] = useState<boolean>(false)
	const [showWithdrawSupsForm, setShowWithdrawSupsForm] = useState<boolean>(false)
	const [showAgreement, setShowAgreement] = useState<boolean>(false)
	const [readAgreement, setReadAgreement] = useState<boolean>(false)

	useEffect(() => {
		;(async () => {
			const resp = await fetch(`${window.location.protocol}//${API_ENDPOINT_HOSTNAME}/api/early/check?address=${user?.public_address}`)
			const body = (await resp.clone().json()) as EarlyContributorCheck
			if (!body.value) {
				setIsEarly(false)
				setSigned(true)
				setAgreed(true)
				setLoadingEarlyCheck(false)
				setReadAgreement(true)
				return
			}
			setIsEarly(true)
			setSigned(body.has_signed)
			setAgreed(body.agreed)
			setReadAgreement(body.has_signed)
			setLoadingEarlyCheck(false)
		})()
	}, [])

	const ShowComponents = () => {
		setShowUserDisagree(!agreed && isEarly && signed)
		setShowSignMessage(!signed && isEarly && readAgreement)
		setShowWithdrawSupsForm(signed && agreed)
		setShowAgreement(!signed && !readAgreement)
	}

	useEffect(() => {
		ShowComponents()
	}, [agreed, isEarly, signed, readAgreement])

	if (loadingEarlyCheck) return <Loading text="Loading User Data" />

	return (
		<Box component="div" sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "3em", width: "100%" }}>
			{showAgreement && <EarlySaftAgreement setReadAgreement={setReadAgreement} />}

			{showUserDisagree && (
				<>
					<Typography variant="body1" sx={{ color: "primary" }}>
						You have declined the SAFT agreement. Please contact team@supremacy.game for your refund.
					</Typography>
				</>
			)}

			{showSignMessage && (
				<>
					<EarlyContributorSignMessage setSigned={setSigned} setAgreed={setAgreed} />
				</>
			)}

			{showWithdrawSupsForm && (
				<>
					<WithdrawSupsForm
						currentTransferState={currentTransferState}
						withdrawAmount={withdrawAmount}
						setWithdrawAmount={setWithdrawAmount}
						setLoading={setLoading}
						setCurrentTransferHash={setCurrentTransferHash}
						setCurrentTransferState={setCurrentTransferState}
						setError={setError}
						user={user}
						state={state}
						send={send}
					/>
				</>
			)}
		</Box>
	)
}
