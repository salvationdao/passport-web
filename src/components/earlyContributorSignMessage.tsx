import { Box, Checkbox, Input, InputLabel, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { useWeb3 } from "../containers/web3"
import { EarlyContributorErrorModal } from "./earlyContributorErrorModal"
import { EarlyContributorModal } from "./earlyContributorModal"
import { FancyButton } from "./fancyButton"
import { Loading } from "./loading"

interface EarlyContributorProps {
	setSigned: React.Dispatch<React.SetStateAction<boolean>>
	setAgreed: React.Dispatch<React.SetStateAction<boolean>>
}

export const EarlyContributorSignMessage: React.FC<EarlyContributorProps> = ({ setSigned, setAgreed }) => {
	const { signEarlyContributors, wcProvider } = useWeb3()
	const [canSign, setCanSign] = useState(false)
	const [email, setEmail] = useState<string>()
	const [name, setName] = useState<string>()
	const [phone, setPhone] = useState<string>()
	const [agree, setAgree] = useState<boolean>(false)
	const [decline, setDecline] = useState<boolean>(false)
	const [showModal, setShowModal] = useState<boolean>(false)
	const [checked, setChecked] = useState<boolean>(false)
	const [wcLoading, setWcLoading] = useState<boolean>(false)
	const [errorSigning, setErrorSigning] = useState<boolean>(false)
	const currentDay = new Date()

	useEffect(() => {
		if (agree || decline) {
			setChecked(true)
		} else {
			setChecked(false)
		}
	}, [agree, decline])

	const signedSAFT = async () => {
		try {
			if (email && name && phone) {
				return await signEarlyContributors(name, phone, email, agree, setErrorSigning)
			}
		} catch (e) {
			console.error(e)
		}
		return false
	}

	const signMessage = async (name?: string, phone?: string, email?: string) => {
		if (email && name && phone) {
			if (!agree) {
				setShowModal(true)
				return
			}
			if (wcProvider) setWcLoading(true)
			const signed = await signedSAFT()
			setAgreed(signed)
			if (wcProvider) setWcLoading(false)

			if (signed) setSigned(signed)
		}
	}

	const emailOnChange = (email: string) => {
		const atIndex = email.indexOf("@")

		if (atIndex >= 1 && email.length >= 5) {
			setEmail(email)
			setCanSign(true)
		} else {
			setCanSign(false)
		}
	}

	const modalOnClose = () => {
		setShowModal(false)
	}

	const handleClickAgree = () => {
		if (!decline) {
			setAgree(!agree)
			return
		}
		setAgree(!agree)
		setDecline(!decline)
	}

	const handleClickDecline = () => {
		if (!agree) {
			setDecline(!decline)
			return
		}
		setAgree(!agree)
		setDecline(!decline)
	}

	return (
		<>
			<EarlyContributorErrorModal open={errorSigning} />
			<EarlyContributorModal open={showModal} onClose={modalOnClose} signedSAFT={signedSAFT} />
			<Box sx={{ position: "relative", width: "100%", maxWidth: "45em" }}>
				{wcLoading && (
					<Box sx={{ position: "absolute", top: "50%", right: "25%", left: "25%" }}>
						<Loading text="Check wallet to sign signature" />
					</Box>
				)}
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						flexDirection: "column",
						gap: "2em",
						filter: wcLoading ? "blur(3px)" : "unset",
						opacity: wcLoading ? "0.2" : "1",
					}}
				>
					<Typography variant="h3">Early Contributor SAFT Agreement</Typography>

					<Box sx={{ display: "flex", width: "100%", gap: "2em", justifyContent: "center" }}>
						<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "column" }}>
							<InputLabel htmlFor="name">Full Name</InputLabel>
							<Input
								id="name"
								onChange={(e) => {
									setName(e.currentTarget.value)
								}}
							/>
						</Box>
						<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "column" }}>
							<InputLabel htmlFor="mobile-number">Mobile Number</InputLabel>
							<Input
								type="number"
								id="mobile-number"
								onChange={(e) => {
									setPhone(e.currentTarget.value)
								}}
							/>
						</Box>
					</Box>
					<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "column" }}>
						<InputLabel htmlFor="email">Email</InputLabel>
						<Input
							id="email"
							type="email"
							onChange={(e) => {
								emailOnChange(e.currentTarget.value)
							}}
						/>
					</Box>
					<Box>
						<Typography variant="body1">Date: {currentDay && currentDay.toDateString()}</Typography>
					</Box>
					<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "column", gap: "0.5em" }}>
						<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
							<Checkbox
								id="agree"
								onChange={() => {
									handleClickAgree()
								}}
								checked={agree}
							/>

							<InputLabel htmlFor="agree">I ACCEPT the above agreement</InputLabel>
						</Box>
						<Box sx={{ display: "flex", width: "100%", justifyContent: "center", flexDirection: "row", alignItems: "center" }}>
							<Checkbox
								id="decline"
								onChange={() => {
									handleClickDecline()
								}}
								checked={decline}
							/>
							<InputLabel htmlFor="decline">I DECLINE the above agreement</InputLabel>
						</Box>
					</Box>

					<FancyButton disabled={email && name && phone && checked && canSign ? false : true} onClick={() => signMessage(name, phone, email)}>
						Sign Message
					</FancyButton>
				</Box>
			</Box>
		</>
	)
}
